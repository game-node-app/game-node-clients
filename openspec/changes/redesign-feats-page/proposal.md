# Proposal

## Why

O Figma (`ikcThguwowTdynGz0L2YkS`, seção "Feitos (Sam)", nó `5342:19790`) redesenha a página de Feitos para desktop e mobile. Hoje a `AchievementsScreen` compartilhada (web `feats/[targetUserId]`, mobile `feats/:userId`) é uma lista de `DetailsBox` paginada com badges circulares, um popover de níveis e um modal de código cru que só mostra um toast. O catálogo v2 (`rework-platform-achievements`) já entrega níveis, progresso, raridade, categorias e eventos. A página nova mostra tudo isso: resumo do perfil e de XP, feitos "Quase lá", eventos, filtros, cards por nível, um modal de níveis com datas e um fluxo de resgate que revela o feito liberado. Duas informações do design ainda não vêm da API (data de cada nível e o feito liberado por um código), então esta change também pede essas duas extensões ao `game-node-server`.

## What Changes

- **Servidor (`game-node-server`, ver `server-handoff.md`)**
  - `GET /v2/achievements/progress/:userId`: cada item ganha `obtainedTiers: { level, obtainedAt }[]`, montado das linhas de `obtained_achievement` (uma por nível).
  - `GET /v1/achievements/code/consume/:code`: passa a responder `{ achievementId, tier }` com `@ApiOkResponse`, em vez de corpo vazio.
- **Wrapper:** copiar o `server_swagger.json` novo e rodar `yarn wrapper:generate`.
- **Nova `AchievementsScreen` em `@repo/ui`** (mesma view no web desktop, web mobile e app nativo, com layout responsivo):
  - Cabeçalho com breadcrumb "Perfil › Feitos", título e subtítulo.
  - Card do perfil: avatar com anel e pill de nível, nome, "Nível N", XP que falta para o próximo, barra de experiência e "Membro desde".
  - Card de resumo: feitos obtidos / total, níveis conquistados, XP vindo de feitos, o feito em destaque no perfil (com "Trocar" para o dono) e "Resgatar um código" (só o dono).
  - "Quase lá": até 3 feitos não completos mais perto do próximo nível, com barra e XP do próximo nível.
  - "Eventos": uma linha por evento ativo ou encerrado em que o usuário obteve feitos, com status e XP ganho; "Eventos passados" abre a lista de todos os eventos encerrados.
  - Filtros: chips por categoria (Todos com contagem, Coleção, Seguidores, Reviews, Comentários, Especiais, Eventos), busca por nome/descrição e segmentado Todos / Obtidos / Bloqueados.
  - Seções "Obtidas" e "Ainda não obtidas" (com contagem de secretos) em grade de 3/2/1 colunas, sem paginação.
  - Card de feito novo: ícone em tile quadrado, badge "Nível N" / "Completa" / categoria, segmentos por nível, barra de progresso, "valor / meta · Nível X de Y", "Próximo nível" ou "Recompensa", raridade ("N% dos usuários") e "Níveis ›". Card de feito secreto mascarado com borda tracejada.
- **Modal de níveis** (sheet no app nativo): tile, badges de nível e categoria, "Rumo ao nível N" com barra e unidade da métrica, tabela/lista de níveis (meta, XP, % de usuários, status "Obtido em data" / progresso / "Bloqueado") e "Destacar no perfil".
- **Novo fluxo de resgate de código:** modal com ícone, texto de ajuda, campo de código, Cancelar/Resgatar, erro inline; no sucesso, notificação verde e tela "Novo feito" com o feito liberado, XP do nível, "Ver meus feitos" e "Destacar no perfil". Os dados da página são invalidados.
- **"Destacar no perfil" substitui o destaque:** envia uma lista com um único id para `PUT /v2/achievements/obtained/featured`; outros destaques saem. O editor de perfil continua permitindo vários.
- `AchievementBadge` ganha a variante `tile` (quadrado arredondado) usada pela página; badges circulares de perfil, notificações e feed não mudam.
- Strings `en`/`pt-BR` novas (incluindo unidades por métrica, com plural) e remoção das chaves que ficarem sem uso.
- Fora de escopo: rotas novas (as URLs `/feats` seguem iguais), compartilhamento de feitos, notificações de evento, o editor de destaques no perfil e as telas de conquistas de jogos externos e do diário.

## Capabilities

### New Capabilities

- `feats-page`: a página de Feitos de um usuário no web e no mobile — resumo de nível e XP, destaque no perfil, "Quase lá", eventos, filtros, cards por nível, modal de níveis e resgate de código. Ela substitui o layout de página descrito pelos requisitos de catálogo e eventos de `platform-achievements` (change `rework-platform-achievements`, ainda não arquivada); badge, segredos e raridade continuam valendo como definidos lá.

### Modified Capabilities

(nenhuma — `openspec/specs` só tem as capacidades do blog; `platform-achievements` ainda não foi arquivada)

## Impact

- `game-node-server`: `src/achievements/dto/achievement-v2.dto.ts`, `achievements-progress.service.ts` (ou o service da v2 que monta o progresso), `achievements-code.controller.ts` / `.service.ts`, `achievements.service.ts#grantAchievement`, testes e Swagger.
- `packages/wrapper`: `input/server_swagger.json` e `src/server` gerado.
- `packages/ui/src/components/achievement/*`: nova screen e subcomponentes (cabeçalho, resumo, quase lá, eventos, filtros, card, modal de níveis, resgate, seletor de destaque), hooks de derivação e mutação, `AchievementBadge` (variante `tile`).
- `packages/locales`: `en.json`, `pt-BR.json` e tipos gerados.
- `apps/web/src/pages/feats/[targetUserId].tsx` (`<Head>`), `apps/mobile/src/pages/feats.tsx` (só se o `AppPage` precisar de ajuste); testes em `apps/mobile/src/components/achievement/`.
- Changeset para `web` e `mobile`. Deploy do servidor antes do release dos clientes.
- Sem dependências novas.
