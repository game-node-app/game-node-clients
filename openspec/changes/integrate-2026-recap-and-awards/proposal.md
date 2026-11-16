# Proposal

## Why

O canvas "Eventos 2026 · Retrospectiva + Awards" (Figma `ikcThguwowTdynGz0L2YkS`, nó `5407:677`) define dois eventos de fim de ano que se cruzam: o Awards 2026 (indicações, votação, resultado) e a Retrospectiva 2026 (abre em meados de novembro e atualiza todo dia até 31 dez). O `game-node-server` já implementa o contrato (change `add-2026-recap-and-awards-events`, `handoff-clients.md` e o apêndice `figma-frames.md`). Os clientes ainda tratam só votação e resultado, adivinham o ano pelo mês, liberam a Retrospectiva só em dezembro e não têm cédula com contexto de jogo, indicações, placar, stories nem as notificações novas.

## What Changes

**Contrato e dados**
- Atualizar `packages/wrapper/input/server_swagger.json` com o contrato do servidor e regenerar `@repo/wrapper` (novos `AwardsService`/`RecapService`, DTOs de cédula, indicações, placar, Recap estendido, metas e janela da Retrospectiva).
- Novos hooks por recurso em `@repo/ui`: evento atual (`events/current`), categorias, indicações, cédula, voto, cédula compartilhada, resultados, placar, janela atual da Retrospectiva, status, Recap, metas. Fase vem sempre do campo `phase` do servidor; os cálculos por data em `useRunningAwardEvent`, `useAwardEventRedirect`, `AwardsPhaseNotice`, `useCurrentRecapStatus` e `DynamicRecapOverview` são removidos.
- Utilitários compartilhados: conversão de nota 0–5 → 0–10, identificação do GOTY global por `CATEGORIES.isGOTY`, ordem de exibição por `order`, contagem de jogos por `topGames.length`.

**Entradas (Home, Dock, menu mobile)**
- Home web e mobile: uma única seção "Acontecendo no GameNode" logo após a busca, com 0 a 2 cards de evento (Wide quando há um, Half + Half quando há dois; carrossel no mobile), nos 15 estados do componente `Home/Event Card`. Sem card nos períodos mortos (`upcoming`, `nominations_closed`, `voting_closed`), depois da cédula completa (até o resultado) e depois do fim da temporada. Substitui `DynamicAwardsOverview` e `DynamicRecapOverview`.
- Dock web (opção A do design): "Awards 2026" em "Descobrir" com badge "Ao vivo"/"Novo"; "Retrospectiva" no lugar de "Wrapped" em "Seu espaço" com badge "Nova" até a primeira visita. Fora da temporada o Dock volta ao normal. O menu lateral mobile aplica as mesmas regras.
- Visitantes: card do Awards com "Entrar para votar" e teaser da Retrospectiva ("Crie sua conta e veja seu ano"); nada personalizado.

**Awards**
- **BREAKING (UI)**: nova cédula web/mobile (`/awards/:year/vote`) baseada em `GET /ballot`: lista de categorias com progresso, painel da categoria com filtro "Todos"/"Que joguei", cards de indicado com status jogado/lista/não jogou, horas e nota, barra de voto "Confirmar e ir para a próxima", sugestão de GOTY pessoal e busca livre só no GOTY pessoal e em eventos sem indicações. Substitui `AwardsEventVoteScreen`, `AwardsEventCategoriesList` e o modal de voto por busca.
- Nova tela de indicações (`/awards/:year/nominations`), sem frame no Figma: reaproveita o layout da cédula com busca de jogos elegíveis e até 3 indicações por categoria.
- **BREAKING (UI)**: novo resultado (`/awards/:year/result`): vencedor do Jogo do Ano em destaque, alternância "Todos os votos"/"Só quem jogou", nota de disputa entre quem jogou, "Seu placar" com acertos e chips por categoria, card do GOTY pessoal e compartilhamento do placar.
- Cédula compartilhada pública (`/awards/:year/nominees/:userId`, rota mantida) passa a ler `GET /votes/:userId`.
- `/awards/:year` redireciona pela `phase`.

