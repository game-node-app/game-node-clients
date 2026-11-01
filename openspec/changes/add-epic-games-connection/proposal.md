# Proposal

## Why

The server change `add-epic-games-connection` (game-node-server) ships an `epicgames` provider with a new `delegated_code` auth mode, GameNode-owned `EpicGamesNamespace` mappings (category `1001`) and an admin-only Epic namespace bulk fill. None of it is reachable from the clients: web shows Epic as "This connection does not support account setup yet", mobile doesn't list Epic at all, and the admin "Match" button on unmapped games does nothing, so moderators can't resolve the Epic namespaces the importer will start registering.

## What Changes

- **Regenerate `@repo/wrapper`** from the server's current `server_swagger.json`, which adds `epicgames` to the connection/importer enums, category `1001`, `origin` on `GameExternalGame`, and `POST /v1/game/external/fill/epic`.
- **Delegated-code onboarding (web + mobile, shared in `@repo/ui`).** The connection setup modal gets a guided two-step flow for `delegated_code` providers:
  1. choose auto-import settings, then "Continue", which calls `auth/init`;
  2. "Open Epic Games sign-in" opens the returned URL in a new tab (in-app browser on native), and a paste box accepts the code the Epic page shows, either the raw code or the whole JSON page. Submitting calls `auth/callback` with the bound `state`.
  The same flow handles **Reconnect** for `reauth_required` Epic connections. Expired or rejected codes show an inline error and a "Start over" action.
- **Epic Games as a first-class connection.** Display name "Epic Games", icon `epicgames`, profile link, importer route `/importer/epicgames`, and an entry in mobile's connection list. Web's list is already data-driven.
- **Admin: Epic mapping tools.**
  - The unmapped external games table labels category `1001` as "Epic Games Namespace" and links it to an external lookup.
  - Its "Match" action now works: pick a game, confirm the source URL, submit a curated mapping, with an explicit message on HTTP 409 ("IGDB already maps this ID").
  - A panel on the same page starts the Epic namespace bulk fill and shows the returned job state.
- Out of scope: Epic achievements UI, GOG and other providers, polling or progress of the bulk fill job (the server exposes none), showing mapping `origin` in admin lists, and the landing page, which already shows Epic.

## Capabilities

### New Capabilities

- `connection-onboarding`: how users link and relink gaming accounts from web and mobile, per provider auth mode (`redirect`, `public_identifier`, `delegated_code`), including the delegated-code paste flow and how each provider is presented (name, icon, profile link, importer entry).
- `external-game-mapping-admin`: admin tools for GameNode-owned external game mappings: resolving unmapped entries with curated mappings and triggering bulk mapping fills.

### Modified Capabilities

None. The existing specs (`blog-reading`, `blog-editorial-access`) are unrelated.

## Impact

- **Generated code:** `packages/wrapper/input/server_swagger.json` and `packages/wrapper/src/server/**`.
- **Shared UI (`packages/ui`):**
  - `preferences/handlers/connections/PreferencesConnectionSetup.tsx` plus a new delegated-code step component and code parser;
  - `connections/util/getConnectionName.ts` and `getConnectionProfileURL.ts` (their exhaustive matches break on regen);
  - `importer/view/ImporterScreen.tsx` (source allow-list and display name);
  - locales in `packages/locales` (`en`, `pt-BR`) and the regenerated translation types.
- **Mobile:** `PreferencesConnectionsItems.tsx` adds Epic, and `connection-auth.test.tsx` covers the delegated flow.
- **Admin:** `components/external_game/*` and `pages/dashboard/game/external/index.tsx`.
- **No new dependencies.** Depends on the server change being deployed. Before then, clients against an old server simply don't receive `epicgames` from `GET /v1/connections`.
