# Design

## Context

- **Contrato**: `game-node-server`, change `add-2026-recap-and-awards-events` (`handoff-clients.md` e `figma-frames.md`). O código está no working tree do servidor, ainda sem commit e sem deploy. O `server_swagger.json` do servidor e o de `packages/wrapper/input/` ainda **não** têm as rotas novas (`events/current`, `ballot`, `nominations`, `votes/:userId`, `scoreboard`, `recap/current`, `recap/goals`, `recap/admin/editions`).
- **Design**: Figma `ikcThguwowTdynGz0L2YkS`, canvas `5407:677`. Frames usados: Recap web `5415:922`, stories `5413:862`/`5413:917`/`5414:911`/`5413:945`/`5413:983`, cédula `5410:689` (web) e `5412:845` (mobile), resultado `5410:888` e `5412:935`, cards da Home `5444:2410`, Home `5445:1844`/`5445:2032`, Dock `5440:1294` (opção A, recomendada), fluxo `5445:9135`, componentes `5408:695` (Chip), `5408:716` (Nominee Card), `5408:731` (Category Row). Não há frame para indicações, para uma página de placar nem para a inbox.
- **Clientes hoje**: `useRunningAwardEvent` adivinha o ano pelo mês (outubro em diante) e só conhece votação e resultado; `useAwardEventRedirect`, `AwardsPhaseNotice`, `useCurrentRecapStatus` e `DynamicRecapOverview` repetem cálculos de data (a Retrospectiva só libera em dezembro). A Home renderiza `DynamicAwardsOverview` e `DynamicRecapOverview` depois de "Reviews em alta". O voto é um modal de busca livre por categoria. O Dock web vem de uma lista estática (`dockItems.ts`) com `isNew`, e o menu mobile usa os mesmos hooks antigos.
- **Infra reaproveitável**: `packages/ui/src/components/wrapped/card` já renderiza cards no tamanho nativo com prévia escalada e exporta com `html-to-image` (`RecapCardPreview`, `RECAP_CARD_FORMATS`, `onShare(file)` injetado por app). `useGames` hidrata ids em lote. `GameSelectView` + `useSearchGames` + `buildGameCategoryFilters` já fazem a busca de jogos do ano no voto atual.
- **Calendário real**: hoje é 16 nov 2026. A Retrospectiva 2026 já está aberta por padrão (15 nov); o checklist do servidor sugere indicações 20–28 nov, votação 1–20 dez, resultado 27 dez.

## Goals / Non-Goals

**Goals:**
- Uma camada de dados única (hooks + funções puras de fase/temporada) consumida por Home, Dock, menu mobile e telas, sem nenhuma regra baseada no mês corrente.
- Entregar em ondas alinhadas ao calendário, cada uma publicável sozinha.
- Mesma tela compartilhada em `@repo/ui` para web e mobile, com layout responsivo.

**Non-Goals:**
- Páginas OG/prévia, imagem gerada no servidor, SSR das telas novas (continuam client-side como hoje).
- Estado "Em andamento" de biblioteca na cédula (o servidor reporta `ongoing` sem datas como `planned`).
- Dificuldade ("no difícil") e fontes conectadas para visitantes (o servidor não fornece).
- Card de evento "em breve" antes da primeira fase, e estado de espera da Retrospectiva na Home (sem frame).
- Página dedicada de placar e reprodução automática dos stories.

## Decisions

### 1. Entrega em ondas pelo calendário
Ordem: (1) wrapper, dados, entradas, Retrospectiva, stories, metas e notificações — a Retrospectiva já está `live`; (2) indicações e admin, antes de `nominationStartDate`; (3) cédula, antes de `votingStartDate`; (4) resultado, antes de `resultsDate`. Cada onda remove só o que substitui, e as telas de fases futuras continuam funcionando com os hooks novos (ex.: o card do Awards só aparece em fases cujas telas já existem; as entradas de uma fase sem tela levam a `/awards/:year`).
*Alternativa*: uma única entrega no fim. Rejeitada: a Retrospectiva já está aberta e as indicações começam em dias.

### 2. Camada de dados
Hooks em `components/awards/hooks` e `components/recap/hooks`, seguindo o padrão do repo (chave hierárquica, `enabled`, `ExtendedUseQueryResult` onde há invalidação):

