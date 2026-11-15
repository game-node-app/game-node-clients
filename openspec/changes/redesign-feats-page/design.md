# Design

## Context

- A página já existe e é compartilhada: `packages/ui/src/components/achievement/AchievementsScreen.tsx`, montada por `apps/web/src/pages/feats/[targetUserId].tsx` (sem SSR) e `apps/mobile/src/pages/feats.tsx` (`AppPage withSearch`, rota `/feats/:userId`). O web em largura de celular usa a mesma view com a Topbar e o Dock em gaveta de `redesign-navigation-and-notifications`.
- Dados disponíveis sem servidor novo: catálogo `GET /v2/achievements?targetUserId` (`useAchievementsV2`, 1 página de 1000; `category` 0–5 = Coleção, Seguidores, Reviews, Comentários, Especiais, Eventos, igual a `AchievementCategory` no servidor; `tiers[]` com `threshold`, `expReward`, `rarity`; `event` com janela), progresso `GET /v2/achievements/progress/:userId` (`useAchievementProgress`: `value`, `tier`, `nextThreshold`), nível `useUserLevel` (`currentLevel`, `currentLevelExp`, `levelUpExpCost`), perfil `useUserProfile` (`username`, `createdAt`), destaques `useAllObtainedAchievements(userId, true)` (v1, uma linha por feito, `isFeatured`).
- Lacunas fechadas pelo servidor (`server-handoff.md`): datas por nível e o feito liberado por um código.
- `AchievementBadge` é circular com moldura por cor de nível e é usado em perfil, notificações e feed. O design da página usa tile quadrado sem moldura colorida.
- O `Modal` injetado vira `ion-modal` no mobile e aceita `breakpoints`/`initialBreakpoint` (sheet).

## Goals / Non-Goals

**Goals:**
- Uma única árvore de componentes em `@repo/ui` para web desktop, web mobile e app nativo, com o layout decidido por breakpoints Mantine/Tailwind, sem presenter novo.
- Toda a derivação (seções, contagens, "Quase lá", eventos, filtros) em funções puras testáveis, separadas da renderização.
- Zero requisições por item: só catálogo, progresso, nível, perfil e destaques.

**Non-Goals:**
- SSR/prefetch da página no web (segue client-side como hoje).
- Persistir filtros na URL.
- Mudar o editor de destaques do perfil (`ProfileEditFeaturedAchievement`, que continua multi).

## Decisions

### 1. Contrato de servidor
- `AchievementProgressDto.obtainedTiers: { level: number; obtainedAt: string }[]`, ordenado por nível, a partir de `obtained_achievement.createdAt` (já há uma linha por nível). Lista vazia quando `tier = 0`. Alternativa descartada: um endpoint de histórico por feito — custaria uma requisição ao abrir cada modal, e o volume é pequeno (≤ 10 níveis por feito).
- `consume` retorna `RedeemAchievementCodeResponseDto { achievementId: string; tier: number }`; `tier` é o nível concedido por `grantTiers(..., [1])`. Alternativa descartada: o cliente comparar o progresso antes/depois — frágil quando o usuário já tinha o feito ou quando o progresso ainda está em cache.
- O cliente trata `obtainedTiers` ausente (servidor antigo) mostrando "Obtido" sem data, para que um deploy fora de ordem não quebre a página.

### 2. Derivação em `util/feats.ts`
Uma função `buildFeatsModel({ achievements, progress, now })` retorna:
- `items: FeatItem[]` com `achievement`, `progress`, `state` (`obtained` | `complete` | `locked` | `secret`), `displayTier` (maior nível obtido, ou 1 quando nenhum), `nextTier`, `earnedXp`, `isPastEvent`.
- `summary` (`obtainedCount`, `total`, `tiersCount`, `featXp`), `almostThere` (top 3 pela razão `value / nextThreshold`, regras do spec), `events` (linhas por evento) e `pastEvents`.
- Feitos de eventos futuros saem de tudo; feitos de eventos encerrados não obtidos saem do grid e do total, mas entram em `pastEvents`.
Uma segunda função `filterFeats(items, { category, query, status })` aplica os filtros; a busca normaliza acentos e caixa e ignora secretos mascarados. A screen chama as duas e o React Compiler cuida da memoização (sem `useMemo` manual além do que já existir).

