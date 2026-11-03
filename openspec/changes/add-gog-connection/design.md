# Design

## Context

See `proposal.md` for motivation and the four delta specs for acceptance behavior. This is a cross-cutting client addition with a sensitive manual authorization handoff, so a design is warranted.

Observed in this checkout:

- `packages/wrapper/input/server_swagger.json` and generated models stop at Nintendo. The sibling `/home/cassi/projects/game-node-server/server_swagger.json` exists and already includes `gog`. `packages/wrapper/generate.js` generates server and search clients; the root `yarn wrapper:generate` is the established entry point. Source `gog`, achievement source `_5` and both UI/admin `Gog = 5` constants already exist.
- `PreferencesConnectionSetup` selects auth from server metadata, retains `{ state, authorizationUrl }`, supports reconnect/settings/deletion and passes delegated sign-in to `PreferencesConnectionDelegatedCode`. That component currently chooses between Nintendo validation/copy and Epic's 32-hex code. It already disables mutation retries and locks the failed callback until Start over.
- Web connections are server-driven. Mobile's `PreferencesConnectionsItems` and `ImporterScreen.VALID_SOURCES` explicitly list providers. Notifications and importer labels share `getConnectionName`; profile URLs use an exhaustive `getConnectionProfileURL` match.
- Admin `getExternalSourceName(5)` currently produces "Gog". `getExternalLookupUrl` already returns undefined for category `5`, and `MatchExternalGameModal` requires a moderator-supplied URL. Public game store links already use `externalStore.url`.
- Active game/collection achievement screens use `useGameAchievementsV2`, which awaits catalogue and obtained reads and joins by source/external ID. GOG metadata can already pass through the generic list. Count/progress summaries explicitly support Steam only. `CollectionEntryAchievementTracker` ignores query errors when deciding to show "no obtained achievements"; the game overview/share component also hides failed initial reads. The unused legacy achievement hook and unused store-filter helper need no GOG refactor.
- `packages/analytics/src/oauthPrivacy.ts` scrubs code-bearing URLs and sensitive keys. `PostHogProvider` blocks `.oauth-private` session recording. The delegated paste form is not marked private, and callback errors currently expose the raw server message. Generated `ApiError` retains request details; `createErrorNotification` logs the error object, so it must not receive the sensitive callback error.
- Existing shared-UI tests run in mobile's Vitest harness. Admin mapping tests use Jest. English and Brazilian Portuguese live in `packages/locales/src/translations/json/`, with generated translation types.

Published specs cover only blog behavior. `connection-onboarding`, `library-import-queue` and `external-game-mapping-admin` also appear in unarchived changes whose implementation is already present. This change uses distinct GOG requirement names and their existing capability paths; it does not rewrite those changes. GameNode platform badges/XP remain separate from external `game-achievements`.

## Goals / Non-Goals

**Goals:** Extend the existing provider branches and active achievement consumers with the minimum changes needed to satisfy the specs. Keep authentication attempts transient, API values additive and server-returned capabilities/identities authoritative.

**Non-Goals:** No new provider framework, dependency, theme, icon, local sync worker, client token exchange, browser interception or persistent authorization session. No server edits, migrations, credential handling or refactor of unused legacy achievement paths.

## Decisions

### 1. Regenerate from the real server contract

During apply, copy the sibling server Swagger output into `packages/wrapper/input/server_swagger.json` and run `yarn wrapper:generate`. Review generated changes for connection DTOs (including own/available/create), notification targets/preview, importer-watch source, batch-status source, and the importer service's source parameter. Preserve existing exports and verify generated indexes; do not manually patch generated enums or invent contract fields. Inspect unrelated regeneration differences before accepting them. No change is needed to existing playtime/category values.

Alternative: hand-editing enums is smaller superficially, but leaves the input stale and loses GOG on the next generation.

### 2. Extend the shared delegated form with one GOG branch