| Hook | Chave | Notas |
| --- | --- | --- |
| `useCurrentAwardsEvent` | `["awards","event","current"]` | 404 → `null` dentro do `queryFn` (sem erro); `staleTime` 5 min, porque a fase muda com o tempo |
| `useAwardEvent` (existente) | `["awards","event",year,id]` | passa a expor `phase` |
| `useAwardEventCategories` (existente) | `["awards","event",id,"categories"]` | |
| `useAwardsBallot(eventId)` | `["awards",eventId,"ballot",userId]` | `enabled: !!userId`; `staleTime` 1 min |
| `useAwardsNominations(eventId)` | `["awards",eventId,"nominations",userId]` | |
| `useAwardsSharedVotes(eventId,userId)` | `["awards",eventId,"votes",userId]` | público |
| `useAwardsResults(eventId)` | `["awards",eventId,"results"]` | substitui `useAwardCategoryResults` |
| `useAwardsScoreboard(eventId,userId)` | `["awards",eventId,"scoreboard",userId]` | 404 → `null` |
| `useCurrentRecapWindow` | `["recap","current"]` | `staleTime` 5 min |
| `useRecapStatus` (existente) | `["recap","status",userId,year]` | passa a expor `phase` |
| `useRecap` (existente) | `["recap",year,userId]` | `enabled` só com `isRecapCreated` |
| `useRecapGoal(year)` | `["recap","goals",year,userId]` | |

Mutações: voto (otimista na cédula: `voteGameId`, `categoriesVoted`, `playedNomineesCount` intacto), indicações (otimista em `nominations/me`), meta (`setQueryData` com a resposta). Todas com `createErrorNotification`. Testes: vitest em `apps/mobile` com `vi.spyOn(AwardsService|RecapService, …)`.
*Alternativa*: um endpoint agregador no cliente via `useQueries`. Rejeitada: os consumidores precisam de recortes diferentes e o cache por recurso já evita leituras duplicadas.

### 3. Regras de temporada como funções puras
`packages/ui/src/components/events/util/seasonEvents.ts` concentra as regras de `season-event-entries`: `getAwardsEntry(event, ballot, categories, now)` → `{ kind: "nominations" | "voting" | "results", showHomeCard, dockBadge: "live" | "new" | null, href } | null`; `getRecapEntry(window, status, now)` → `{ kind: "live" | "closed", year } | null`; `AWARDS_SEASON_DAYS_AFTER_RESULTS = 31` e `RECAP_SEASON_DAYS_AFTER_CLOSE = 27` (reproduzem o "até 27 jan" do design a partir de 27 dez e 31 dez). `useSeasonEvents()` compõe as leituras e devolve as duas entradas; Home, Dock e menu mobile só leem esse hook. A cédula só é lida quando há sessão e a fase é `voting`.
*Alternativa*: datas fixas de temporada (3 nov–31 jan). Rejeitada: as datas do evento são dados editáveis no admin.

### 4. Home: uma seção, um componente de card
`HomeEventsSection` (em `components/events`) decide 0/1/2 cards e o layout: web `wide` ou `half`+`half`; mobile carrossel `@mantine/carousel` com cards de 300 px e espiada. `EventCard` recebe `kind` × `layout` e monta as cinco variantes do frame `5444:2410` com subcomponentes (`EventCardCovers`, `EventPhaseTimeline`, `RecapMonthlyBars`). A seção entra logo após a busca na Home web e no topo do `Stack` da Home mobile, substituindo `DynamicAwardsOverview`/`DynamicRecapOverview`, que são removidos com `useRunningAwardEvent`, `useCurrentRecapStatus` e `AwardsPhaseNotice`.

### 5. Dock e menu mobile
`dockItems.ts` continua estático para os itens fixos; um `useDockGroups()` injeta "Awards {ano}" após "Início" em "Descobrir" e troca o item `recap` (Wrapped → Retrospectiva, `href` `/recap/{ano}/{userId}`, ícone `IconHistory`) conforme `useSeasonEvents()`. `DockItemDefinition.isNew` vira `badge?: "new" | "live" | "newFeminine"` com rótulos traduzidos ("Novo", "Ao vivo", "Nova"); o ponto no Dock recolhido continua igual. Ícone do Awards: `IconAward` (Tabler, como no design). O "visto" da Retrospectiva é `localStorage` `gamenode.recap.visited.{year}` (lido com `try/catch`), gravado pela página da Retrospectiva quando o dono a abre. `MobileSidebarMenu` lê o mesmo hook.
*Alternativa*: estado de badge no servidor. Fora do contrato (o servidor deixa explicitamente para o cliente).

