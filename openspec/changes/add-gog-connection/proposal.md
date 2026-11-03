# Proposal

## Why

The server adds GOG account linking, library imports, playtime and achievements through the existing connection APIs. The clients currently omit `gog` from generated provider values and explicit UI lists, and their delegated sign-in instructions only support Epic Games and Nintendo.

## What Changes

- Refresh `packages/wrapper/input/server_swagger.json` from the server's actual output and regenerate `@repo/wrapper`, adding `gog` to connection, importer and notification-provider handling. Preserve the existing playtime source `gog` and external mapping category `Gog = 5`.
- Present **GOG** with `iconName: "gog"` and the existing `/v1/public/icons/gog.png` asset across desktop/web, mobile, importer, notifications and mapping administration. Never derive profile or store URLs from numeric GOG IDs.
- Extend the shared delegated-code setup with localized GOG instructions: retain init's GameNode state and authorization URL, open sign-in, then paste the full final `https://embed.gog.com/on_login_success?origin=client&code=...` URL. Submit that URL unchanged apart from surrounding whitespace as `callbackParams.code`; protect it from telemetry and logs. Never request tokens or fetch the pasted URL.
- Reuse reconnect, settings, deletion, import selection and collection ownership behavior. Failed callbacks require fresh init; `reauth_required` and GOG reconnect notifications lead back through this flow.
- Accept GOG library queues, including unplayed owned games on PC platform `6`, and explain that playtime covers only GOG-recorded cumulative activity. Other stores linked through Galaxy are excluded.
- Display server-returned GOG achievements (`source: 5`, PC `6`) using existing reads and identity matching, without platinum metadata or invented hidden text. Keep failed or unavailable catalogue/progress reads distinguishable from confirmed absence, and retain server authority over refreshes.

## Capabilities

### New Capabilities

These paths are not yet in `openspec/specs/`. Reuse the paths already proposed by related in-flight changes where applicable; add GOG-specific requirements without replacing those changes' provider or batch-operation requirements.

- `connection-onboarding`: GOG provider presentation, delegated URL handoff, privacy, reconnect and safe connection DTO consumption.
- `library-import-queue`: GOG source support, owned-game coverage and playtime limits while preserving existing batch and automatic collection behavior.
- `game-achievements`: External-store GOG achievement presentation, progress identity and recoverable read failures. This differs from the in-flight `platform-achievements` capability, which covers GameNode's own badges and XP.
- `external-game-mapping-admin`: Display category `5` as GOG and preserve manual matching without inventing store URLs.

### Modified Capabilities

None. The only published capabilities currently cover blog behavior.

## Impact

- Shared UI: connection names/profile URLs, delegated-code setup, importer source validation, achievement hooks and their overview/list/tracker consumers. Mobile: explicit connection list and existing browser handoff. Notifications already share provider names and navigation.
- Wrapper: server Swagger input, generated provider enums, importer service/DTOs and generated exports. Locales: English, Brazilian Portuguese and generated translation types. Admin: external source label and existing lookup/matching behavior. Analytics: existing OAuth privacy rules and delegated input masking.
- Extend the existing mobile Vitest and admin Jest suites for provider coverage, auth, importer, notifications, privacy and mappings; add focused GOG achievement fixtures and query/rendering checks. Type-check wrapper, shared UI/locales/analytics and all consuming apps.
- Server implementation, credential storage, Galaxy cross-store imports, new assets/dependencies, client token exchange, automatic callback interception and broader achievement redesign are out of scope. Mobile URL-copy behavior requires device/browser validation, with a desktop-browser completion fallback.
