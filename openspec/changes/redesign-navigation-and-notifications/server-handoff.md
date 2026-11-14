# Hand-off: pendências de servidor para notificações

> **Status: implementado** em `game-node-server` (ainda sem commit no momento da revisão): os cinco itens, com `tsc` e 126 testes passando. Diferenças em relação ao pedido:
> - Item 4: a coluna foi entregue como `coverUrl: string | null`, com backfill pela migração `1795100000000-AddNotificationGameCoverUrl`.
> - Item 5: `avatarVideo` ficou de fora; o cliente mostra só a imagem.
> - Item 2: a resposta `{ success, unreadCount }` não tem schema no Swagger (`200` sem `content`), e o body é `required: true`. Pedir `@ApiOkResponse` ou o cliente tipa a resposta localmente.
> - O `server_swagger.json` foi mesclado à mão para os caminhos de notificação. Regenerar com `yarn start` antes de copiar para o cliente.
>
> O alinhamento do cliente está incorporado em `design.md` (Decisões 0 e 5), em `specs/notification-center`, em `specs/notification-inbox` e nos grupos 0 e 2 de `tasks.md`. A tabela no fim deste documento ficou como histórico.

Destino: `game-node-server`, módulo `src/notifications` (mais `follow` e `game`).
Origem: change `redesign-navigation-and-notifications` em `game-node-clients`, que implementa o novo popover e a página de notificações (Figma `ikcThguwowTdynGz0L2YkS`, nó `5206:19001`).

Plano original: os clientes sairiam primeiro, com contornos no próprio cliente. Este documento lista o que o servidor precisa expor para que os clientes deixem os contornos e liguem o que ficou desativado. Cada item é independente e pode virar um PR próprio.

## Estado atual do servidor (referência)

- `GET /v1/notifications` (`NotificationsController.findAll`) aceita só `cursor` e `limit` (`FindNotificationsDto`). A paginação segue `lastEventAt DESC, id DESC`, com refill limitado a `limit * 5` candidatos por elegibilidade (`NOTIFICATION_ELIGIBILITY_SQL`). O cursor é opaco e vinculado ao `userId` (`encodeNotificationCursor`).
- `unreadCount` é calculado em toda leitura (`readVersion < version`, visível e elegível).
- `PATCH /v1/notifications/read` aceita de 1 a 100 itens `{ id, version }` e faz um `UPDATE ... GREATEST(readVersion, version)` por item.
- Atores: `NotificationsService.findAll` busca os perfis com `select: { userId, username, avatar: { id, filename } }`. Falta `extension`, que existe em `PersistedImageDetails`.
- Contexto de jogo: `notifications-projector.service.ts` grava `target.game = { id, name, slug }` no JSON materializado. Não há capa.
- Follow: `UserFollow(followerUserId, followedUserId)` e `FollowService.getStatus` existem, mas a inbox não diz se o destinatário já segue o ator.

## 1. Filtro de não lidas em `GET /v1/notifications`

**Por quê:** a aba "Não lidas" hoje filtra no cliente só as páginas já carregadas. Um usuário com muitas lidas recentes pode ver a aba vazia mesmo com `unreadCount > 0`.

**Contrato:**
- Novo query param opcional `filter: "all" | "unread"`, com padrão `"all"`, validado com `@IsIn` e documentado no Swagger como enum.
- Com `unread`, aplicar `inbox.readVersion < inbox.version` na consulta de candidatos.
- O cursor deve guardar o filtro: incluir `filter` no payload de `encodeNotificationCursor` e rejeitar com 400 um cursor usado com outro filtro.
- A resposta mantém o formato atual. `unreadCount` continua sendo o total, independente do filtro.