### 6. Cabeçalho comum das telas de evento
`SeasonEventHeader` mostra a trilha "Eventos {ano} › {tela}" e o seletor segmentado "Retrospectiva | Awards", usado pela Retrospectiva, cédula, indicações e resultado. O destino do Awards vem de `getAwardsEntry` para o ano da página; o da Retrospectiva é `/recap/{ano}/{userId logado}` e fica oculto para visitantes.

### 7. Cédula e indicações compartilham o layout
`AwardsBallotScreen` e `AwardsNominationsScreen` usam os mesmos blocos: `AwardsCategoryList` (linhas Active/Voted/Pending do componente `5408:731`), `AwardsCategoryPanel` (cabeçalho "Categoria NN de MM", descrição, filtro segmentado), `AwardsNomineeCard` (Default/Selected, chip de status do `5408:695`) e `AwardsVoteBar`. Abaixo de `md` o layout troca para o mobile do frame `5412:845`: barra segmentada de progresso, uma categoria por vez, barra fixa inferior e a lista de categorias em um `Modal` (presenter injetado, vira `ion-modal` no app). Usar `useMediaQuery` dentro da tela (e não um presenter por app) mantém o mobile web correto.
- Identificação do GOTY global: join `ballot.categories[].id` com `categories[].isGOTY` (gap G1); nada por nome ou `order` 0/1.
- Busca livre (`AwardsEligibleGameSearch`): extraída de `AwardsVoteSubmitForm`, filtrando ano do evento e `eligibilityCutoffDate`; usada no GOTY pessoal, em categorias com `nominees: []` (eventos antigos) e nas indicações. `AwardsVoteSubmitForm`/`Modal`, `AwardsEventCategoriesList`, `AwardsEventCategory`, `AwardsVoteLayout` e `AwardsEventVoteScreen` são removidos.
- Chips: `played` → `teal` light; `planned` → brand light; `not_played` → `gray` light, conforme a regra de cores do `AGENTS.md` (sem `bg-*` ad hoc).

### 8. Resultado e placar
`AwardsResultsScreen` lê resultados + categorias; o usuário do placar é `?user=` ou o logado; o nome vem do perfil quando não for o próprio. Ordena por `category.order` (G18). Destaque = item com `category.isGOTY`. Alternância "Todos/Só quem jogou" reordena por `playedVotesPercentage`; omitida se `totalPlayedVotesCount` for 0/nulo (eventos antigos). `otherUsersCount` é redigido como "outras pessoas" (G16).

### 9. Cédula compartilhada mantém a rota
`/awards/:year/nominees/:userId` continua sendo o link público (links antigos seguem válidos) e passa a ler `votes/:userId` + categorias. O compartilhamento por imagem do fluxo antigo (`AwardsNomineesShareForm`/`Modal`) sai; o design só pede link.
*Alternativa*: manter a imagem. Rejeitada: não há frame e duplicaria a exportação dos stories.

### 10. Página da Retrospectiva
`YearRecapScreen` em `components/recap/year/` com uma seção por bloco do frame `5415:922`. Gráficos em SVG/CSS próprios, sem nova dependência: nós do hero (x = `firstPlayedAt`, raio ∝ √horas, rótulo nos 4 maiores), calendário (grade 53×7 por dia UTC), barras empilhadas de gênero e plataforma. Datas de dia com `dayjs.utc`. `RecapStatsScreen` e `recap/stats/*` são removidos; `mockRecap.ts` passa a gerar o shape novo para o preview de debug.
*Alternativa*: `@mantine/charts`. Rejeitada: os gráficos do design são customizados (nós com capa, heatmap) e o Recharts não ajuda.

