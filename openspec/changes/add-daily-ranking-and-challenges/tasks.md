# Tasks

## 1. Server contract

- [x] 1.1 Copy `server_swagger.json` from the `game-node-server` worktree on `feat/daily-ranking-design` into `packages/wrapper/input/`, run `pnpm wrapper:generate`, and verify `DailyService` has `dailyControllerFindRankingV1`, `dailyControllerFindWeeklyRankingV1`, `dailyControllerStartPracticeV1`, `dailyControllerPlayPracticeV1`, `dailyControllerFindResultsV1(mode, kind)`, and that `DailyTodayResponseDto.weekly` and `DailyPlayResponseDto.ranking` exist; then `pnpm type-check` passes (fix only call sites whose generated signature changed, e.g. `findResults`).

## 2. Shared helpers and guest storage

- [x] 2.1 Add `ranking/rankingFormat.ts` (`formatDailyPoints`, `formatDailyCount`, `toPositionChange`, `formatDailyRemaining`) and `useDailyRemaining(endsAt)`, and verify with a vitest test in `apps/mobile` covering `4`/`2.4`/`3812` in en and pt-BR, every position-change kind (positive, negative, 0, `"new"`, null), and remaining-time strings for days, hours and minutes.
- [x] 2.2 Add optional `kind` to `DailyLocalResult`/`toDailyLocalResult` and an option on `useDailyPlay(puzzleId, { kind })`; filter weekly entries out of the hub streak, `DailyStatsPanel`, `DailyArchiveView` and `useDailyTodayResults`; keep `useDailyImportOnLogin` importing all finished plays; extend `useDailyPlay`'s invalidation predicate to skip `practice`. Verify with vitest tests that a stored weekly result is ignored by the streak/stats helpers, is still sent by the import, and that legacy entries without `kind` count as daily.
- [x] 2.3 Add the en and pt-BR strings for `daily.ranking.*`, `daily.weekly.*` and `daily.practice.*` (pt-BR copy from the frames), run `pnpm locales:generate-types`, and verify both JSON files have the same keys and type-check passes.

## 3. Play view refactor (no behavior change)

- [x] 3.1 Extract `DailyPlayBoard` and the structural `DailyBoardState` type from `DailyPlayView`, retype `DailyResultPanel` and `DailySpecsSummary` on it, and generalize `DailyPlayHeader` to `{ title, subtitle, countdown?, archiveHref?, onHowToPlay }`; verify existing daily tests (`daily-share`, `daily-utils`, `off-cover-call-sites`) pass and a component test renders the same today/archive play (stepper, archive link, next-mode button) as before.
- [x] 3.2 Let `buildDailyShareText` entries carry an optional title, and verify with tests that daily output is unchanged and a weekly entry reads "Challenge of the week #7 …".

## 4. Ranking data and page

- [x] 4.1 Add `useInfiniteDailyRanking({ period, mode, scope })` and `useDailyRanking({ period, limit })` per design 4 (keys under `["daily", "ranking", …]`, `staleTime: 30_000`, `refetchOnMount: true`, following scope disabled without a user), and verify with vitest tests: query params sent, next offset from loaded rows, `hasNextPage` stop, no request for `following` while signed out.
- [x] 4.2 Build `DailyRankingRow` (overall and mode columns, change indicator, `UserAvatar` with initials fallback, `SupporterBadge` from `supporterBadge`, profile link, "You" highlight, mobile card layout, compact weekly variant) and `DailyRankingPodium` (order 2-1-3, open-spot placeholders); verify with component tests for overall vs mode cells, dashes for missing values, hidden badge, and one/two/zero podium players.
- [x] 4.3 Build `DailyRankingFilters` (segmented mode/period/scope on desktop, scrolling chips on mobile, following disabled signed out), `DailyRankingScoring` (collapsible side card and modal), `DailyRankingViewerSummary`, `DailyRankingEarlyBanner` and `DailyRankingSignInCard` (`useAuthPath()` + `redirectTo`); verify with component tests for the summary with and without the top-100 gap, the signed-in-without-row invite, and the guest card links.
- [x] 4.4 Assemble `DailyRankingView` (header with back link, period-aware subtitle and end countdown, filters, podium, table with "Load more" and "Showing a–b of N players", pinned viewer row only when `viewer.position > loadedCount`, side column, error state, scope reset on sign-out); verify with component tests for: switching mode changes columns and request, pinned row vs in-list highlight, Today few-players banner, guest state, and error retry.
- [x] 4.5 Add web `pages/daily/ranking.tsx` (reads `mode`/`period`/`scope` from the query) and mobile `pages/daily/ranking.tsx` + exact route before `/daily/:mode` in `getCommonRoutes`; verify `/daily/ranking` renders on both (mobile route order covered by a routes test or manual check in `pnpm dev -F mobile`) and `/daily/cover` still opens Cover.