Keep `PreferencesConnectionSetup` as the state owner and use the same generated init/callback methods and configured authenticated wrapper transport. GOG's step explains desktop address-bar copying, mobile address/share copying and returning to paste. Provide a selectable/copyable init authorization URL for a desktop-browser fallback; keep GameNode state in the originating app. State loss or process termination requires fresh init. Keep the browser-open action on an explicit click to preserve current popup behavior.

Use the platform `URL` parser for a small GOG-only local shape check: HTTPS, exact `embed.gog.com` host, `/on_login_success`, `origin=client`, nonblank `code`, without userinfo or a nondefault port. Reject obvious misses locally so they do not consume state. Do not impose an arbitrary code length/encoding or compare a GOG URL query to GameNode state. Post the trimmed original URL, preserving parameter order, encoding and extra parameters. The server remains responsible for authoritative validation and exchange.

Reuse failure locking, `retry: false`, preferences, connection invalidation and reconnect actions. A callback failure of any kind requires fresh init, including an uncertain network outcome. No countdown is needed: localized ten-minute/single-use guidance and server errors suffice. Existing Epic/Nintendo validation, previews and instructions remain provider-specific.

Alternative: dedicated GOG screens duplicate already-correct state and preference handling; automated redirects or code extraction contradict the required manual URL handoff.

### 3. Protect the whole authorization handoff

Apply the established `.oauth-private` recording block to the delegated authorization content and exclude its controls from autocapture. Keep state, authorization URL and pasted text in component memory; do not place them in route/query keys, analytics properties, persisted mutations or device storage. Existing URL/code scrubbing should already remove GOG final URLs; extend its tests with placeholder GOG values and verify callback request bodies cannot enter network recordings. If needed, exclude connection auth endpoints in the existing masking callback rather than adding a telemetry layer.

For GOG callback failures, display a localized safe failure/restart message without echoing raw request/response values or calling the logging error-notification helper. Preserve the existing other-provider error behavior. Clear sensitive component state on completion, reset or close, and ensure errors do not escape into crash reporting. Use only fake one-use codes in fixtures.

Alternative: relying solely on default input masking misses the selectable authorization URL, replay network payloads and error objects.

### 4. Keep provider presentation and imports in their current owners

Add GOG to `getConnectionName` and the undefined-profile-URL branch of `getConnectionProfileURL`, mobile's explicit connection list and `ImporterScreen` source allowlist. Existing icon lookup resolves `gog` to the server asset; existing notifications and importer source selectors inherit the shared name. Verify GOG targets keep the existing preferences/importer destinations. Use a noninteractive profile icon when no URL exists if the current anchor renderer exposes a link affordance.

Update only the admin category label for `5` to "GOG" and keep the existing disabled numeric lookup/manual URL behavior. Reuse server-supplied store URLs. Do not create a mapping category or guess a slug.

Keep batch/automatic imports and collection validation on the server. Clients neither filter out unplayed owned games nor calculate GOG preferred platforms. Localized coverage explains PC imports, Galaxy exclusions and cumulative recorded playtime; existing playtime data remains unmodified when dates/counts are missing.

### 5. Reuse generic achievement data and fix active error consumers

Keep existing V2 catalogue/obtained endpoints and source/external-ID joins. Use GOG `_5` in the same count/progress summary branch as Steam, guarding zero totals so unavailable/empty groups cannot yield invalid percentages. Existing group metadata supplies GOG names, icon and PC platforms. Display names/descriptions as returned without masking hidden achievement text; preserve missing text and dates, and prevent the mobile obtained-date display from formatting a missing value. Generic list rendering already avoids PSN/Xbox decorations for GOG, so add no GOG trophy model.

Preserve rejected reads as query errors; do not catch them into empty arrays. In `GameInfoAchievementOverview`, `CollectionEntryAchievementTracker`, the list/screen and progress-share UI, give errors precedence over confirmed empty/no-obtained states. Offer retry via the existing query's `refetch` and existing UI controls. Retain cached progress after refresh failure with a visible stale/unavailable indication; suppress fresh-completion claims while the read is failing. Verify the progress overview cannot independently render an authoritative result from a failed query. Do not infer truncated snapshots from client counts: server rejection/unavailability is authoritative. Empty success responses remain separate from failed reads.