**Retrospectiva**
- **BREAKING (UI)**: nova página `/recap/:year/:userId` (seções Hero com "Seu ano em N nós", Jogo do ano + top 5, Calendário, Você vs. comunidade, Gêneros/Plataformas, Backlog, cross-link com a cédula e Meta para o próximo ano). Substitui `RecapStatsScreen`.
- Cinco stories (`/recap/:year/:userId/stories`) renderizados no cliente e compartilháveis como imagem 1080×1920; "Baixar card" exporta o story 5.
- Metas anuais: ler e salvar `target` na seção "Meta para {ano+1}".

**Notificações**
- Conteúdo, ícone e navegação para `awards.milestone`, `recap.milestone` e `goal.reminder` em pt-BR/en, sem consultas por item.

**Admin**
- Formulário de evento com datas de indicação e corte de elegibilidade; categoria com `nomineeCount`; edição da abertura da Retrospectiva por ano.

## Capabilities

### New Capabilities
- `season-event-entries`: Cards de evento da Home, entradas e badges do Dock web e do menu mobile, regras de período morto, de fim de temporada e de visitante.
- `awards-nominations`: Tela de indicações da comunidade (escolha, limite, elegibilidade, salvar e limpar).
- `awards-ballot`: Cédula autenticada com contexto de jogo, progresso, voto restrito aos indicados, GOTY pessoal e cédula compartilhada pública.
- `awards-results`: Resultado por categoria, visão "só quem jogou", placar pessoal e compartilhamento.
- `year-recap-page`: Página da Retrospectiva anual com suas seções, estados por fase e tratamento de Recaps antigos.
- `year-recap-stories`: Os cinco stories da Retrospectiva e a exportação como imagem.
- `year-goals`: Meta anual de jogos zerados lida e salva na Retrospectiva.
- `awards-event-admin`: Configuração no admin do calendário do Awards, do número de indicados e da abertura da Retrospectiva.

### Modified Capabilities
- `notification-inbox`: Adiciona a apresentação e a navegação das notificações de sistema do Awards, da Retrospectiva e da meta.

## Impact

- **Wrapper**: `packages/wrapper/input/server_swagger.json` e `packages/wrapper/src/server/**` regenerados. O swagger do servidor ainda não contém as rotas novas: é preciso gerá-lo a partir do working tree de `game-node-server` (`add-2026-recap-and-awards-events`).
- **UI compartilhada**: `packages/ui/src/components/awards/**` (reescrita de hooks, cédula, resultado, cédula compartilhada; nova pasta de indicações), `packages/ui/src/components/recap/**` (página, stories, metas), novo `packages/ui/src/components/events/**` (cards e regras de temporada), `packages/ui/src/components/notifications/util/{getNotificationContent,navigateToNotificationTarget}.ts`. Reaproveita a exportação por imagem de `packages/ui/src/components/wrapped/card`.
- **Web**: `pages/home`, `pages/awards/[year]/**` (nova `nominations`), `pages/recap/[year]/[userId]/**` (nova `stories`), `components/general/shell/navbar/dockItems.ts` e `Dock*`.
- **Mobile**: `pages/home.tsx`, `pages/awards/*`, `pages/recap/*`, `pages/routes/getCommonRoutes.tsx`, `components/sidebar/MobileSidebarMenu.tsx`.
- **Admin**: `components/awards/form/*`, nova tela de edição da Retrospectiva.
- **Locales**: novas chaves em `en.json` e `pt-BR.json`, `yarn locales:generate-types`.
- **Servidor (dependência)**: deploy de `add-2026-recap-and-awards-events` antes dos clientes; pedido de um campo `milestone` no `preview` das notificações (ver design).
- Sem dependências novas. Changeset para `web`, `mobile` e `admin`.
