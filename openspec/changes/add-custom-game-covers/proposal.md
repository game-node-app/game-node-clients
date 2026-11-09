# Proposal

## Why

The server now lets a user choose an alternative IGDB cover per game and returns that choice on opted-in game repository reads (branch `feature/add-custom-game-covers` in `game-node-server`). Nothing in the clients can choose, display or filter by these covers yet.

## What Changes

- Regenerate `@repo/wrapper` from the server's swagger to get the cover routes, the `personalizeCovers` / `coverOwnerUserId` read fields, `customCoverMode` on profiles and the `hasCustomCover` entry filter.
- Add a cover picker on the game page (web and mobile) that lists the options, stores a choice and returns to the default cover. Signed-out users can browse it and are asked to sign in when they choose. It is not gated on a library entry or supporter status. The same picker opens from the collection entry add/edit form (`CollectionEntryFormDetailsPanel`), so a cover can be changed while adding a game to the library.
- Personalize covers on game reads. Own and owner-less surfaces show the viewer's choice; another user's library, favorites, collections, profile and reviews show that user's choice, subject to the viewer's display mode.
- Keep default covers in admin, Daily, recap/wrapped and on every server-side prefetch. Web SSR keeps rendering the default cover and the client swaps it in, without a loading state.
- Include the cover context in game query keys, and invalidate affected queries when a choice or the display mode changes.
- Fall back once to the default cover when a chosen cover's image fails to load.
- Add a "custom covers" display mode setting (`any`, `prefer_yours`, `none`).
- Add a "custom covers" filter chip to library and collection views, backed by `hasCustomCover`.
- **Deviation from the hand-off:** the feed is not batched by owner. `ActivityItem` and `ObtainedAchievementActivityContent` request `relations.cover` but never render a cover, so they stay unpersonalized and cost no session or profile lookup.

Not in this change: custom covers in search results, image upload or cropping, and any server change.

## Capabilities

### New Capabilities

- `game-cover-selection`: Choosing or clearing a game's cover in the picker, and the viewer's custom cover display mode setting.
- `game-cover-display`: Which cover a client shows on each surface, how personalized data is kept apart between viewers, owners and modes, and the image failure fallback.
- `custom-cover-entry-filter`: Restricting library, favorites and collection listings to games with a custom cover chosen by the listing owner.

### Modified Capabilities

None. The only existing specs cover blog behavior.

## Impact

- **Generated client:** `packages/wrapper/input/server_swagger.json` and `packages/wrapper/src/server`. Service methods with positional parameters may change their argument order.
- **Shared UI (`packages/ui`):** `useGame`, `useGames`, `GameFigureImage`, about 25 cover-rendering call sites, game info actions, library and collection filters, the appearance settings tab, collection entry hooks and the UI hook registry.
- **Apps:** `MobileGameInfoActions`, mobile collection and review cards, and an admin `UIProvider` flag. Web SSR prefetch keys stay the same.
- **Locales:** new keys in `en.json` and `pt-BR.json`.
- **Server cost:** each opted-in signed-in read costs a session and a profile lookup. Surfaces where the result is known to be the default do not opt in.
- **Sequencing:** requires the server branch deployed first. The working tree has uncommitted swagger and wrapper edits from `add-supporter-profile-video`, which the regeneration must not lose.