Owner and other-user identities continue through existing reads. Do not add refresh endpoints, elevated query parameters, owner impersonation or a client-side requirement that every public viewer link GOG. The server selects usable catalogue accounts and decides refresh authority; its availability errors remain visible.

Alternative: returning empty data for errors makes false absence durable in the UI. Redesigning the server read contract or introducing a new achievement service is unnecessary.

### 6. Affected callers, fixtures, exports and checks

| Area | Reach and verification |
| --- | --- |
| Contract | Wrapper input, generated models/services/indexes; wrapper and consuming-app type checks catch missing exhaustive branches. |
| Connection presentation | Shared helpers consumed by preferences, profiles, importer and notifications; extend `connection-providers.test.ts`, existing notification cases and mobile list coverage. |
| Auth and browser handoff | Shared setup/delegated form and native `PreferencesConnectionItem` browser callback; extend `connection-auth.test.tsx` with GOG metadata, preferences, full-URL payload, invalid input, expiry/restart and reconnect cases. |
| Privacy | Existing analytics privacy module/provider and delegated form/error boundary; extend `components/mcp/privacy.test.ts` and focused auth checks. No new telemetry provider or app config. |
| Imports/playtime | Existing importer source allowlist/queue/selectors, coverage copy and server DTOs; extend `importer-screen.test.tsx` and existing import/connection integration tests with unplayed PC `6` fixtures. |
| Achievements | V2 hook, count summary, screen/list, overview, collection tracker, sharing and mobile item; focused Vitest fixtures for source `5`, hidden text, missing date, successful empty obtained reads and failed/stale reads. |
| Admin mappings | `getExternalSourceName`, unchanged numeric lookup and manual match consumers; extend `getExternalLookupUrl.test.ts`. |
| Localization/exports | Add `en.json`/`pt-BR.json` GOG copy and safe errors, regenerate translation types. Preserve UI barrels and wrapper entrypoints; no new exports or dependencies are planned. |

## Risks / Trade-offs

- [Mobile browsers may hide or fail to expose the final URL] → Validate iOS/Android address/share controls on real browsers; retain desktop-browser fallback and record unsupported combinations explicitly.
- [The app can be terminated during browser sign-in] → Explain restart after state loss; avoid storing sensitive attempts just to survive process death.
- [Single-use state may be consumed despite a network error] → Never replay callbacks; require a new init. The server enforces ten-minute expiry.
- [Recorded network bodies or raw errors can leak the pasted URL] → Block delegated recording/autocapture, verify auth-request masking and use safe GOG error text with placeholder-only tests.
- [Server catalogue accounts, GOG provider failures or truncated snapshots cause temporary unavailability] → Preserve errors, retry paths and prior progress; never infer confirmed absence from failure.
- [Shared error-state fixes affect other providers] → Preserve successful-empty behavior and run existing provider/importer tests plus focused failure regressions.
- [Multiple unarchived changes share capability paths] → Keep unique added GOG requirements and preserve all existing requirements when those changes are later synced/archived; no main-spec edits during this proposal.

## Migration Plan

1. Apply against the server contract containing GOG; refresh Swagger and regenerate before updating client branches.
2. Ship shared wrapper/UI/locales and consuming web/mobile/admin changes together after focused tests and type checks. No user-data migration is needed.
3. Validate authenticated init/callback, reconnect and imports with the deployed server, then the real-browser matrix. Do not retain pasted URLs in test notes, screenshots or recorded network traces.
4. Roll back client additions together if necessary; delete no connections or progress. Existing provider data and server-side sync remain server-owned. Older clients cannot safely present a newly advertised GOG provider, so coordinate rollback with provider exposure/version availability.

## Open Questions

- Which iOS and Android browser/address/share combinations expose the final URL reliably? This is a required validation result, not a blocker for the defined manual handoff and desktop-browser fallback.
