# Tasks

## 1. Generated client

- [x] 1.1 Diff `packages/wrapper/input/server_swagger.json` against `../game-node-server/server_swagger.json` (branch `feature/add-custom-game-covers`) and confirm every uncommitted `add-supporter-profile-video` schema and route exists in the server export; verify by listing any path or schema present only in the local file (expect none, or resolve before continuing).
- [x] 1.2 Replace the swagger and run `yarn wrapper:generate`; verify `GameCoverService` equivalents, `personalizeCovers`, `coverOwnerUserId`, `customCoverMode` and `hasCustomCover` appear in `packages/wrapper/src/server`.
- [x] 1.3 Audit the positional arguments of the three `CollectionsEntriesService` listing calls (`useCollectionEntriesForUserId`, `useFavoriteCollectionEntriesForUserId`, `useCollectionEntriesForCollectionId`) against the regenerated signatures and fix any shift; verify with `yarn type-check` and by reading each call against its signature.

## 2. Cover request resolution

- [x] 2.1 Implement the pure resolver and `useGameCoverRequest` per design Decision 1, including the `personalizeGameCovers` UI hook registry value; verify with a mobile vitest covering every row of the decision table, including owner equal to viewer and a missing `customCoverMode`.
- [x] 2.2 Update `useGame` and `useGames` with the cover argument, key element, placeholder data and request fields; verify with hook tests that unpersonalized keys and request bodies are unchanged, personalized reads send the right fields, and the key differs by viewer, owner and mode.
- [x] 2.3 Set `personalizeGameCovers: false` in `apps/admin` `UIProvider`; verify by a resolver test for the disabled flag and `yarn type-check -F admin`.
- [x] 2.4 Run the full `yarn workspace mobile test` and add a shared session mock where the new hook breaks tests; verify the suite passes.

## 3. Call sites

- [x] 3.1 Pass `ownerUserId` at every owner call site in design Decision 4, adding a cover parameter to `useUserRecentGames`; verify with tests for `LibraryView` (another user sends `coverOwnerUserId`, own library sends `personalizeCovers`) and for a pending owner sending no opt-in field.
- [x] 3.2 Pass `"off"` at the Daily, recap, wrapped and activity call sites; verify with tests that `DailyGuessList` and `ActivityItem` send no opt-in fields.
- [x] 3.3 Confirm `apps/web/src/pages/game/[id]/index.tsx` and `explore/index.tsx` prefetches send no opt-in fields and that their keys still match the hooks' unpersonalized keys; verify by a hook test that a seeded default entry renders without a loading state and by loading a game page in `yarn dev -F web`.
- [x] 3.4 Confirm `useSearchGames` and the other search hooks are untouched; verify with `git diff --stat` on those files showing no change.

## 4. Image fallback

- [x] 4.1 Implement `useGameCoverImage` per design Decision 9; verify with tests for one fallback fetch, placeholder after a second failure, no retry of a failed URL, reset on a new URL and no fetch for search games.
- [x] 4.2 Adopt it in `GameFigureImage` (composing `imageProps.onError`) and in personalized raw `getCoverUrl` users (`GameTitleWithFigure`, `SettingsProfileFavorites`, `CollectionThumbnailCard`, `AchievementBadge`, landing `PopularSection`) and the mobile equivalents; verify with a component test on `GameFigureImage` and `yarn type-check`.

## 5. Cover picker

- [x] 5.1 Add options, current-choice, choose and clear hooks using the `["game-cover", gameId, ...]` keys, plus `invalidateGameCoverQueries` per Decision 6; verify with tests for invalidated keys after `PUT` and `DELETE` and that the choice query is disabled when signed out.
- [x] 5.2 Build `GameCoverPickerModal` with the default option, labels and kind names, selected state, empty state, per-option image failure and the mode `none` notice, with strings in `en.json` and `pt-BR.json`; run `yarn locales:generate-types` and `yarn workspace @repo/ui barrels:generate`; verify with component tests for each state.
- [x] 5.3 Implement the sign-in prompt for signed-out selection and 401 responses, checking how `handleAuthError` behaves for these mutations; verify with tests that signed-out selection sends no request and that a 401 shows the prompt without a redirect.
- [x] 5.4 Open the picker from `DEFAULT_GameInfoActions` and `MobileGameInfoActions` with no library or supporter gating; verify with a test that the action renders with no library entry, and manually on web and mobile dev servers per `docs/local-browser-testing.md`.
- [x] 5.5 Open the picker from `CollectionEntryFormDetailsPanel`: a compact button below `GameFigureImage` when `showGameInfo` is true and an icon action beside the title when it is false, both `type="button"` so they never submit the entry form; verify with tests for both layouts opening the picker without submitting.

## 6. Display mode setting

- [x] 6.1 Add the custom covers section to `SettingsAppearanceTab` with the three modes and translated explanations, saving through `profileControllerUpdateV1`, invalidating the profile and personalized game queries; verify with tests for the current mode, a successful change invalidating those queries, and rollback with an error notification on failure.

## 7. Custom cover filter

- [x] 7.1 Add `hasCustomCover` to the three collection entry hooks, sending it only when true and appending `{ hasCustomCover: true }` to the key; verify with tests that requests and keys are unchanged when off and that positional arguments are correct when on.
- [x] 7.2 Add a filter chip to `LibraryViewActions` and the collection view actions, backed by URL state and resetting the offset, with translated labels; verify with a test that toggling sends the filter and returns to offset 0, and that the owner-with-no-choices case shows the empty state.

## 8. Integration and release

- [x] 8.1 Add a changeset naming `web`, `mobile` and `admin`; verify with `yarn changeset status`.
- [x] 8.2 Run `yarn lint`, `yarn type-check`, `yarn workspace mobile test` and `yarn workspace admin test`; verify all pass.
- [ ] 8.3 With a local server on the feature branch, walk through choosing a cover, seeing it in the library, viewing another user's library, each display mode and signing out; verify each matches the spec's effective cover behavior.