### 11. Stories reaproveitam a exportação do Wrapped
Cada story é um componente no tamanho nativo 1080×1920 dentro de `RecapCardPreview` (formato Story já existente), com a moldura do visualizador (barras, fechar, "n / 5") fora do nó exportado. A exportação é extraída de `WrappedRecapScreen` para `exportCardImage(node, format)` e usada pelos dois. `onShare(file)` é injetado pelas páginas web e mobile, como no Wrapped. Navegação por toque, sem timer. Stories sem dados obrigatórios são filtrados antes da numeração. `?story=N` abre um story específico ("Baixar card" usa o último).

### 12. Notificações: `preview.milestone`
O servidor hoje só envia `preview.text` em inglês e `target.phase`; `nominations_open` e `nominations_close_reminder` têm a mesma fase, então o cliente não consegue escolher a cópia certa. Pedimos ao servidor (tarefa nesta change, no repo do servidor) para incluir `preview.milestone` em `awards.milestone` e `recap.milestone`. O cliente usa `milestone` quando existir e cai para uma cópia por fase quando não. `getNotificationContent` e `navigateToNotificationTarget` ganham os três tipos; o awards navega para `/awards/{year}` (o redirect por fase escolhe a tela); a meta navega para `/recap/{year-1}/{userId}#goal`.
*Alternativa*: casar `preview.text` em inglês. Rejeitada: frágil a qualquer mudança de texto.

### 13. Formatação
Utilitários em `components/events/util/format.ts`: horas `Math.round(s / 3600)`; nota `rating × 2` com uma casa e vírgula em pt-BR ("9,0"), sem casa na cédula ("nota 9"); números com `Intl.NumberFormat` do idioma ("4.812"); porcentagens de frações 0–1. Datas do calendário do Awards são exibidas em UTC (os instantes são UTC e terminam em 23:59:59Z).

### 14. Admin
`CreateUpdateAwardsForm` ganha as três datas opcionais com validação zod (par de indicações, ordem, fim ≤ início da votação); `CreateUpdateAwardsCategoryForm` ganha `nomineeCount`; a página de awards do admin ganha um cartão "Retrospectiva" com ano + `opensAt` que chama `PUT /v1/recap/admin/editions/:year` e mostra a janela retornada.

## Risks / Trade-offs

- [Swagger gerado de código sem merge] → Gerar a partir do working tree do servidor e regenerar se o contrato mudar antes do merge; os clientes só sobem depois do deploy do servidor.
- [Servidor sem `preview.milestone`] → Fallback por fase; o lembrete de indicações aparece como "Indicações abertas" até o servidor publicar o campo.
- [Datas reais em cima da hora (indicações a partir de 20 nov)] → Ondas da Decisão 1; o mobile pode sair por OTA (`mobile-ota-live-updates`).
- [Cédula completa exige leitura autenticada para esconder o card] → Só lida em `voting` com sessão; visitante sempre vê o card (G8).
- [Cópia "+1000 XP e medalha" é dado do admin] → Mantida como texto de campanha, conforme o checklist de operação; revisar se o feito mudar.
- [Recap em cache por 15 min no servidor e `staleTime: Infinity` no web] → `staleTime` explícito nas leituras de fase e invalidação de `["recap"]` no pull-to-refresh mobile (já existe).
- [Remoção de componentes do Awards antigo quebra anos anteriores] → A cédula nova trata `nominees: []` com busca livre e o resultado novo omite "só quem jogou" sem dados; verificar com o evento 2025.
- [`localStorage` indisponível] → Leitura e escrita em `try/catch`; sem armazenamento o badge "Nova" some só ao fim da temporada.

## Migration Plan

1. Servidor: gerar o swagger com as rotas novas e publicar `preview.milestone`; deploy de `add-2026-recap-and-awards-events`; operações configuram o calendário (checklist do handoff), incluindo as datas pelo admin novo.
2. Clientes, onda 1 (Retrospectiva, entradas, notificações), depois ondas 2–4 antes de cada fase. Changeset por onda para `web`, `mobile` e `admin`.
3. Rollback: reverter o deploy do cliente. O servidor é retrocompatível (respostas só ganharam campos), exceto o voto restrito a indicados em eventos com indicações, que a UI antiga não respeita; por isso não reverter o cliente durante a votação sem também esconder a entrada do Awards.

## Open Questions

- Texto final das notificações em pt-BR e en (a cópia do design é só pt-BR).
- Se "Ver categorias" no card de indicações deve abrir a mesma tela de indicações (atual) ou uma lista de categorias somente leitura.
