# Design

## Context

- `/recap` renders `WrappedRecapScreen` (`packages/ui/src/components/wrapped/`), moved out of the Wrapped modal. It lists the user's played games for a rolling week, month or year through `usePlaytimeForUser` and `useGames`, and exports a 480px-wide `Stack` with `html-to-image`'s `toBlob`. Each app injects `onShare` (web: `navigator.share`; mobile: Capacitor `Filesystem` and `Share`).
- The Echo recap (`EchoAndroid`, `feature/recap`) is a card with fixed pixel layouts (Story 1080x1920, Feed 1600x900) rendered at 1 dp = 1 px, with several templates, and a hero number, top artists and tracks, and stats.
- What the server exposes today, from a read-only survey of `game-node-server` on `main`:
  - `POST /playtime/user/:userId` lists `UserPlaytime` rows per game and source for a rolling window (`week`, `month`, `year`, `all` = 7, 30, 365 days, filtered by `lastPlayedDate`). It never sums anything, and `recentPlaytimeSeconds` is a provider-defined window, not an arbitrary period.
  - `GET profile/metrics/report/:userId/:period` returns `playedInPeriod`, `finishedInPeriod`, `reviewedInPeriod` and `playtimeSecondsInPeriod`, but accepts only `WEEK` and `MONTH` on the server even though the generated client enum lists more periods.
  - `PlaytimeHistoryService.getTotalPlaytimeForPeriod` computes real per-period deltas from `UserPlaytimeHistory` grouped by game, source and platform, but no endpoint exposes it.
  - `profile/metrics/distribution/type` counts library items by genre or platform, not hours, and ignores week and month.
  - The yearly recap is persisted per year and cannot be reused for weeks or months.
- The generated wrapper is the only API access. It is regenerated from the server's `server_swagger.json`.

## Goals / Non-Goals

**Goals:**

- A recap page whose card is worth sharing, with period, format and template choices.
- Numbers computed from real playtime in the period, not from the library.
- A shared image identical to the preview on every screen size.

**Non-Goals:**

- Persisted weekly or monthly recaps, which the server can compute on demand.
- Changing the yearly recap page or its backend job.
- Video export and quote pickers from Echo.

## Decisions

**One summary endpoint on the server, not client-side math.** `usePlaytimeForUser` cannot answer "hours in this period", "top genre" or "previous period", and fetching every game and genre to aggregate them in the browser would be slow and wrong (the server's `recentPlaytimeSeconds` is not a period total). The server already has the data: `getTotalPlaytimeForPeriod` gives the per-game deltas, and games carry `genres` while history rows carry `platformId`. A single `GET /v1/profile/metrics/summary/:userId/:period` returns `current` and `previous` windows (`totalPlaytimeSeconds`, `totalGames`), `topGames` (five entries with `gameId` and seconds; the client loads covers with `useGames`), `topGenre`, `topPlatform`, the existing played, finished and reviewed counts, and the same figures for the previous window so the client only computes the percentage. It reuses the report's period type and adds `YEAR`. The server change lives in `game-node-server`; the clients depend on it and regenerate the wrapper from its swagger.

**Calendar versus rolling windows.** The existing report is rolling (7 and 30 days). The summary keeps rolling windows so the card says "last 7 days", matching the report, and avoids an empty card on a Monday. Calendar periods stay a later option.

**One data source, no cover grid template.** A later explicit product decision supersedes the first draft, which kept the cover grid as a template. The Covers template is removed with its grid size, excluded games, source and recent/lifetime playtime options, and `WrappedRecapScreen` no longer calls `usePlaytimeForUser`. Story keeps Poster, Dash and Bento; Feed keeps the summary; every template is built from the period summary, so the card always shows the same numbers and the page has one loading and empty state.

**Fixed-size card, scaled preview.** Templates render at the native export size (1080x1920 or 1600x900) with plain pixel values, as Echo does, inside a scaled wrapper for the preview (`transform: scale`, sized from the container width). Export passes `width`, `height` and `pixelRatio: 1` to `toBlob` and clones without the preview scale, so a phone-width screen exports the same image as a desktop. The previous 480px stack could not do this.

**Components.** `WrappedRecapScreen` keeps the screen state (period, format, template, options) and the share mutation. A `RecapCard` component picks the template; each template is a pure component of `{ summary, user, period, format }`. A `useRecapSummary(period)` hook follows the repo's React Query pattern: key `["profile-metrics", "summary", userId, period]`, gated by `useUserId`, with a `staleTime` because the numbers move slowly.

**Typography.** The card uses the app theme font (Roboto from `DEFAULT_MANTINE_THEME`) and the `brand-*` and `bg-paper-*` scales. Echo's Bricolage Grotesque and Space Mono are not added, because a font must also load inside the exported DOM and in the Capacitor WebView.

**Cover loading.** Covers come from external image hosts, and `toBlob` needs `cache: "no-cache"` and CORS-enabled images, as the current export already does. Failing to load a cover leaves its slot blank, and the card still exports.

**Mobile.** The route and `onShare` stay as they are. The page should work inside `AppPage`; the preview scale is derived from the container width so it fits a phone.

## Risks / Trade-offs

- [The summary endpoint does not exist yet] → The client change is blocked on the server change; the tasks begin by regenerating the wrapper from the server's swagger.
- [Top genre weighted by hours needs a join per request] → A cache and a bounded top-five on the server (see the server change); the client reads it with a `staleTime`.
- [`html-to-image` at 1080x1920 can be memory-heavy on low-end phones] → Export with `pixelRatio: 1`, and show the error notification if it fails.
- [The server's report accepts only week and month] → The summary endpoint adds year; until then the year option stays hidden behind the endpoint's response.
- [The "test" daily cron of the yearly recap is still active on the server] → Out of scope, but noted for the server owner.

## Migration Plan

1. Deploy the server summary endpoint.
2. Regenerate `@repo/wrapper`, then ship web and mobile together. No data migration.
3. Rollback is reverting the clients, which restores the current Wrapped page.

## Open Questions

- Rolling or calendar periods for the card label ("last 7 days" versus "this week")?
- Which templates ship next beyond Poster, Dash, Bento and the summary (Echo has four)?
- Do we want the top genre by hours or by games played in the period?
- Where do the server change's artifacts live, and should the summary also include `finishedGames` by name?
