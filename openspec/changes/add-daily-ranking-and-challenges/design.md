# Design

## Context

See proposal.md for motivation; the specs fix the behavior. The server contract is
`game-node-server/openspec/changes/add-daily-ranking-and-challenges/handoff-clients.md` (worktree branch
`feat/daily-ranking-design`); its `server_swagger.json` already contains every new route and DTO
(`DailyRankingResponseDto`, `DailyRankingRowDto`, `DailyRankingSummaryDto`, `DailyWeeklyDto`,
`DailyWeeklyRankingResponseDto`, `DailyPracticePlayResponseDto`, `kind` on `GET /v1/daily/results`).

Current client state (all in `packages/ui/src/components/daily`):

- `DailyHomeView` is a single 720 px column: intro (How to play, Archive) and the "Daily #N" panel with
  four `DailyModeRow`s and the streak line.
- `DailyPlayView` owns everything for one mode: header, stepper, stats line, hint, input, lives, guess
  list, then `DailyResultPanel`, `DailySharePanel`, `DailyStatsPanel` and the next-mode button. It is
  typed on `DailyPlayResponseDto`.
- `useDailyPlay(puzzleId)` sends the whole play (`guesses`, `hintAt`), keeps guest plays in local storage
  (`gamenode-daily-results`, keyed by puzzle id, `DailyLocalResult`) and invalidates every `["daily", …]`
  query except `play` on success. `useDailyImportOnLogin` imports finished guest plays.
- `useDailyCountdown` formats `HH:MM:SS` to the next reset and invalidates `["daily"]` when it expires.
- Routes: web `pages/daily/index.tsx`, `[mode]/index.tsx`, `[mode]/archive.tsx`; mobile
  `getCommonRoutes` has exact `/daily`, `/daily/:mode`, `/daily/:mode/archive`.
- Reusable pieces: `UserAvatar` (accepts an embedded `profile={{ avatar }}`, forwards Mantine `Avatar`
  props), `SupporterBadge` (violet when `perks.theme` is false), `useAuthPath()` + `?redirectTo=`,
  `ExtendedUseInfiniteQueryResult`, `createErrorNotification`, `ErrorState`, `DailyErrorState`.

Design frames (Figma `ikcThguwowTdynGz0L2YkS`, section `5050:13680`): ranking desktop overall
`5050:14254`, Cover `5050:14638`, empty Today `5050:14803`, signed out `5050:15324`, mobile `5051:13889`,
hub `5051:13890`, result `5051:14093`, components `5051:14622`, notes `5051:14642`. There are no frames for
the weekly play screen, the practice screen, the friends ranking or the mobile hub; those reuse the
existing daily play layout and the ranking row component.

## Goals / Non-Goals

**Goals:**

- One shared implementation in `@repo/ui` for web and mobile; apps only add pages and routes.
- Reuse the daily board (hint, input, lives, guesses, result panel) for weekly and practice instead of
  forking it.
- Keep weekly and practice data out of every daily computation (streak, stats, "N of 4", archive).

**Non-Goals:**

- No server changes, no client-side point computation, no polling.
- No new navigation entries (Dock, tab bar, sidebar); the ranking is reached from the hub and the result
  card.
- No new Mantine theme colors; position-change green/red use stock `teal`/`red`, medals use the existing
  gold/silver/bronze-like stock colors (`yellow`, `gray`, `orange`).

## Decisions

### 1. Wrapper regeneration first

Copy `server_swagger.json` from the server worktree into `packages/wrapper/input/` and run
`pnpm wrapper:generate`. Every later task depends on the generated types. `DailyRankingRowDto` is a single
DTO with optional mode fields (`modePoints`, `currentStreak` vs `wins`, `averageAttempts`,
`bestStreak`); the UI branches on the response's `mode` (null = overall), not on field presence.
`positionChange` is generated as `number | string`; a small `toPositionChange()` helper narrows it to
`{ kind: "up" | "down" | "same" | "new" | "none", amount }`.

### 2. Folder layout

New feature folders next to the existing ones, each with `hooks/`, `view/` or flat components as the
size warrants:

