# Proposal

## Why

The Figma "Version 3.0" file (`ikcThguwowTdynGz0L2YkS`), section "GameNode Daily · Ranking (Sam)" (`5050:13680`), turns the Daily into a competition: a ranking page filtered by mode, period and scope, a ranking panel on the hub, a "+N pts" card on the result screen, unlimited Cover and Specs practice, and a weekly challenge ranked among friends. The server side shipped in `game-node-server` change `add-daily-ranking-and-challenges` (branch `feat/daily-ranking-design`), whose `handoff-clients.md` fixes the contract. The clients still only show the four daily puzzles, so none of it is visible to players.

## What Changes

- Regenerate `@repo/wrapper` from the server's `server_swagger.json` to get `dailyControllerFindRankingV1`, `dailyControllerFindWeeklyRankingV1`, `dailyControllerStartPracticeV1`, `dailyControllerPlayPracticeV1`, `weekly` on the today response, `ranking` on the play response and `kind` on the results read.
- Add the **Daily ranking page** (`/daily/ranking`, web and mobile) following frames `5050:14254`, `5050:14638`, `5050:14803`, `5050:15324` and `5051:13889`: mode filter (Overall, Cover, Artwork, Keywords, Specs), period filter (Today, Week, Month, All time), scope (Everyone, People I follow), a podium of the first three with "Open spot" placeholders, a paginated table with position change, Premium badge, per-mode points (overall) or wins / average attempts / best streak (mode), streak and win rate, "Load more", the period end countdown, a scoring explainer, "Your summary" with the gap to the top 100, a viewer row pinned to the bottom, the "still early" state for Today and the signed-out sign-in card. On mobile, filters become horizontally scrolling chips and the scoring explainer opens from a help button.
- Rebuild the **Daily hub** following frame `5051:13890`: a "Ranking" header action, and a side column with the weekly ranking panel (top three, the viewer's position and change, "See full ranking"), the "Unlimited" section (Cover and Specs practice) and the "Weekly" section (weekly challenge card). On mobile the side column stacks below the daily list.
- Add the **ranking card on the result screen** following frame `5051:14093`: "+N pts in the ranking", the move from the previous to the new week position, week points and the gap to the top 100, with a "See ranking" link, built only from the play response's `ranking` block; archive plays say they do not score.
- Add the **weekly challenge** screen (`/daily/weekly`): play with the Specs rules through the existing play endpoint, a countdown to the week's end, share text, and a friends ranking (`GET /v1/daily/weekly/ranking`) after finishing; guests play on the device and see a sign-in prompt instead of the friends ranking. Weekly results never feed daily stats, streaks or the archive.
- Add **unlimited practice** for Cover and Specs (`/daily/cover/practice`, `/daily/specs/practice`): start a round, resume it from the device, play it with the daily rules and feedback, then "Play again"; handle the rate limit (429) and the no-candidate (503) responses.
- Guest results stored on the device gain a `kind` so a weekly play is imported on sign-in but never counted in daily stats or streaks.
- Not included: seasons, monthly medals or ranking history; rank-change notifications; Artwork or Keywords practice; a ranking entry in the Dock or tab bar; "PROPOSTA" tags from the design (they marked server decisions that are now final). Server changes are out of scope.

## Capabilities

### New Capabilities

- `daily-ranking-display`: How the clients present the daily ranking: the ranking page with its filters, podium, table, viewer summary and states, the hub ranking panel and the result screen ranking card.
- `daily-weekly-challenge-play`: The weekly challenge entry on the hub, its play screen, guest storage and the friends ranking shown after finishing.
- `daily-practice-play`: Unlimited Cover and Specs practice: entry on the hub, starting and resuming rounds, playing them and their error handling.

### Modified Capabilities

(none; the Daily has no specs under `openspec/specs/` yet)

## Impact

- **Dependency**: requires the server change `add-daily-ranking-and-challenges` deployed; the swagger comes from branch `feat/daily-ranking-design` until it merges.
- **Code**: `packages/wrapper` (regenerated), `packages/ui/src/components/daily` (new `ranking`, `weekly`, `practice` folders; `DailyHomeView`, `DailyPlayView`, `DailyPlayHeader`, `useDailyPlay`, local results, result panels), `packages/locales` (en and pt-BR), web pages `apps/web/src/pages/daily/{ranking,weekly}.tsx` and `[mode]/practice.tsx`, mobile pages and routes in `apps/mobile/src/pages/daily` and `getCommonRoutes.tsx`.
- **Tests**: vitest hook and component tests in `apps/mobile`.
- **Release**: a changeset for `web` and `mobile`.
