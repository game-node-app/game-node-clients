# Tasks

## 1. Server contract

- [x] 1.1 In `game-node-server`, propose and ship `GET /v1/profile/metrics/summary/:userId/:period` returning `totalPlaytimeSeconds`, `totalGames`, `top5Games` with cover, `topGenre`, `topPlatform`, the played, finished and reviewed counts, and the same figures for the previous window. Verify the endpoint appears in `server_swagger.json`. Done on branch `feat/profile-metrics-summary` (not yet committed or deployed): rolling week, month and year, `topGames` carry `gameId` and seconds and the client loads covers with `useGames`; covered by unit tests and a live call on a local instance.
- [x] 1.2 Copy the swagger to `packages/wrapper/input/`, run `yarn wrapper:generate`, and verify the generated `ProfileMetricsService` has the summary method and its response type.

## 2. Data hook

- [x] 2.1 Add `useRecapSummary(period)` in `packages/ui/src/components/wrapped/hooks`, with a hierarchical key, `useUserId` gating and a `staleTime`, update the `wrapped` barrels (written by hand, in the barrelsby format, to avoid the unrelated reorders), and verify with a vitest test in `apps/mobile` that spies on the service and covers the signed-out, loading and success cases.
- [x] 2.2 Add a pure helper that turns a summary into the displayed figures (hours, percentage change against the previous period, and no percentage when the previous period is empty), and verify with unit tests for growth, decline, a zero previous period and a zero current period.

## 3. Card and templates

- [x] 3.1 Add the fixed-size card wrapper with the Story and Feed formats and a scaled preview derived from the container width, and verify with a component test that the card keeps its native size and the preview scales.
- [x] 3.2 Add the summary template (hero figure, top game, genre and platform, top five games, comparison, avatar, period label and logo) at native pixel sizes for both formats, and verify with a component test covering a full summary and a missing top genre.
- [x] 3.3 Move the current cover grid into a template keeping its grid, exclusions and playtime options, and verify with a component test that the options still change the rendered covers.
- [x] 3.4 Rebuild `WrappedRecapScreen` around the period, format and template selectors, the empty state and the share and download actions, and verify with a component test for switching period, the empty state and disabled actions.
- [x] 3.5 Export with the native `width`, `height` and `pixelRatio: 1`, and verify with a test that `toBlob` receives the selected format's size and that a failing `onShare` shows the error notification.

- [x] 3.6 Add the `RecapCustomization` model (backdrop game, art opacity, accent, extra figure, opt-in comparison), the `RecapCustomizePanel`, and apply it in the Poster, Dash, Bento and Feed summary templates, and verify with unit tests of the helpers, card tests for accent, backdrop game, opacity, extra figure and the opt-in comparison, and panel tests for each control and the reset.

## 4. Copy

- [x] 4.1 Add all new keys to `en.json` and `pt-BR.json` under `mobile.wrapped`, run `yarn locales:generate-types`, and verify with `yarn type-check`.

## 5. Release and verification

- [x] 5.1 Add the changeset for `web` and `mobile`.
- [ ] 5.2 Run `yarn lint`, `yarn type-check`, `yarn workspace mobile test` and `yarn workspace admin test`, and verify all pass.
- [ ] 5.3 With the server running, open `/recap` on web, switch period, format and template, share and download, and verify the exported image matches the preview and has the selected size in pixels.
- [ ] 5.4 On Android, open `/recap` from the menu and share the card, and verify the covers load and the exported image has the selected size.
