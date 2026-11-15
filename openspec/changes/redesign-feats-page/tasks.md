# Tasks

## 0. Servidor (`game-node-server`)

- [x] 0.1 Implementar o item 1 de `server-handoff.md` (`obtainedTiers` em `AchievementProgressDto`, preenchido em `GET /v2/achievements/progress/:userId`); verificar com testes de integração no servidor (níveis 1 e 2 com datas; feito sem nível com `[]`).
- [x] 0.2 Implementar o item 2 de `server-handoff.md` (`RedeemAchievementCodeResponseDto` e `@ApiOkResponse` em `consume`); verificar com teste (corpo `{ achievementId, tier: 1 }`; código expirado segue `400`).
- [x] 0.3 Gerar o `server_swagger.json`, copiar para `packages/wrapper/input/server_swagger.json`, rodar `yarn wrapper:generate` e atualizar o status de `server-handoff.md`; verificar no gerado `AchievementProgressDto.obtainedTiers`, `RedeemAchievementCodeResponseDto` e o retorno tipado de `achievementsCodeControllerConsumeV1`, e que `yarn type-check` passa.

## 1. Modelo de dados da página

- [x] 1.1 Criar `packages/ui/src/components/achievement/util/feats.ts` com `buildFeatsModel` (itens com estado, nível exibido, próximo nível, XP ganho; resumo; "Quase lá"; linhas de eventos; eventos passados; exclusão de eventos futuros e de feitos de eventos encerrados não obtidos) e `filterFeats` (categoria, busca sem acento/caixa ignorando secretos, status); verificar com `apps/mobile/src/components/achievement/feats-model.test.ts` cobrindo os cenários do spec (resumo 2/24 · 4 níveis · 125 XP, ordem 21/25 › 8/10 › 4/5, evento encerrado com/sem feito, filtros combinados, busca "dragon").
- [x] 1.2 Adicionar o mapa métrica → unidade (design, Decisão 6) e um helper de formatação de número/data pelo locale; verificar no mesmo arquivo de teste (`library_games` 1000 em pt-BR → "1.000 jogos", métrica desconhecida → número puro).
- [x] 1.3 Rodar `yarn workspace @repo/ui barrels:generate` e verificar que os novos módulos saem pelo barrel e `yarn type-check -F @repo/ui` passa.

## 2. Textos

- [x] 2.1 Adicionar as chaves `achievements.*` da página (cabeçalho, resumo, quase lá, eventos, filtros, seções, card, níveis, resgate, destaque, unidades com `_one`/`_other`) em `en.json` e `pt-BR.json`, com o texto do Figma em pt-BR, e rodar `yarn locales:generate-types`; verificar que os dois arquivos têm as mesmas chaves e que `yarn type-check` passa.

## 3. Badge e card

- [x] 3.1 Adicionar `variant?: "ring" | "tile"` a `AchievementBadge` (tile quadrado arredondado, escala de cinza quando bloqueado; `ring` inalterado); verificar estendendo `apps/mobile/src/components/achievement/achievement-badge.test.tsx` (tile renderiza glyph/capa/imagem; padrão continua circular).
- [x] 3.2 Criar `FeatTierSegments` e `FeatCard` (estados obtido em progresso, completo, não obtido com um ou vários níveis, secreto mascarado; badges `Nível N` em brand light, `Completa` teal, categoria/`Secreta` gray; raridade; ação "Níveis"); verificar com `feat-card.test.tsx` usando os exemplos do spec (61/250 · Nível 4 de 6 · Próximo nível: 100 XP; 8/10 · Recompensa: 50 XP; Test Lab "+100 XP ganhos"; secreto sem "Níveis").

## 4. Seções da página

