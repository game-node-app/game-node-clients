# Tasks

Ondas (design, Decisão 1): grupos 1–8 = onda 1 (Retrospectiva, entradas, notificações); 9–10 = onda 2 (indicações e admin); 11 = onda 3 (cédula); 12 = onda 4 (resultado). Cada onda termina com lint, type-check, testes e changeset próprios.

## 1. Contrato do servidor

- [x] 1.1 Em `game-node-server` (change `add-2026-recap-and-awards-events`), incluir `milestone` no `preview` de `awards.milestone` e `recap.milestone` no projetor, com teste no spec existente do projetor; verificar com a suíte de notificações do servidor.
- [x] 1.2 Gerar `server_swagger.json` a partir do working tree do servidor, copiar para `packages/wrapper/input/` e rodar `yarn wrapper:generate`; verificar que `AwardsService`/`RecapService` têm `events/current`, `ballot`, `nominations`, `votes/:userId`, `scoreboard`, `recap/current`, `recap/goals` e `recap/admin/editions`, e que `yarn type-check` só falha em usos antigos a serem trocados nas tarefas seguintes.

## 2. Dados e utilitários compartilhados

- [x] 2.1 Adicionar `useCurrentAwardsEvent` (404 → `null`), `useCurrentRecapWindow` e `useRecapGoal`/mutação de meta, e expor `phase` em `useAwardEvent`/`useRecapStatus`, com chaves e `staleTime` do design §2; verificar com testes vitest em `apps/mobile` (spy no service) para 200, 404, sem sessão e invalidação.
- [x] 2.2 Adicionar `useAwardsBallot`, `useAwardsNominations`, `useAwardsSharedVotes`, `useAwardsResults` e `useAwardsScoreboard` (404 → `null`), com `enabled` por sessão; verificar com testes vitest cobrindo sem sessão, sucesso e 404 do placar.
- [x] 2.3 Criar `components/events/util/format.ts` (horas, nota 0–10 com e sem casa, números e porcentagens pelo idioma, datas UTC) e o helper de GOTY global por `isGOTY`; verificar com testes unitários incluindo `4.5 → "9,0"`/`"9"`, `null` sem nota e `4812 → "4.812"` em pt-BR.
- [x] 2.4 Criar `seasonEvents.ts` (`getAwardsEntry`, `getRecapEntry`, constantes de temporada) e `useSeasonEvents()`; verificar com testes unitários para cada linha da tabela de períodos do apêndice (`upcoming`, `nominations`, `nominations_closed`, `voting` incompleta/completa/visitante, `voting_closed`, `results` antes e depois de 31 dias, Recap `live`/`closed`/não criado/fim da temporada).
- [x] 2.5 Regenerar os barrels com `yarn workspace @repo/ui barrels:generate` e verificar que `yarn type-check -F @repo/ui` passa.

## 3. Cabeçalho de evento e textos base

- [x] 3.1 Criar `SeasonEventHeader` (trilha e seletor Retrospectiva | Awards) com as chaves de tradução em `en.json` e `pt-BR.json` e `yarn locales:generate-types`; verificar com teste de componente: seletor oculto para visitante na Retrospectiva e destino do Awards pela fase.

## 4. Entradas: Home

- [x] 4.1 Criar `EventCard` com as variantes Indicações, Votação, Resultado, Retrospectiva Atualizando e Fechada nos layouts wide, half e mobile (frame `5444:2410`), incluindo os estados de visitante; verificar com testes de componente para cada variante, `calendar: null` e visitante sem ações autenticadas.
- [x] 4.2 Criar `HomeEventsSection` (0/1/2 cards, Wide vs Half + Half, carrossel no mobile) e colocá-la após a busca na Home web e no topo da Home mobile, removendo `DynamicAwardsOverview`, `DynamicRecapOverview`, `useRunningAwardEvent`, `useCurrentRecapStatus` e `AwardsPhaseNotice`; verificar com teste de componente (0, 1 e 2 cards) e abrindo `/home` no web com o servidor local.

