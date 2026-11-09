# Design

## Context

See `proposal.md` for motivation and the specs for required behavior. Observed state that shapes the approach:

- All game reads go through `useGame` (`["game", id, dto]`) and `useGames` (`["game", "all", gameIds, relations]`), with about 55 call sites between them. Many `useGame` callers share `DEFAULT_GAME_INFO_VIEW_DTO` and depend on sharing one cache entry.
- Web SSR prefetches those exact keys on `game/[id]` and `explore`. `GameInfoView` renders `CenteredLoading` when there is no data, so a client key that misses the hydrated entry would replace SSR content with a spinner.
- `useUserId` cannot distinguish "session pending" from "signed out", and it also returns `debugUserId`.
- Web defaults to `staleTime: Infinity`. Mobile keeps `gcTime: Infinity`.
- `signOut(queryClient)` already runs `queryClient.clear()`.
- `ActivityItem` and `ObtainedAchievementActivityContent` request `relations.cover` but render no cover.
- Generated `CollectionsEntriesService` methods take positional arguments.

## Goals / Non-Goals

**Goals:**

- One place decides the opt-in, so 55 call sites cannot drift apart.
- Unpersonalized requests and keys remain byte-identical to today.

**Non-Goals:**

- Batching game reads for feeds (see Decision 7).
- Keeping covers in sync across a user's devices beyond normal query freshness.

## Decisions

### 1. Personalization is resolved inside `useGame` / `useGames`, on by default

Add an optional cover argument: `useGame(id, dto, cover?)` and `useGames(dto, keepPreviousData, cover?)`, typed `{ ownerUserId: string | null | undefined } | "off"`. Omitted means viewer personalization. A new `useGameCoverRequest(hasCoverRelation, cover)` hook returns `{ fields, keyPart }`, backed by a pure, unit-tested function:

| Condition (first match wins) | Sent | `keyPart` |
| --- | --- | --- |
| No `relations.cover`, `"off"`, or app disabled | nothing | none |
| Session pending, or `ownerUserId` is `undefined` (owner loading) | nothing | none |
| Anonymous, no owner | nothing | none |
| Anonymous, owner | `coverOwnerUserId` | `{ viewer: null, owner, mode: "any" }` |
| Signed-in, profile not loaded or failed | nothing | none |
| Mode `none` | nothing | none |
| Owner absent or equal to the viewer | `personalizeCovers: true` | `{ viewer, owner: null, mode }` |
| Owner is another user | `coverOwnerUserId` | `{ viewer, owner, mode }` |

A surface with no owner omits the argument. `ownerUserId: undefined` is reserved for "owner still loading".

- Default-on was chosen over opt-in per call: most callers want it, and sharing the resolved key keeps callers of `DEFAULT_GAME_INFO_VIEW_DTO` on one cache entry and one request.
- The fields stay out of the `dto` argument so SSR callers cannot send them by accident.
- The hook reads `authClient.useSession()` directly for `isPending`. `debugUserId` previews count as anonymous, because there is no session for the server to read.

### 2. Keys stay unchanged when not opted in, and gain one marked element when opted in

