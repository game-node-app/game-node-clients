# Tasks

## 1. Wrapper and exhaustive provider matches

- [x] 1.1 Copy `../game-node-server/server_swagger.json` (from the server branch `feat/add-nintendo-connection`) to `packages/wrapper/input/server_swagger.json` and run `yarn wrapper:generate`. Verify that `UserConnectionDto.type.NINTENDO`, `NotificationConnectionTargetDto.provider.NINTENDO` and category `1002` on `SubmitExternalGameDto` exist in `packages/wrapper/src/server`.
- [x] 1.2 Add `NINTENDO` branches as in design D5:
  - `getConnectionName`: "Nintendo";
  - `getConnectionProfileURL`: `undefined`.

  Verify that `npx tsc --noEmit -p packages/ui` passes. Then run `grep -rn "EPICGAMES\|\"epicgames\"" packages/ui/src apps --include=*.ts --include=*.tsx`, and confirm that every provider list it finds has a Nintendo counterpart, except tests (group 2) and the landing page (out of scope).

## 2. Nintendo paste step and presentation (shared UI and mobile)

- [x] 2.1 Add the `preferences.delegatedCode.nintendo.*` keys from design D4 to `en.json` and `pt-BR.json`. For `revoke`, first check accounts.nintendo.com for the menu that lists or revokes signed-in apps, then write the copy D4 allows, and record the finding under Open Questions in design.md. Run `yarn locales:generate-types`, and verify that the generated schema includes the keys.
- [x] 2.2 In `PreferencesConnectionDelegatedCode.tsx`, add the `isNintendo` branches from D1–D4:
  - the `checkNintendoLink` check, which shows `invalidLink` or `otherAttempt` inline and sends nothing;
  - the marked link preview;
  - the Nintendo hint, label and placeholder;
  - `coverage`, `revoke` and `phoneHint` under the sign-in button.

  Epic's paths must stay unchanged. Verify by extending `apps/mobile/src/components/preferences/connections/connection-auth.test.tsx`: add a `nintendo` `delegated_code` provider to the mocks, then add these cases:
  - init opens the returned URL only on its own click;
  - the coverage text is shown;
  - a padded `npf5c38e31cd085304b://auth#session_token_code=x&state=<state>` is sent trimmed as `callbackParams.code` with the state;
  - `https://accounts.nintendo.com/` sends nothing and shows the invalid-link error;
  - a link with another `state` sends nothing and shows the other-attempt error.

  The existing Epic cases must pass unchanged. Run with `yarn workspace mobile test connection-auth`.
- [x] 2.3 Add `"nintendo"` to `VALID_SOURCES` in `ImporterScreen.tsx`. Add a case to `apps/mobile/src/components/importer/importer-screen.test.tsx`, next to "names epicgames as Epic Games", in which source `nintendo` renders "Nintendo". Run with `yarn workspace mobile test importer-screen`.
- [x] 2.4 Add Nintendo cases to `apps/mobile/src/components/notifications/connection-reauth-notification.test.tsx`:
  - a reauth row reading "Your Nintendo connection needs to be reconnected.", plus its pt-BR text, with icon `nintendo`;
  - an import notification reading "3 new games ready to be imported from your Nintendo connection" that pushes `/importer/nintendo`.

  Run with `yarn workspace mobile test connection-reauth-notification`.
- [x] 2.5 Add `<PreferencesConnectionItem type={UserConnectionDto.type.NINTENDO} />` after Epic Games in `apps/mobile/src/components/preferences/connections/PreferencesConnectionsItems.tsx`. Verify with `yarn workspace mobile typecheck`.

## 3. Admin

- [x] 3.1 Make the admin changes from design D6:
  - add `NintendoTitleId = 1002` to `apps/admin/src/components/external_game/constants.ts`;
  - add the `Id → ID` replacement in `getExternalSourceName.ts`;
  - extend `getExternalLookupUrl.test.ts`: category `1002` is labeled "Nintendo Title ID" and has no lookup URL, and the existing Steam and Epic labels are unchanged.

  Run with `yarn workspace admin test getExternalLookupUrl`.

## 4. Integration checks

- [x] 4.1 Run `yarn lint` and `yarn build` at the root, plus `yarn workspace mobile test` and `yarn workspace admin test`. Verify that they all pass.
- [x] 4.2 Run web against a local game-node-server on `feat/add-nintendo-connection`, and check end to end with a real Nintendo Account: (Checked on web: connected with nickname and icon, importer empty because the account has no games, profile icon without link. Admin `1002` match skipped, no play history.)
  - Nintendo appears in the connections list with its icon;
  - the setup shows the Nintendo notice;
  - "Open Nintendo sign-in" opens the login in a new tab;
  - right-click "Copy link address" on "Select this account", then paste and submit, links the account as "Connected" with the Nintendo nickname;
  - `/importer/nintendo` names "Nintendo";
  - the profile shows the Nintendo icon without a link.

  Then match one unmapped `1002` row in the admin, if the account has play history.
- [ ] 4.3 In the Android and iOS builds, open Nintendo setup and try long-pressing "Select this account" in the in-app browser. Record in design.md, under Risks, whether "Copy link" is offered and whether the pasted link links the account.

## Workflow follow-up

- Archive `add-epic-games-connection` before archiving this change. Archive refuses this change's MODIFIED delta until then.
- Release these clients before or together with game-node-server's `add-nintendo-connection` (design.md, Migration Plan). Tell the server change to fix its Migration Plan step 2.