```
components/daily/
  ranking/   useDailyRanking, useInfiniteDailyRanking, DailyRankingView, DailyRankingFilters,
             DailyRankingPodium, DailyRankingTable, DailyRankingRow, DailyRankingViewerSummary,
             DailyRankingScoring, DailyRankingSignInCard, DailyRankingEarlyBanner,
             DailyRankingPanel (hub), DailyRankingResultCard (result screen), rankingFormat.ts
  weekly/    useDailyWeeklyRanking, DailyWeeklyView, DailyWeeklyCard (hub), DailyWeeklyFriendsRanking
  practice/  useDailyPractice, DailyPracticeView, DailyPracticeSection (hub)
  view/      DailyPlayBoard (extracted), DailyPlayView, DailyPlayHeader (generalized), DailyHomeView
```

Barrels regenerated with `pnpm --filter @repo/ui barrels:generate` (or written by hand in barrelsby
format if the generator reorders unrelated files, as earlier changes did).

### 3. Extract `DailyPlayBoard`; three thin views

`DailyPlayBoard` takes a mode-agnostic play state and callbacks and renders: in progress → hint, guess
input, lives, guesses; finished → `DailyResultPanel` + guesses, plus a `children` slot for what follows.
The state type is structural, so both DTOs fit:

```ts
type DailyBoardState = Pick<DailyPlayResponseDto,
  "maxAttempts" | "attempts" | "feedback" | "hints" | "hintAvailable" | "hintAt" | "answer"> & {
  mode: DailyMode; status: "in_progress" | "won" | "lost";
};
```

`DailyResultPanel` and `DailySpecsSummary` are retyped on `DailyBoardState` (they only read those
fields). Then:

- `DailyPlayView` (today/archive): header, stepper, stats line, board, then share, stats panel,
  **ranking card**, next-mode button. Behavior otherwise unchanged.
- `DailyWeeklyView`: header ("Challenge of the week #N", countdown to `weekly.endsAt`), board, share
  (weekly text), friends ranking or sign-in prompt, back to hub.
- `DailyPracticeView`: header ("Unlimited Cover"), board, "Play again" / back to hub.

Alternative considered: a `variant` prop on `DailyPlayView`. Rejected: three variants with different
data sources would turn the view into a tangle of conditionals.

`DailyPlayHeader` becomes `{ title, subtitle, countdown?: { endsAt, label }, archiveHref?, onHowToPlay }`
so the weekly and practice screens drop the archive link and swap the countdown. Its existing call site
passes today's values.

### 4. Ranking data hooks

- `useInfiniteDailyRanking({ period, mode, scope })`: `useInfiniteQuery`, `limit` 20, `offset` from
  loaded rows, `getNextPageParam` from `pagination.hasNextPage`; key
  `["daily", "ranking", "list", { period, mode, scope }, userId]`; `enabled` unless
  `scope === "following" && !userId`. Returns `ExtendedUseInfiniteQueryResult`.
- `useDailyRanking({ period: "week", limit: 3 })` for the hub panel; key
  `["daily", "ranking", "panel", userId]`.
- Both set `staleTime: 30_000` and `refetchOnMount: true` so opening the screen reads fresh data even on
  web (whose default is `staleTime: Infinity` with no refetch triggers), without a timer.
- Freshness after a finish comes for free: they live under `["daily", …]`, which `useDailyPlay` already
  invalidates on every play. The predicate is extended to also skip `["daily", "practice", …]` (see 7).
- `viewer`, `pointsToTop100`, `endsAt`, `totalPlayers` are read from the first page.

### 5. Ranking page layout and pinned row

- Filter state lives in the view (`useState`), seeded from optional props the pages read from the URL
  (`?mode=&period=&scope=`), so the result card can link to `/daily/ranking` and the hub can deep-link.
  Not synced back to the URL to avoid router differences between Next and Ionic.
- Desktop (≥ `lg`): two columns, main (filters, podium, table, load more, pinned row) and a 340 px side
  column (scoring explainer as a collapsible `Paper`, "Your summary"). Below `lg` and on mobile:
  single column, chips (`ScrollArea` with `Chip`/`Button` pills), help `ActionIcon` opening the explainer
  in the injected `Modal`, table rows collapse to the mobile card layout from frame `5051:13889`
  (position + change, avatar, name + badge, "🔥 N days · W%", points).
- Mode/period selectors: Mantine `SegmentedControl` styled to the frame (`5051:14616`), with the mode
  icons from `DAILY_MODE_ICONS` plus a trophy for Overall.