- [x] 4.1 Criar `FeatsHeader` (breadcrumb com `Link` para `/profile/:userId`, título, subtítulo) e `FeatsProfileCard` (avatar com anel e pill, nível, "faltam N XP para o N+1", barra, membro desde); verificar com teste de render (nível 14, 2340/2800 → "faltam 460 XP para o 15").
- [x] 4.2 Criar `FeatsSummaryCard` com os três números e `FeatsFeaturedSlot` (primeiro destaque; "Trocar" e slot vazio só para o dono; nada para visitante sem destaque) e o botão "Resgatar um código" só para o dono; verificar com teste de render para dono e visitante.
- [x] 4.3 Criar `FeatsAlmostThere` (até 3 itens, abre os níveis ao selecionar, oculto sem itens) e `FeatsEvents` + `FeatsPastEventsModal` (linhas por evento com status e "Obtida · +N XP"; lista de encerrados com feitos não obtidos marcados como indisponíveis); verificar com testes de render dos cenários do spec.
- [x] 4.4 Criar `FeatsFilters` (chips de categoria com contagem em "Todos", busca, segmentado Todos/Obtidos/Bloqueados) e `FeatsSection` (título com contagem e secretos; grade 1/2/3 colunas; estado vazio); verificar com teste de interação (Seguidores + Bloqueados; cabeçalhos "Obtidas · 10 feitos" e "Ainda não obtidas · 14 feitos, 2 secretos").

## 5. Modais e mutações

- [x] 5.1 Criar `useFeatureFeat` (PUT com `[achievementId]`, otimista no cache de destaques, rollback + `createErrorNotification`, invalidação) e `FeatFeaturedPicker` (seleção única entre obtidos); verificar com `feature-feat.test.tsx` (`vi.spyOn(AchievementsService, "achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2")` recebe `{ featuredAchievementIds: ["critics-corner"] }`; erro restaura o destaque anterior).
- [x] 5.2 Criar `FeatTiersModal` (badges, "Rumo ao nível N" com unidade, tabela no desktop e lista abaixo de `sm`, status "Obtido em data"/progresso/"Bloqueado", "Obtido" sem data quando `obtainedTiers` falta, "Destacar no perfil" só para dono com nível > 0; `breakpoints` de sheet no mobile); verificar com `feat-tiers-modal.test.tsx` (níveis 1–3 com datas, nível 4 "61 / 250", 5–6 "Bloqueado"; sem ação para feito não obtido).
- [x] 5.3 Criar `useRedeemFeatCode` e `RedeemFeatCodeModal` (passo de código com erro inline e "Resgatar" desabilitado vazio/carregando; notificação verde; passo "Novo feito" com XP do nível, "Ver meus feitos" e "Destacar no perfil"; fecha sem revelar se o feito não está no catálogo; invalida catálogo, progresso, nível e destaques); verificar com `redeem-feat-code.test.tsx` (sucesso mostra "Test Lab" e "+100 XP"; código expirado mostra o erro e mantém o modal aberto; feito ausente fecha).

## 6. Montagem e apps

- [x] 6.1 Criar `FeatsScreen` juntando as seções e modais, apontar o export `AchievementsScreen` para ela e remover o código antigo da screen (e `RedeemAchievementCodeModal`/chaves de texto que ficarem sem uso; `AchievementItem` fica porque perfil e admin o usam); verificar com `feats-screen.test.tsx` (catálogo + progresso mockados renderizam resumo, seções e abrem os níveis; visitante não vê resgate) e com `yarn lint` e `yarn type-check`.
- [x] 6.2 Web: adicionar `<Head>` com título traduzido em `apps/web/src/pages/feats/[targetUserId].tsx`; verificar `yarn build -F web` e, seguindo `docs/local-browser-testing.md`, conferir a página em 1440 px e 390 px contra os frames "Feitos · Desktop 1440" e "Feitos · Mobile 390".
- [x] 6.3 Mobile: conferir `apps/mobile/src/pages/feats.tsx` (`AppPage`) e os sheets de níveis e resgate no app; verificar `yarn workspace mobile test` e `yarn build -F mobile`, e comparar com os frames "Feitos · Mobile · Níveis" e "Feitos · Mobile · Resgatar código".
- [x] 6.4 Adicionar o changeset (`web` e `mobile`, minor) com `yarn changeset`; verificar que o arquivo em `.changeset/` nomeia só os dois apps.

## Workflow follow-up

- Fazer o deploy do servidor (itens 0.1–0.2) antes do release de `web` e `mobile`.
- Arquivar `rework-platform-achievements` antes desta change, ou ajustar a ordem ao arquivar, já que `feats-page` substitui o layout de página de `platform-achievements`.