## 5. Hub

- [x] 5.1 Build `DailyRankingPanel` (week top three, "You: #N (±change)", invite with fewer than three, "See full ranking", error retry) and verify with a component test for signed-in, guest and one-player lists.
- [x] 5.2 Rework `DailyHomeView` into the two-column layout with the "Ranking" header action and the right column (ranking panel, Unlimited section, Weekly card) stacking below on narrow screens; verify with a component test that the Weekly section is absent when `weekly` is null and visually against frame `5051:13890` on web and the mobile app.

## 6. Result screen ranking card

- [x] 6.1 Build `DailyRankingResultCard` per design 9 and place it in `DailyPlayView` after the stats panel; verify with component tests for moved up, entered (null previous), unchanged, bonus, not counted (archive) and absent block (guest), and visually against frame `5051:14093`.
- [x] 6.2 Verify the ranking refresh after a finish: a test that a daily play success invalidates `["daily", "ranking", …]` queries but not `["daily", "practice", …]`.

## 7. Weekly challenge

- [x] 7.1 Add `useDailyWeeklyRanking()` (session only) and `DailyWeeklyFriendsRanking` (array order positions, viewer highlight, "not guessed" for losses, invite to follow when only the viewer is listed); verify with vitest tests for ordering display, no request for guests, and the single-row invite.
- [x] 7.2 Build `DailyWeeklyCard` for the hub (not started / in progress / won / lost, from `weekly.result` or the device) and `DailyWeeklyView` (header with number and "Ends in", board via `useDailyPlay(weekly.id, { kind: "weekly" })`, share, friends ranking or guest sign-in prompt, back to hub, no-challenge state, no ranking card); verify with component tests for each card status, the no-challenge state, and that a guest finish stores `kind: "weekly"`.
- [x] 7.3 Add web `pages/daily/weekly.tsx` and mobile `pages/daily/weekly.tsx` + exact route before `/daily/:mode`; verify both open the weekly screen.

## 8. Practice

- [x] 8.1 Add `useDailyPractice(mode)` per design 8 (device storage per account/guest and mode, resume with `[]`, drop the id on 403/404 and start a new round, `play` and `restart` mutations without daily invalidation); verify with vitest tests for start, resume, expired round, other-account round, restart, and that nothing is written to `gamenode-daily-results`.
- [x] 8.2 Build `DailyPracticeView` (header "Unlimited Cover/Specs", board, "Play again", back to hub, 429 and 503 states with retry) and `DailyPracticeSection` for the hub; verify with component tests for the finished state with "Play again", and the 429 and 503 messages.
- [x] 8.3 Add web `pages/daily/[mode]/practice.tsx` (not found unless `cover`/`specs`) and mobile `pages/daily/practice.tsx` + `/daily/:mode/practice` route (redirect unsupported modes); verify `/daily/specs/practice` plays and `/daily/artwork/practice` is rejected on both.

## 9. Integration and release

- [x] 9.1 Run `pnpm lint`, `pnpm type-check`, `pnpm --filter mobile test` and `pnpm build -F web -F mobile`, and verify all pass.
- [x] 9.2 Against a local server on `feat/daily-ranking-design` (see `docs/local-browser-testing.md`), walk the frames on web (desktop and narrow) and mobile: ranking overall and Cover, Today empty, signed out, hub, result card after a counted finish and an archive finish, weekly play and friends ranking, Cover and Specs practice; record any deviation from the frames in this change.
- [x] 9.3 Add a changeset naming `web` and `mobile` (`pnpm changeset`) that notes the dependency on the server deploy, and verify it exists under `.changeset/`.

## Workflow follow-up

- Release only after the server change `add-daily-ranking-and-challenges` is merged and deployed.
- Archive the change after review and release.

## Validation notes (9.2)

Walked on 2026-11-17 against a local `feat/daily-ranking-design` server with seeded ranking rows, in the built-in browser (web at 1440px and 390px, mobile app at 390px). Ranking overall (`5050:14254`), Cover (`5050:14638`), Today empty (`5050:14803`), signed out (`5050:15324`), hub (`5051:13890`), mobile ranking (`5051:13889`) and the result card (`5051:14093`) match their frames. Archive finishes show the "not counted" card, weekly play and friends ranking work, and Cover/Specs practice play, restart and leave daily results untouched; `/daily/artwork/practice` is a 404 on web and redirects to the hub on mobile.

Deviations, all outside this change: the share text emoji render as boxes in the preview browser (missing emoji font), and the web app's existing "open in app" banner overlays the narrow web layout.