- Podium: `data.slice(0, 3)` in visual order [2, 1, 3]; a missing slot renders the "Open spot" card.
  The table renders `rows.slice(3)`.
- Pinned row: rendered only when `viewer && viewer.position > loadedCount` (positions are consecutive
  from 1 and pages are contiguous, so this needs no DOM observer). It uses `position: sticky; bottom: 0`
  inside the page flow, which works in both the web scroll container and `IonContent`. When
  `viewer.position <= loadedCount`, the matching row (by `userId`) gets the "You" highlight instead.
- Few-players state: table body empty when `rows.length <= 3`; Today additionally shows the banner with
  `totalPlayers` and a link to `/daily`.
- Signed out: `viewer` is null; render `DailyRankingSignInCard` (links to `${authPath}?redirectTo=…`)
  where the pinned row would be, disable the "People I follow" segment, and reset `scope` to `all` when
  `userId` disappears.
- Errors: `DailyErrorState` with retry for the list and the hub panel.

### 6. Formatting helpers (`rankingFormat.ts`)

- `formatDailyPoints(value, language)` and `formatDailyCount(value, language)` via
  `Intl.NumberFormat(language, { maximumFractionDigits: 1 })`, matching the server's one-decimal values
  without re-rounding (`4` → "4", `2.4` → "2,4" in pt-BR, `3812` → "3.812").
- `formatDailyRemaining(endsAt, now)` → "3d 14h", "14h 32m", "32m" for the period end, the weekly
  countdown and "Ends in" texts. A `useDailyRemaining(endsAt)` hook ticks every 30 s (minute precision is
  enough) and invalidates `["daily"]` once the instant passes, like `useDailyCountdown`.
- Position-change narrowing (Decision 1).

### 7. Weekly challenge

- `DailyWeeklyView` reads `weekly` from `useDailyToday()` and plays it with `useDailyPlay(weekly.id,
  { kind: "weekly" })`. No new play hook: the endpoint and body are the same.
- Guest storage: `DailyLocalResult` gains optional `kind?: "daily" | "weekly"`; `toDailyLocalResult`
  writes it from the hook's option. Missing `kind` means daily (existing data). Every daily computation
  over local results (`computeDailyPlayStreak` on the hub, `DailyStatsPanel`, archive status) filters to
  `kind !== "weekly"`. `useDailyImportOnLogin` keeps importing all finished plays (the server accepts
  weekly imports and never ranks them).
- Hub card status: signed in → `weekly.result`; guest → `local[weekly.id]`, through the existing
  `startedDailyResult` helper.
- Friends ranking: `useDailyWeeklyRanking()` (`["daily", "weekly", "ranking", userId]`, `enabled:
  !!userId`, `staleTime: 30_000`, `refetchOnMount: true`). Positions are array index + 1. Rows reuse
  `DailyRankingRow` in a compact variant (position, avatar, name, badge, attempts or "not guessed").
- Share text: `buildDailyShareText` gets an optional title per entry so the weekly line reads
  "Challenge of the week #7 🟥🟩…" while daily output stays byte-identical (existing tests guard it).

### 8. Practice

- `useDailyPractice(mode)`: device storage `gamenode-daily-practice` =
  `{ [ownerKey]: { [mode]: roundId } }` where `ownerKey` is the user id or `"guest"`.
  Query key `["daily", "practice", mode, userId]`; `queryFn`: if a round id is stored, `play(id, [])` to
  resume; on 403/404 drop it and fall through; otherwise `startPractice(mode)` and store the id.
  `staleTime: Infinity` so re-renders never start rounds; the queryFn is idempotent anyway.
- A `play` mutation sends the whole guess list as the daily does and `setQueryData`s the response; it
  does not invalidate other daily queries. A `restart` mutation starts a new round, stores it and sets
  the data.
- `useDailyPlay`'s invalidation predicate skips `play` and `practice`, so a daily guess never resumes a
  practice round in the background.
- Errors: 429 → `ErrorState` "Too many rounds in a row, wait a moment" + retry; 503 → "Practice is
  unavailable right now" + retry; anything else → `DailyErrorState`. A failed guess uses
  `createErrorNotification` as the daily does.