## 5. Entradas: Dock web e menu mobile

- [x] 5.1 Trocar `isNew` por `badge` em `DockItemDefinition`, adicionar `useDockGroups()` com "Awards {ano}" (`IconAward`) e a troca Wrapped → Retrospectiva (`IconHistory`) e o "visto" em `localStorage`; verificar com testes de unidade dos grupos por fase e com o Dock aberto e recolhido no web.
- [x] 5.2 Atualizar `MobileSidebarMenu` para `useSeasonEvents()` com os mesmos badges e destinos; verificar com teste vitest do menu em `voting` e fora da temporada.
- [x] 5.3 Reescrever `useAwardEventRedirect` pela `phase` (design §5 e spec "Destino por fase"); verificar com teste vitest para cada fase.

## 6. Página da Retrospectiva

- [x] 6.1 Criar `YearRecapScreen` com estados de status (não gerado, não elegível), hero com o gráfico de nós e marcação de visita do dono, e ligar `/recap/[year]/[userId]` no web e `recap_stats` no mobile; atualizar `mockRecap.ts` para o shape novo; verificar com teste de componente dos estados e do hero (`topGames.length`, `isFinal`).
- [x] 6.2 Adicionar as seções Jogo do ano + top 5, Calendário (grade UTC) e Você vs. comunidade, cada uma omitida sem dados; verificar com testes de componente para `calendar: null`, `communityHighlights: null`, `finishedAt`/`rating` nulos e o dia UTC.
- [x] 6.3 Adicionar Gêneros/Plataformas, Backlog, cartão do Awards (só dono e `voting`) e rodapé com fontes conectadas do dono; remover `RecapStatsScreen` e `recap/stats/*`; verificar com testes de componente para porcentagens de gênero, `backlogGrowth: 0` e visitante sem cartão do Awards.

## 7. Stories e metas

- [x] 7.1 Extrair `exportCardImage(node, format)` de `WrappedRecapScreen` e manter o Wrapped usando-o; verificar com os testes existentes do Wrapped.
- [x] 7.2 Criar `RecapStoriesScreen` com os cinco stories (1080×1920 em `RecapCardPreview`), navegação por toque, `?story=N`, filtragem de stories sem dados, ação do Awards no story 5 e convite para visitante; ligar `/recap/[year]/[userId]/stories` no web e a rota no mobile com `onShare`; verificar com testes de componente (avançar/voltar, story 4 pulado, tamanho do blob exportado, erro no `onShare`).
- [x] 7.3 Criar o cartão "Meta para {ano+1}" com leitura, valor inicial, limites 1–999, salvar e progresso, visível só ao dono quando o ano é aceito; verificar com testes vitest (sem meta, meta existente, outro usuário, ano antigo, erro ao salvar).

## 8. Notificações e fechamento da onda 1

- [x] 8.1 Adicionar `awards.milestone`, `recap.milestone` e `goal.reminder` em `getNotificationContent` (ícones, cópia por `milestone` com fallback por fase) e em `navigateToNotificationTarget`; verificar com testes vitest para cada milestone, o fallback sem `milestone` e cada destino.
- [x] 8.2 Revisar todas as chaves novas em `en.json`/`pt-BR.json`, rodar `yarn locales:generate-types`, `yarn lint`, `yarn type-check` e `yarn workspace mobile test`, e adicionar o changeset de `web` e `mobile`; verificar que todos passam.
- [ ] 8.3 Com o servidor local e a Retrospectiva 2026 gerada para um usuário de teste (`docs/local-browser-testing.md`), abrir Home, Dock, `/recap/2026/:userId` e os stories no web e no app Android, e compartilhar um story; verificar visualmente contra os frames `5445:1844`, `5415:922` e `5413:862`–`5413:983` e que a imagem tem 1080×1920 px.

## 9. Indicações