### 3. Componentes
Em `components/achievement/feats/`:
- `FeatsScreen` (substitui o corpo de `AchievementsScreen`; o export `AchievementsScreen` continua apontando para ela para não mexer nas páginas).
- `FeatsHeader` (breadcrumb com `Link` de `#@/util` para `/profile/:userId`, título, subtítulo).
- `FeatsProfileCard` (avatar com anel de nível; reaproveita `UserAvatar` e `useUserLevel`; fundo com gradiente da marca via tokens Tailwind `brand-*`).
- `FeatsSummaryCard` (3 números formatados com `Intl.NumberFormat` do locale, `FeatsFeaturedSlot`, botão de resgate).
- `FeatsAlmostThere`, `FeatsEvents` + `FeatsPastEventsModal`, `FeatsFilters` (`Chip.Group`/botões pill, `TextInput` com lupa, `SegmentedControl`), `FeatsSection`, `FeatCard`, `FeatTierSegments`, `FeatTiersModal`, `FeatFeaturedPicker`, `RedeemFeatCodeModal` (substitui `RedeemAchievementCodeModal`, que é removido junto com `AchievementItem` se nada mais os usar).
- Badges: `variant="light"` com a cor da marca para "Nível N", `teal` para "Completa"/"Obtida", `gray` para categoria/"Secreta" (regras de cor do `AGENTS.md`; nada de `bg-*` ad hoc em badges).
- `AchievementBadge` ganha `variant?: "ring" | "tile"` (padrão `ring`). `tile` usa quadrado arredondado, fundo `paper`, mesmo conteúdo (glyph/capa/imagem) e escala de cinza quando bloqueado. Alternativa descartada: componente separado — duplicaria a resolução do ícone.

### 4. Modais por cliente
`FeatTiersModal`, `FeatFeaturedPicker`, `FeatsPastEventsModal` e `RedeemFeatCodeModal` usam o `Modal` injetado com `breakpoints={[0, 0.75, 1]}` e `initialBreakpoint={0.75}` (ignorados no web). A tabela de níveis vira lista de duas linhas abaixo de `sm` (mesma regra no web estreito e no app), seguindo o Figma "Mobile · Níveis".

### 5. Mutações
- `useFeatureFeat()` em `hooks/`: `PUT /v2/achievements/obtained/featured` com `[achievementId]`; `onMutate` faz update otimista do cache de destaques (`useAllObtainedAchievements` com `isFeatured=true`), `onError` reverte + `createErrorNotification`, `onSettled` invalida `["achievement", "obtained", "all"]` e o perfil.
- `useRedeemFeatCode()`: chama `consume`, devolve `{ achievementId, tier }`; no sucesso invalida `["achievements"]` (catálogo e progresso), `["user-level", userId]` e os obtidos. O modal passa para o passo "Novo feito" quando o catálogo atualizado contém o feito; senão fecha (spec). Erros do servidor (`ApiError.body.message`) aparecem no `error` do `TextInput`, não em toast.

### 6. Unidades de métrica
Mapa `metric → chave i18n` (`library_games` → `achievements.units.games`, `games_finished` → `games`, `reviews_written` → `reviews`, `followers` → `followers`, `comments_written` → `comments`, `awards_participation`/`manual` → sem unidade). Chaves com plural (`_one`/`_other`) em `en` e `pt-BR`. Métrica desconhecida → número puro.

### 7. Textos
Novas chaves sob `achievements.*` (`page`, `summary`, `almostThere`, `events`, `filters`, `sections`, `card`, `tiers`, `redeem`, `featured`, `units`). Chaves antigas sem uso depois da troca (`labels.tierRow`, `labels.tiers` etc.) são removidas de `en.json` e `pt-BR.json`, e os tipos são regenerados.

## Risks / Trade-offs

- [Deploy fora de ordem: cliente novo com servidor antigo] → `obtainedTiers` opcional na leitura; `consume` sem corpo cai no fechamento simples com toast. O servidor sai antes do release dos clientes.
- [Catálogo maior que 1000 itens] → herdado de `useAchievementsV2` (já anotado como atalho); fora de escopo.
- [Destaque único na página vs. vários no editor de perfil] → a página sempre substitui; o editor de perfil pode voltar a ter vários. Documentado no proposal; o slot mostra o primeiro destaque.
- [Mudança de `AchievementBadge` afetar perfil/notificações] → variante nova opt-in; padrão inalterado e coberto pelo teste existente `achievement-badge.test.tsx`.
- [Textos ilustrativos do Figma] → a nota "valores ilustrativos" do design não é implementada; os números vêm da API.

## Migration Plan

1. Servidor: implementar e publicar os dois itens do `server-handoff.md`, com testes e Swagger.
2. Clientes: copiar o Swagger, regenerar o wrapper, implementar a página e liberar `web` e `mobile` com changeset.
3. Rollback: reverter o release dos clientes devolve a página antiga; as mudanças de servidor são aditivas e não precisam de rollback.
