# Tasks

## 1. Wrapper and exhaustive provider matches

- [x] 1.1 Copy `../game-node-server/server_swagger.json` to `packages/wrapper/input/server_swagger.json` and run `yarn wrapper:generate`. Verify that `UserConnectionDto.type.EPIC_GAMES`, category `1001` on `SubmitExternalGameDto`, and `ExternalGameService.externalGameControllerFillEpicNamespacesV1` exist in `packages/wrapper/src/server`.
- [x] 1.2 Add `EPIC_GAMES` branches to `getConnectionName` ("Epic Games") and `getConnectionProfileURL` (`https://store.epicgames.com/u/<sourceUserId>`), as in design D6. Verify that `npx tsc --noEmit -p packages/ui` passes, so no exhaustive match is left broken by the regen.

## 2. Delegated-code onboarding (shared UI)

- [x] 2.1 Add the `preferences.delegatedCode.*` strings to `packages/locales/src/translations/json/en.json` and `pt-BR.json`: step titles, sign-in button, copy hint, paste label and placeholder, invalid-code error, expiry hint, start over, and paste-from-clipboard aria label. Run `yarn locales:generate-types` and verify that the generated schema includes the keys.
- [x] 2.2 Create `packages/ui/src/components/preferences/handlers/connections/PreferencesConnectionDelegatedCode.tsx` with the D5 visuals: connector header, `Stepper`, a dark "Open Epic Games sign-in" button calling the opener, a `Code` preview with the `Mark`ed code, a monospace paste input with an optional clipboard `ActionIcon`, and the expiry hint. It must also cover:
  - the presence check `/[0-9a-f]{32}/i` before the callback (D3);
  - the callback mutation sending `{ state, callbackParams: { code: value.trim() } }`;
  - success: invalidate `["connections"]`, notify with `getConnectionName`, and close;
  - on failure, an inline error, disabled submit and "Start over" (D4).
  Export it from the folder's barrel.
- [x] 2.3 Wire `delegated_code` into `PreferencesConnectionSetup.tsx` (D1 and D2):
  - allow the mode in the unsupported guard;
  - on submit with no connection, or on "Reconnect", run init and keep `{ state, authorizationUrl }` without navigating, then render the delegated step while it is pending;
  - move the `onRedirect` default to the redirect call site;
  - switch the notifications to `getConnectionName`.
  Verify by extending `apps/mobile/src/components/preferences/connections/connection-auth.test.tsx`, adding an `epicgames` `delegated_code` provider to the mocks, with cases for:
  - Continue calls init once with the auto-import settings and doesn't call `onRedirect`;
  - the sign-in button calls `onRedirect` with the URL;
  - pasting a raw code, and pasting the JSON page, each sends the callback with the state and the trimmed text;
  - pasting `{"sid":null}` sends nothing and shows the error;
  - a rejected callback disables resubmission, and "Start over" requires a new init;
  - Reconnect on a `reauth_required` connection starts the flow;
  - the existing Steam, Xbox and PSN cases pass unchanged.
  Run with `yarn workspace mobile test connection-auth`.
- [x] 2.4 In `ImporterScreen.tsx`, add `"epicgames"` to `VALID_SOURCES` and derive `sourceName` from `getConnectionName` for valid sources. Verify that `apps/mobile/src/components/importer/importer-screen.test.tsx` passes, and add one case where source `epicgames` renders "Epic Games".

## 3. Mobile

- [x] 3.1 Add `<PreferencesConnectionItem type={UserConnectionDto.type.EPIC_GAMES} />` to `apps/mobile/src/components/preferences/connections/PreferencesConnectionsItems.tsx`, after Xbox. Verify with `yarn workspace mobile typecheck`, and confirm in the running mobile web build that Epic Games appears with its icon in the connections list.

## 4. Admin

- [x] 4.1 Add `EpicGamesNamespace = 1001` to `apps/admin/src/components/external_game/constants.ts`. Add `utils/getExternalLookupUrl.ts` (Steam → SteamDB, Epic namespace → `egdata.app/sandboxes/<uid>`, otherwise `undefined`), with a jest test covering the three branches and the label "Epic Games Namespace" from `getExternalSourceName`. Run with `yarn workspace admin test getExternalLookupUrl`.
- [x] 4.2 In `UnmappedExternalGamesTable.tsx`, replace `onVisitClick` and its `alert` with the helper: an anchor `ActionIcon` (`target="_blank"`) that is disabled when no URL exists. Verify in the admin dev server that Steam rows link to SteamDB and other categories show a disabled icon.
- [x] 4.3 Create `MatchExternalGameModal.tsx` as in D7: a source chip, game choice through `GameSearchSelectModal` with a `useGame` preview, a source URL prefilled from `getExternalLookupUrl` and validated with `URL.canParse`, and submission through `externalGameControllerSubmitExternalGameV1`. On success, notify and invalidate the unmapped query. On 409, show a yellow `Alert` saying IGDB already maps this ID. Wire it to the table's "Match" row action. Verify with `yarn workspace admin lint` and a manual match against a local server: the row disappears after success, and an IGDB-mapped Steam ID shows the 409 alert.
- [x] 4.4 Create `EpicNamespaceFillPanel.tsx` as in D7: the panel, the trigger button with a loading state, a state `Badge` in stock colors, the job ID, the in-progress text for `active` and `waiting`, an inline error, and the `shortcut:` cast comment. Render it above the table on `pages/dashboard/game/external/index.tsx`. Verify against a local server that the first trigger shows `epic-namespace-fill` with its state, and a second trigger while active shows the in-progress text.

## 5. Integration checks

- [x] 5.1 Run `yarn lint` and `yarn build` at the root, plus `yarn workspace mobile test`. Verify that they all pass.
- [ ] 5.2 Manual end-to-end check on web against a local server with Epic credentials: connect Epic through the paste-code flow (raw code and whole-page paste), see "Connected" with the Epic display name, open `/importer/epicgames`, then force `reauth_required` and reconnect. Check the same flow once in the Android or iOS build using the in-app browser. Record any mismatch with the specs in design.md.

## Workflow follow-up

- Deploy game-node-server's `add-epic-games-connection` before releasing these clients.
- Archive the change after review.