- [x] 9.1 Extrair `AwardsEligibleGameSearch` de `AwardsVoteSubmitForm` (ano do evento e `eligibilityCutoffDate`, jogos sem data aceitos); verificar com teste vitest dos filtros de ano e de corte.
- [x] 9.2 Criar os blocos compartilhados `AwardsCategoryList`, `AwardsCategoryPanel`, `AwardsNomineeCard` (Default/Selected, chips de status) e o layout responsivo; verificar com testes de componente dos estados das linhas e dos chips.
- [x] 9.3 Criar `AwardsNominationsScreen` (categorias sem GOTY pessoal, progresso, adicionar/remover até 3 com atualização otimista e rollback, somente leitura fora da fase, data de abertura em `upcoming`, visitante) e as rotas `/awards/[year]/nominations` no web e no mobile; verificar com testes vitest (limite 3, limpar, 400 com rollback, `nominations_closed`, visitante sem `nominations/me`).
- [x] 9.4 Ligar o card "Indicações" e o Dock à tela nova, rodar lint/type-check/testes e adicionar changeset; verificar no web com um evento local em `nominations`.

## 10. Admin

- [x] 10.1 Adicionar datas de indicação e corte ao `CreateUpdateAwardsForm` com validação zod e exibição da fase na lista/detalhe; verificar com teste jest do schema (par obrigatório, ordem, fim ≤ início da votação).
- [x] 10.2 Adicionar `nomineeCount` ao formulário de categoria e o estado de finalização no detalhe; verificar criando uma categoria local com 5 indicados.
- [x] 10.3 Adicionar o cartão "Retrospectiva" com `opensAt` por ano chamando `PUT /v1/recap/admin/editions/:year`; verificar com teste jest da validação do ano e chamada local; rodar `yarn workspace admin test` e adicionar changeset de `admin`.

## 11. Cédula

- [x] 11.1 Criar `AwardsBallotScreen` web/mobile com leitura, ordem e numeração, progresso, filtro "Todos/Que joguei", voto em primeiro, sugestão do GOTY pessoal e busca livre só no GOTY pessoal e em categorias sem indicados; verificar com testes de componente (horas/nota, `played` sem horas, `planned`, filtro, evento antigo com `nominees: []`).
- [x] 11.2 Implementar a barra de voto (confirmar e avançar, pular, otimista com rollback, última categoria), modo somente leitura fora de `voting` e convite para visitante; verificar com testes vitest das mutações e do 401 sem tratar como cédula vazia.
- [x] 11.3 Reescrever a cédula compartilhada em `/awards/[year]/nominees/[userId]` com `votes/:userId` e a ação "Compartilhar minha cédula"; remover `AwardsEventVoteScreen`, `AwardsEventCategoriesList`, `AwardsEventCategory`, `AwardsVoteLayout`, `AwardsVoteSubmitForm(Modal)` e o share por imagem; verificar com teste de componente (8 votos, lista vazia) e abrindo o link sem sessão.
- [ ] 11.4 Rodar lint/type-check/testes, changeset, e verificar no web e no Android contra `5410:689` e `5412:845` com um evento local em `voting` e com o evento 2025.

## 12. Resultado

- [x] 12.1 Criar `AwardsResultsScreen` com estado sem resultados, destaque do GOTY, alternância "Todos/Só quem jogou" e nota de disputa (omitidas sem dados), vencedores por `category.order` e cartão do GOTY pessoal; verificar com testes de componente (ordem, evento antigo, `results: []`).
- [x] 12.2 Adicionar o placar (logado ou `?user=`), chips por resultado, 404 sem erro, visitante sem placar e "Compartilhar meu placar"; ligar o card "Resultado" e o Dock; remover `AwardsResultScreen`, `AwardsResultCategories`, `useAwardCategoryResults` e restos do fluxo antigo; verificar com testes vitest (hit/miss/not_voted, 404, `?user=`).
- [ ] 12.3 Rodar lint/type-check/testes, changeset, e verificar no web e no Android contra `5410:888` e `5412:935` com resultados locais calculados.

## Workflow follow-up

- Arquivar a change depois que as quatro ondas estiverem em produção e o Awards 2026 tiver resultado.
- Ao arquivar, sincronizar o delta de `notification-inbox` com as specs principais.