**Atenção:**
- A ordenação e o refill não mudam. Conferir o plano da query com o índice `IDX_notification_inbox_pagination` mais o predicado de não lida. Se ficar ruim para inboxes grandes, avaliar um índice `(recipientUserId, isVisible, lastEventAt, id)` com o filtro em memória do banco, ou um índice composto incluindo `readVersion`/`version`.
- Com o refill limitado, uma página pode voltar vazia com `hasMore = true`. Isso já acontece hoje e o cliente segue o cursor.

**Aceite:**
- [ ] Integração: com uma mistura de lidas e não lidas, `filter=unread` retorna só não lidas, em ordem, e o cursor avança sem repetir nem pular itens.
- [ ] Cursor de `all` usado com `unread` (e o inverso) retorna 400.
- [ ] Sem `filter`, o comportamento é idêntico ao atual (testes existentes passam).

## 2. Marcar todas como lidas

**Por quê:** "Marcar todas como lidas" hoje confirma só os itens carregados, em lotes de 100. Isso não cobre a inbox inteira e gera N requisições.

**Contrato:**
- `PATCH /v1/notifications/read-all`, autenticado, com body opcional `{ before?: string }` (ISO 8601).
- Com `before`, marca como lidos (`readVersion = version`) todos os itens visíveis e elegíveis do usuário com `lastEventAt <= before`. Sem `before`, usa o horário do servidor no momento da requisição.
- O cliente envia como `before` o `lastEventAt` do item mais recente que está exibindo, para não marcar como lido algo que chegou depois e que o usuário não viu.
- Resposta: `{ success: true, unreadCount: number }`, com o `unreadCount` recalculado depois do update.

**Atenção:**
- Um único `UPDATE notification_inbox SET readVersion = version WHERE recipientUserId = ? AND isVisible = 1 AND readVersion < version AND lastEventAt <= ?`, mais a regra de elegibilidade se ela for necessária para não confirmar itens ocultos (confirmar se marcar inelegíveis tem efeito colateral; provavelmente não).
- Um item atualizado depois de `before` (nova versão por novo evento) fica não lido porque o `lastEventAt` dele muda. Esse é o comportamento desejado.

**Aceite:**
- [ ] Integração: com itens antes e depois de `before`, só os anteriores ficam lidos e `unreadCount` reflete o restante.
- [ ] Itens de outro usuário não são afetados.
- [ ] Chamar duas vezes é idempotente.

## 3. Estado de follow do ator (libera "Seguir de volta")

**Por quê:** o design mostra o botão "Seguir de volta" em `profile.followed`. Para não fazer uma consulta de follow por item no cliente (regra de zero hidratação da inbox), o servidor precisa enviar esse estado.

**Contrato:**
- `NotificationActorDto` ganha `isFollowedByRecipient: boolean`, opcional no Swagger para compatibilidade.
- É calculado na leitura, em lote: uma consulta `SELECT followedUserId FROM user_follow WHERE followerUserId = :recipient AND followedUserId IN (:actorIds)` sobre todos os atores da página, no mesmo ponto em que hoje se monta `profileMap`.
- Vale para todos os tipos. O cliente só usa em `profile.followed`.

**Atenção:**
- Não materializar na inbox, porque o estado muda quando o usuário segue ou deixa de seguir.
- Ator deletado (`[Deleted User]`) retorna `false`.
- Respeitar bloqueios: se existir regra de bloqueio (`privacy`/`interactions`), retornar o ator como não seguível ou omitir o campo. Confirmar com a regra atual do módulo de privacidade.

**Aceite:**
- [ ] Unitário ou integração: página com dois atores, um seguido pelo destinatário e outro não, retorna `true` e `false`.
- [ ] Uma consulta extra por página, não por ator (verificar no teste ou por log de queries).

## 4. Capa do jogo no contexto do alvo (libera o leading "Cover")

**Por quê:** o design mostra a capa do jogo à esquerda de notificações de atividade ("rafa.games curtiu sua atividade de Elden Ring"). Hoje `target.game` não tem capa, e buscar a capa no cliente seria uma consulta por item.