Personalized keys append `{ coverContext: keyPart }` to the existing key. Existing prefix invalidations (`["game", id]`, `["game", "all"]`, `useGames.invalidate`'s first three segments) keep matching, SSR hydration keeps working, and a shared `isPersonalizedGameQuery` predicate can check the last key element.

### 3. Default-to-personalized transition uses placeholder data

Both hooks set `placeholderData` to the cached unpersonalized entry for the same read (`keepPreviousData` still wins in `useGames`). Because pending states resolve to the default form first, that entry exists when the key changes. Considered: gating the query until the viewer is known, which would blank every surface and break SSR content.

### 4. Owner-context call sites

| Cover argument | Call sites |
| --- | --- |
| Omitted (viewer) | Game page and shared DTO callers, trending, recommendations, explore, awards, landing, `SettingsProfileFavorites`, `SupporterProfilePreview`, `GameSearchSuggestions` |
| `ownerUserId` | `LibraryView`, `CollectionView`, both collection thumbnail cards, `CollectionEntryDetailView`, `CollectionEntryDetailRelatedEntries`, web collection entry page, `ProfileFavoriteGames`, `RecentCollectionEntriesView` (via `useUserRecentGames`), `ProfileReviewListItem`, `TrendingReviewCard`, `MobileTrendingReviewCard`, `JournalOverviewItem`, `JournalAchievementsGameGroupView`, `UserPlaytimeItem` |
| `"off"` | `DailyGuessList`, `DailyResultPanel`, `RecapGamePlaytimeCard`, `RecentlyPlayedGamesShare`, `ActivityItem`, `ObtainedAchievementActivityContent` |

`GameSearchSuggestions` shares `useUserRecentGames` with the owner path and passes the viewer's id, which normalizes to `personalizeCovers`. Trending reviews use the reviewer as owner because they present that user's content.

### 5. Admin opts out through the UI hook registry

Add `personalizeGameCovers?: boolean` to `UIHookRegistry` (default `true`), which `apps/admin` sets to `false` in its `UIProvider`. This follows the existing value entries such as `authPath`, avoids branching on `PROJECT_CONTEXT.client`, and also covers shared components rendered inside admin.

### 6. Invalidation

`invalidateGameCoverQueries(queryClient, gameId)` invalidates `["game", gameId]`, `["game", "all"]`, the `["game-cover", gameId]` choice query, and entry listings carrying the filter. Filtered listing keys append `{ hasCustomCover: true }` only when enabled, so unfiltered listings keep their keys and are not refetched for nothing.

Mode changes invalidate `["userProfile", viewerId]` and every query matching `isPersonalizedGameQuery`. Sign-out is already covered by `queryClient.clear()`; viewer identity in the key covers sign-in. The picker's own queries are keyed `["game-cover", gameId, "options"]` and `["game-cover", gameId, "mine", userId]`.

### 7. Feed batching is dropped

The hand-off assumes feed items render covers. They do not, so `"off"` removes the per-item session and profile cost entirely, which is the outcome batching was meant to approach. If a future feed design shows covers, batching needs a deferred loader because each item learns its `gameId` from its own query. That work belongs with that design.

### 8. Picker placement

A new `GameCoverPickerModal` uses the injected `Modal`, so mobile gets `ion-modal`. Both `DEFAULT_GameInfoActions` and `MobileGameInfoActions` open it, since `GameInfoActions` is overridden per app. Signed-out selection does not call the API and shows a sign-in prompt linking to `useAuthPath()`. A 401 from `PUT` or `DELETE` shows the same prompt. Other errors use `createErrorNotification`.

`CollectionEntryFormDetailsPanel` also opens the same modal for its game. When `showGameInfo` is true (the default), a subtle `variant="default"` button sits in the cover column right below `GameFigureImage`. When `showGameInfo` is false — the narrow breakpoint where the cover column is hidden, e.g. the mobile initial sheet — a compact `ActionIcon` with the same label sits beside the game title instead, so the action is always reachable without a duplicate accessible name. Both use `type="button"`, because the panel renders inside the collection entry `<form>`, where a default submit button would save the entry.

### 9. Image fallback hook

`useGameCoverImage(game, size)` returns `{ src, onError }`.

1. On the first failure of a `Game` object's URL, it runs `queryClient.fetchQuery` for the unpersonalized `["game", id, { relations: { cover: true } }]`.
2. If that URL differs, it is used. Otherwise the placeholder is shown.
3. Failed URLs are held in component state, and a new incoming URL resets it.

The response does not say whether a cover was personalized, so any `Game` image failure takes this path; it is one shared, cached read at most. Search games go straight to the placeholder. `GameFigureImage` composes this with any `imageProps.onError`. Other personalized raw `getCoverUrl` users adopt it too.

### 10. Mode setting lives in the appearance tab

A new section in `SettingsAppearanceTab` is saved on change through `profileControllerUpdateV1({ customCoverMode })`. A missing server value reads as `any`.

## Risks / Trade-offs

- [Signed-in cold load makes two reads for a surface: default, then personalized] → Accepted for instant paint. It applies only until session and profile are cached.
- [A default cover flashes before the personalized one] → Accepted by the hand-off's "render default first".
- [Regeneration changes positional argument order in `CollectionsEntriesService`] → A task audits all three call sites against the new signatures; `type-check` will not catch swapped arguments of compatible types.
- [Swagger overwrite loses uncommitted `add-supporter-profile-video` API] → A task diffs the existing file against the server export before replacing it.
- [New `authClient.useSession` usage breaks tests that do not mock it] → Run the full mobile suite in the first hook task and add a shared mock where needed.
- [`handleAuthError` in `MutationCache` may redirect on a 401 before the picker prompt shows] → The picker task checks this path and adds a test; it may need to skip global handling for these mutations.

## Migration Plan

Deploy the server branch first, since unknown body fields would otherwise be rejected or ignored depending on server validation. Rollback is an app revert; stored choices are unaffected.
