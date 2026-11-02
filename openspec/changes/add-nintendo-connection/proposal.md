# Proposal

## Why

The server change `add-nintendo-connection` (game-node-server) adds a `nintendo` provider on the existing `delegated_code` flow, importer and notification provider `nintendo`, and the GameNode-only mapping category `NintendoTitleId` (`1002`). Once the server lists `nintendo`, today's clients break. Web shows it in the connections list, but opening it throws: the exhaustive provider matches have no branch for it. Even with the name fixed, the generic paste box is wrong for Nintendo. It shows Epic's JSON page, asks for a 32-hex code, and rejects every Nintendo link locally before the link reaches the server.

## What Changes

- **Regenerate `@repo/wrapper`** from the server's `server_swagger.json`. This adds `nintendo` to the connection, importer and notification enums, and `1002` to the external game categories.
- **Nintendo presentation**, everywhere the apps name or picture a provider: the display name "Nintendo" and the server-stored `nintendo` icon. There is no profile link, because Nintendo has no public profile page. Mobile's connections list gains Nintendo, and the importer accepts `/importer/nintendo`. Notifications and the importer already name providers through `getConnectionName`, so they pick it up from that one branch.
- **Nintendo paste step.** The delegated-code step becomes provider-aware:
  - Nintendo shows its own instructions: sign in, pick the account, then right-click or long-press "Select this account", copy the link address, and do not click the button.
  - It previews the link shape (`npf5c38e31cd085304b://auth#…`).
  - It checks locally that the pasted text is a Nintendo account link with a `session_token_code` and that its `state` matches the current attempt. A mismatch sends nothing, because a failed callback uses up the single-use state.
  - Epic's behavior is unchanged.
- **Nintendo coverage and privacy copy** in the setup (en, pt-BR):
  - only games played on Switch or Switch 2 since the account was linked to a console are imported;
  - hidden games and owned but unplayed games are not;
  - playtime and first/last played dates come from Nintendo;
  - a hint that copying the link may fail on phones, so users can link from a computer instead;
  - where to revoke access.
- **Admin:** the unmapped table labels category `1002` as "Nintendo Title ID". It has no external lookup link, because Nintendo has no public page keyed by title ID, so the visit action is disabled. Matching works through the existing "Match" dialog.
- **Out of scope:**
  - the landing page platform ring, which has a fixed six-slot layout;
  - a Nintendo logo component (the existing `EpicGamesLogo` is unused);
  - the manual playtime form, which already offers Nintendo Switch;
  - a bulk mapping fill (the server has none);
  - verifying the link copy on mobile browsers beyond the manual check in tasks.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

Both capabilities are introduced by the client change `add-epic-games-connection`. That change is implemented but not archived yet, and it must be archived before this one.

- `connection-onboarding`: the paste step's local check becomes per provider, and the `nintendo` provider gets its presentation and its link-paste instructions.
- `external-game-mapping-admin`: the unmapped table names category `1002`, and its visit action is disabled for it.

## Impact

- **Generated code:** `packages/wrapper/input/server_swagger.json` and `packages/wrapper/src/server/**`.
- **Shared UI (`packages/ui`):**
  - `connections/util/getConnectionName.ts` and `getConnectionProfileURL.ts`;
  - `importer/view/ImporterScreen.tsx`;
  - `preferences/handlers/connections/PreferencesConnectionDelegatedCode.tsx`.
- **Locales:** `packages/locales` (`en`, `pt-BR`) and the regenerated translation types.
- **Mobile:**
  - `PreferencesConnectionsItems.tsx`;
  - the tests `connection-auth.test.tsx`, `connection-reauth-notification.test.tsx` and `importer-screen.test.tsx`.
- **Admin:** `components/external_game/constants.ts` and the `getExternalLookupUrl` test.
- **No new dependencies. Release order matters:** ship the clients before or together with the server (see design.md, Migration Plan). Today's clients throw on an unknown `nintendo` provider. Against an old server, the new clients simply don't receive `nintendo`, and mobile's hard-coded list item opens the "not supported yet" setup message.