**Contrato:**
- `NotificationGameContextDto` ganha `coverUrl: string | null`, o valor da coluna `url` de `game_cover` (formato IGDB, ex.: `//images.igdb.com/igdb/image/upload/t_thumb/<imageId>.jpg`). É o mesmo dado que o cliente já recebe em `game.cover.url` e já redimensiona com `getSizedImageUrl(url, ImageSize.X)`, que troca o segmento `t_<tamanho>`. O tamanho gravado não limita o cliente.
- Preencher no projector (`SELECT g.id, g.name, g.slug, c.url AS coverUrl FROM game g LEFT JOIN game_cover c ON c.gameId = g.id WHERE g.id = ?`).
- Backfill dos `target.game` já materializados: migração ou job que atualiza o JSON das linhas com `target.game.id` e sem `coverUrl`. Se o backfill não for viável, documentar que itens antigos retornam `null` e o cliente cai no avatar.

**Atenção:**
- Capas personalizadas por usuário (`user-game-cover.entity.ts`) dependem de quem vê e não entram aqui. O cliente pode aplicá-las depois com o hook de capas que já existe, se fizer sentido.
- O valor reflete a capa padrão do jogo no momento da materialização, como `name` e `slug`. Se o destinatário escolheu uma capa personalizada para esse jogo, a notificação mostra a padrão. Resolver isso exigiria uma consulta em lote na leitura e fica fora deste item.

**Aceite:**
- [ ] Integração: notificação de like em atividade com jogo que tem capa traz `target.game.coverUrl`. Jogo sem capa traz `null`.
- [ ] Linhas antigas: backfill aplicado ou `null` documentado.

## 5. Avatar do ator com extensão

**Por quê:** `NotificationAvatarDto` tem `id` e `filename`, mas o cliente precisa de `filename.extension` para montar a URL (`getS3StoredUpload`). Por isso o item ainda busca o perfil de cada ator (`UserAvatar` → `useUserProfile`).

**Contrato:**
- `NotificationAvatarDto` ganha `extension: string`. Incluir `extension: true` no `select` de `profileRepository.find` em `NotificationsService.findAll`.
- Opcional: `avatarVideo` resumido (`filename`, `extension` ou o formato que o cliente usa em `ProfileVideo`) para atores apoiadores, já que o cliente mostra vídeo no avatar. Se ficar de fora, o cliente mostra só a imagem nas notificações.

**Aceite:**
- [ ] Resposta de `GET /v1/notifications` traz `actors[].avatar.extension` para atores com avatar.

## Compatibilidade e entrega

- Tudo é aditivo: campos novos opcionais, um query param com padrão e um endpoint novo. Clientes atuais não quebram.
- Atualizar o `server_swagger.json` gerado. No cliente, alinhar copiando para `packages/wrapper/input/server_swagger.json` e rodando `yarn wrapper:generate`.

## Alinhamento no cliente depois do servidor

Quando cada item chegar, abrir uma change de follow-up (ou atualizar esta, se ainda não estiver arquivada):

| Item | Mudança no cliente |
|---|---|
| 1. `filter=unread` | `useNotificationsInbox` passa `filter` para a query (chave de query separada por filtro) em vez de filtrar em memória. A aba "Não lidas" pagina pelo servidor. |
| 2. `read-all` | `markAllAsRead` chama o endpoint com `before = lastEventAt` do primeiro item e usa o `unreadCount` retornado. Remove o loop de lotes. |
| 3. `isFollowedByRecipient` | `getNotificationContent` passa a retornar ação "Seguir de volta" em `profile.followed` quando `false`. O clique segue o ator e atualiza o cache. O requisito "Ação dentro da notificação" do spec `notification-center` muda. |
| 4. `coverUrl` | `content.liked`/`comment.*` com alvo de atividade e jogo com capa usam o leading Cover (36 × 42). |
| 5. `avatar.extension` | O leading Avatar monta a URL a partir do DTO, sem `useUserProfile` por ator. |