- Hub "Unlimited" section is two link cards to `/daily/cover/practice` and `/daily/specs/practice`; the
  round starts on the practice screen, not before navigating, so a refresh or deep link works the same
  way and the hub stays a plain list of links.

### 9. Result screen ranking card

`DailyRankingResultCard` reads only `play.ranking` and renders when it is present:

- `counted`: title `+{pointsEarned + bonusEarned} pts in the ranking` and the move:
  `previousWeekPosition == null` → "you entered at #N"; `previous > current` → "you rose to #N";
  equal → "you're at #N"; subtitle "Week: X pts" + "Y pts to the top 100" when non-null; a bonus line
  when `bonusEarned > 0`.
- Not counted (archive or late finish): muted card "Archive plays don't score in the ranking".
- "See ranking" links to `/daily/ranking`.

Placed after the stats panel and before the next-mode button, as in frame `5051:14093`.

### 10. Hub layout

`DailyHomeView` grows to `max-w-[1264px]` with a CSS grid: `lg:grid-cols-[minmax(0,720px)_520px]`. Left:
the existing intro (adds a "Ranking" button/`ActionIcon`) and daily panel. Right: `DailyRankingPanel`,
`DailyPracticeSection`, `DailyWeeklyCard` (only when `weekly` is non-null). Below `lg` and on mobile the
right column stacks under the daily panel in the same order.

### 11. Routes

- Web: `pages/daily/ranking.tsx`, `pages/daily/weekly.tsx` (static files beat `[mode]`), and
  `pages/daily/[mode]/practice.tsx` whose `getServerSideProps` returns `notFound` unless the mode is
  `cover` or `specs`. Each sets `<Head>` titles.
- Mobile: add exact routes `/daily/ranking` and `/daily/weekly` **before** `/daily/:mode` in
  `getCommonRoutes`, and `/daily/:mode/practice` next to the archive route; `pages/daily/ranking.tsx`,
  `weekly.tsx`, `practice.tsx` wrap the views in `AppPage` with a title, and `practice.tsx` redirects
  unsupported modes to `/daily` with `getTabAwareHref`.

### 12. Copy and design deviations

- All strings in `daily.ranking.*`, `daily.weekly.*`, `daily.practice.*` in en and pt-BR (pt-BR copy
  taken from the frames: "Ranking do Daily", "Vaga aberta", "Jogue hoje para entrar", "Carregar mais",
  "Seu resumo da semana", "Faltam {{points}} pts para o top 100.", "Entre para competir no ranking",
  "Ilimitado", "Sem limite diário", "Desafio da semana", "Reinicia segunda", …).
- "PROPOSTA" tags in the frames are dropped: they flagged server decisions that are now implemented.
- The design's "Premium" pill is rendered with the existing `SupporterBadge` (`variant="full"`, default
  violet), whose label is the app's "Supporter"/"Apoiador", to keep one name for the same perk across the
  app.
- Avatars use `UserAvatar` with the row's embedded avatar and Mantine initials (`name`,
  `color="initials"`) as the fallback the frames show.
- The design's "Semana termina em" chip is period-aware ("Hoje termina em", "Mês termina em"); the Today
  frame showing "Semana" is treated as a leftover.

## Risks / Trade-offs

- [Server branch not yet merged/deployed] → The swagger comes from `feat/daily-ranking-design`; the client
  release must wait for the server deploy. Note it in the PR and the changeset.
- [Sticky pinned row inside nested scroll containers] → Verified in both web and `IonContent` during
  implementation; fallback is a fixed bar offset by the tab bar height on mobile.
- [Large `DailyPlayView` refactor can regress the daily flow] → Extract the board first with no behavior
  change and keep the existing daily tests green before adding weekly and practice.
- [Guest local results without `kind`] → Treated as daily; weekly plays were impossible before this
  change, so no old entry can be weekly.
- [Practice round ids in device storage] → Capability ids; never put in URLs or share text, cleared when
  the server returns 403/404.
- [Ranking reads per hub visit] → One small `limit=3` request per hub open (30 s stale time); acceptable
  and required by the "fresh on open" rule.

## Migration Plan

Additive; no data migration. Ship after the server change is deployed. Rollback is reverting the client
release; guest storage stays compatible because `kind` is optional and the practice key is new.
