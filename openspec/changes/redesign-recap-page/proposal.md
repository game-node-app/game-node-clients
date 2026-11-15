# Proposal

## Why

The Wrapped modal became a `/recap` page, but it still only shows a grid of covers for the games played in a week, month or year. The Echo app's recap works better as a share card: a single number that stands out (time played), the top game, genre and platform, a short top list and a comparison with the previous period, in a Story or Feed format with a choice of template. GameNode players share their recent activity the same way, so the page should produce a card worth sharing.

## What Changes

- Redesign the `/recap` page around a share card with a period selector (week, month, year), a format selector (Story 1080x1920 or Feed 1600x900) and a template selector.
- The card shows the hero figure (hours played in the period), the top game, genre and platform, the top five games with covers, games played, finished and reviewed in the period, and the change against the previous period.
- Ship the existing cover grid as one of the templates, so its options (grid size, excluded games, per-game playtime and platform) keep working.
- Render the card at its native export size and scale it down for the preview, then export it with `html-to-image` using the same size and a fixed pixel ratio, so the shared image matches the preview on web and mobile.
- Read the period summary from a new server endpoint (`GET /v1/profile/metrics/summary/:userId/:period`). The server work is tracked in its own change and the clients ship after it is deployed.
- No new dependency on the client.

Out of scope: persisting weekly or monthly recaps, changing the yearly recap (`/recap/:year/:userId`), video export, adding a lyric or quote picker, and a per-hour activity chart (no source of hourly data exists).

## Capabilities

### New Capabilities

- `recap-share-card`: The period summary shown on `/recap`, the share card formats and templates, and exporting them as an image.

### Modified Capabilities

None. `openspec/specs/` holds no recap capability, and the `/recap` page conversion shipped without a spec.

## Impact

- **Rendering and export**: `WrappedRecapScreen` is split into a screen plus card templates under `packages/ui/src/components/wrapped/`.
- **Data**: a new `useRecapSummary` hook over the generated `ProfileMetricsService` summary method, after `yarn wrapper:generate` from the updated server swagger.
- **Existing hooks reused**: `usePlaytimeForUser` and `useGames` for the cover grid template, `useUserId`, `UserAvatarGroup`, `GameFigureImage` and `GameNodeLogo`.
- **Apps**: web and mobile wire only `onShare`, as today.
- **Locales**: new keys under `mobile.wrapped.*` in English and Brazilian Portuguese.
- **Server dependency**: the summary endpoint (see `design.md`) must be deployed before the clients ship.
