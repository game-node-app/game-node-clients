# Design

## Context

See `proposal.md` for motivation and the two capability specs for behavior. The sibling backend change is complete; its controller, DTOs, `server_swagger.json`, and `docs/statistics.md` agree on the replacement runtime routes. No major backend blocker was found. Its recorded backend test results are reference evidence, not frontend checks performed during this proposal.

The client still uses these retired contracts:

| Area | Observed coupling |
| --- | --- |
| `packages/wrapper` | Old trending DTOs, statistics entities, queued-view service, and a status operation taking `statisticsId`. Generation reads `input/server_swagger.json` through `generate.js`. |
| Shared statistics hooks | `useItemStatistics` reads a row and then its ID-based status, using a generic game/review type even for posts/comments. `useUserView` submits the queued request and deduplicates by a stringified source ID. `useTrendingGames` omits period from its cache key; the infinite hook retains results forever. |
| Home and game reviews | `TrendingGamesList` reads `data[].gameId`; `TrendingReviewCarousel` reads `data[].reviewId` and statistics row keys. `GameInfoReviewList` reads `totalPages` and sorts hydrated reviews by content presence, which can override a server pin. |
| Web Explore | URL parsing copies arbitrary query keys into criteria. Server prefetch duplicates the infinite query key and uses a content key that differs from `useGames`. Both page rendering and prefetch consume legacy game statistics. |
| Mobile | Explore flattens legacy pages; its refresh invalidates the existing trending-game prefix. Game views use a source-ID ref, while Ionic can retain game pages between visits. |
| Other callers | Activity, comment, post, review, and profile-review components import the legacy source-type enum. Existing reaction tests live under `apps/mobile/src/components/statistics`. Admin has no direct statistics-route calls. |

The completed client notification change already establishes source-only synchronous reactions and optimistic reconciliation. Preserve those requirements without editing that change or duplicating its notification work.

## Goals / Non-Goals

**Goals:** Replace the contracts in the existing wrapper/hooks and connect every current consumer. Keep native identities, strict request validation, actor-correct caches, backend ranking order, and navigation impression semantics coherent across both clients.

**Non-Goals:** A new statistics abstraction, compatibility adapters, additional dependencies, new analytics screens or ranking controls, a general retry/offline queue, changes to shared content-fetching contracts, backend code, or unrelated wrapper migrations. Preserve freshness/coverage fields in returned data; no new metadata dashboard or latency promise is needed.

## Decisions

### 1. Update only the statistics OpenAPI surface

Replace the statistics paths and their schema dependencies in `packages/wrapper/input/server_swagger.json` from the sibling backend export. Include summary/status/series/ranking/view DTOs and retain reaction paths/responses. Remove legacy statistics/trending/action/status schemas and queue paths when no remaining reference needs them. Do not import internal `StatisticsTarget` storage merely because it exists in the backend export.

The export has bounded typing defects, confirmed against `src/statistics/dto/statistics-api.dto.ts` and runtime validation:

- `StatisticsRankingsRequestDto.limit` and `.offset` are exported as objects. Declare them as integers, retaining defaults and min/max bounds.
- The status query's `sourceId` references `Object`; replace that parameter schema with the string-UUID/integer union already used by `StatisticsSourceRequestDto`.
- The preserved `ReactionRequestDto.sourceId` also has the pre-existing object annotation. Normalize this statistics-related schema to the same native-ID union to avoid carrying an unsafe cast through the migration.

Make these corrections in the checked-in OpenAPI input with a concise explanation in the schema descriptions; never hand-edit generated TypeScript or add a normalization framework. Run `yarn --cwd packages/wrapper build`, inspect the output, and remove stale generated statistics files/exports, including stale declaration references if tracked. Check that unrelated paths and schemas remain unchanged. A whole-file replacement was rejected because the backend also contains unrelated API changes.

### 2. Combine source summary and actor status in the existing hook

Replace the legacy generic with `StatisticsSummaryDto & StatisticsStatusDto`. `useItemStatistics` issues summary and status requests using the same normalized source tuple; they can run concurrently because status no longer depends on the summary. Preserve rejection from either request, and retain response metadata.

Use `StatisticsSourceRequestDto` as the source-kind reference in the hook and all legacy enum callers: `useUserLike`, `useUserView`, `getCommentStatisticsType`, `ActivityItemLikes`, `PostsListItem`, `ReviewListItem`, `ProfileReviewListItem`, both game pages, and reaction fixtures. Canonicalize game route IDs to positive safe integers once before requests/cache identity; leave content UUIDs intact. Disable unresolved/invalid source reads and views rather than querying the literal `undefined` route value. Existing UUID validation at the backend remains authoritative.

Keep the item cache prefix `['statistics', sourceType, canonicalSourceId]` and append the current actor ID or an anonymous marker. This makes anonymous-to-authenticated transitions correct without changing existing broad invalidation prefixes. Preserve the source-only reaction requests, optimistic non-negative count, committed reconciliation, and rollback in `useUserLike`; merge response fields so summary metadata and view state survive. Adapt fallback/cache fixtures to the new shape without inventing successful freshness metadata for unread summaries. Replacing the whole reaction implementation was rejected because its behavior already satisfies the predecessor contract.

### 3. Bind a view request to one navigation identity before dispatch

Keep `useUserView` and its return tuple, but have its increment callback accept the visit's `viewId`. Game-page callers create that UUID using platform `crypto.randomUUID()` in client lifecycle code, never during server rendering. The hook sends a complete immutable `{ sourceType, sourceId, viewId }` as mutation variables; any retry uses those same variables even if the page has since changed source.

On web, retain one UUID in a ref for the current valid game-route visit, generate another when the game changes or the page mounts again, and ignore tab/query-only updates. On mobile, use Ionic view-entry/leave lifecycle callbacks to start/end visits, including re-entry of a retained page; account for a changed game ID in the same component. Repeated triggers within one visit pass the same UUID. Replace the existing refs that mark the source as registered before the request succeeds.

Deduplicate pending/accepted dispatches by impression identity in the hook. A failed attempt remains retryable with its original binding; acceptance is recorded only after `{ accepted: true, viewId }`. On acceptance invalidate the captured source's engagement query, preserving reaction fields and trusting projected view counts. Do not increment views locally or suppress impressions because `isViewed` was previously true. No new automatic retry policy, offline persistence, UUID dependency, or global visitor identity is needed. Deduplication solely by source ID was rejected because a return visit is a new impression.

### 4. Retain the discovery hooks and consume ranking responses directly

Keep `useTrendingGames`, `useInfiniteTrendingGames`, and `useTrendingReviews` as the existing product entry points. Use the generated common request DTO with source fixed by each hook and explicit `popular` mode. Update callers to its period enum; do not adapt responses back into legacy `GameStatistics` or `ReviewStatistics` shapes. No current caller supplies the old review `userId`; use `authorId` if an author selector is passed.

Return `StatisticsRankingResponseDto` directly. Home keeps month with six games/ten reviews; game reviews keep all time, seven results, `gameId`, `excludeOwn`, and the optional `reviewId`. Explore keeps month and its existing 20/48 page sizes and period choices.

Cache finite queries with the complete effective request, including period/mode/filter selectors; include actor identity for review results. Keep the infinite prefix `['statistics', 'trending', 'game', 'infinite']` and place the effective request without offset after it. Export the small key builder from that hook for web prefetch so the same defaults cannot drift. Replace infinite stale time with ordinary query freshness, remove previous-selection placeholder data that would display the wrong filters, and reset pages on filter/period changes. Mobile pull-to-refresh uses this prefix and resets the active traversal to its first page.

Next offset is `pagination.offset + pagination.limit`, and exists only when `hasNextPage` is true and the result is at most 10,000. For numbered reviews, derive total pages as `min(ceil(total / limit), floor(10000 / limit) + 1)`; keep empty-state handling and reset offset on game/target selector changes. Do not let either UI request a page the server rejects.

Update every ranking consumer to read `items[].sourceId`, narrowing by the fixed source kind to numeric game IDs or review UUIDs. Hydrate through existing `useGames`, `useReviews`, and review cards. At the changed list boundaries, match fetched entities back to ranked IDs; do not change these shared hydration hooks' behavior for other callers. Remove the game-review content-first sort that overrides ranked/pinned order. Flatten live infinite pages with first-occurrence deduplication; skip content batch calls for empty IDs. A new generic ranking/hydration layer was rejected because the current hooks and local mapping suffice.

### 5. Normalize Explore inputs and align server prefetch

In web Explore utilities, explicitly allow the backend game criteria keys: `ids`, `status`, `category`, `themes`, `gameModes`, `platforms`, and `genres`. Parse URL/form resource IDs as positive safe integers; validate status/category against their generated enums. Preserve valid comma-separated values, omit invalid values/unknown properties, and default invalid periods to month. Send no nested criteria pagination or unrelated URL properties. Keep URL serialization and form values compatible with current shareable links.

Use the same normalization for server prefetch and browser submission, retaining form selections when changing only period. Prefetch `/v1/statistics/rankings` at offset zero with the infinite hook's key builder, extract `items[].sourceId`, and prefetch content with `useGames`' actual key `['game', 'all', gameIds, relations]`. Do not add a generic request builder when the existing Explore utilities already own normalization.

### 6. Use focused existing test infrastructure

Use mobile's installed Vitest/jsdom and Testing Library setup for shared hooks/components; no test stack is added to `packages/ui`. Extend the existing reaction test with valid UUIDs and complete summary/status fixtures, mocking the read endpoints or controlling query freshness so no accidental network request supplies its outcome.

Add a small set of observable checks covering: source-based reads and session changes; view retry identity/pending duplicates/return visits with an injected failed acknowledgement; ranking period/filter identity, response pagination and the 10,000 boundary; hydration order/empty and overlapping pages; Explore URL normalization and prefetch key parity. Cover multiple requirements per fixture. Exercise generated request serialization with intercepted fetch where practical instead of mocking every wrapper method. Do not test generated enum values or TypeScript guarantees.

Use `yarn --cwd apps/mobile test.unit --run` with the selected statistics tests, then package/app TypeScript checks using existing scripts or `yarn --cwd <app> exec tsc --noEmit` where no type-check script exists. Include wrapper, shared UI, web, mobile, and admin dependency compilation. Record unrelated baseline failures separately. Run `git diff --check` and strict OpenSpec validation. Browser automation, backend integration suites, device builds, load testing, and deployment are outside this frontend implementation's acceptance.

## Risks / Trade-offs

- [Breaking cutover] → Release the frontend wrapper and all callers with the replacement backend; old deployed clients require an updated build, with no retired-route fallback.
- [Swagger annotations can drift] → Limit local corrections to the documented statistics fields, retain backend constraints, and verify generated transport requests. Backend annotation cleanup is optional follow-up, not a runtime blocker.
- [Live pages can move between requests] → Preserve response order, deduplicate overlapping sources, and reset traversal on refresh; do not claim snapshot completeness.
- [Projection is asynchronous and converted history can be incomplete] → Preserve lag/coverage fields and trust returned counts; no fabricated totals or completion timing.
- [Ionic retains pages] → Count actual view entries and verify a retained-page return, rather than treating mounting or source-ID equality as navigation.
- [Offset cap limits deep browsing] → Stop at the last legal page while retaining the server's accurate total; a new pagination model would require separate backend/product work if later requested.

## Migration Plan

1. Update the scoped OpenAPI input, apply the bounded schema corrections, and regenerate/clean the wrapper.
2. Migrate source reads/reactions/views and all source-type references, then rankings, discovery consumers, Explore normalization, and server prefetch together before release.
3. Run focused frontend contract/behavior checks and affected compilation; confirm no retired routes/models remain in runtime consumers or public wrapper exports.
4. Coordinate deployment with the backend's documented offline statistics cutover. This change performs no backend maintenance or deployment. Roll back client and API versions together; rolling back only the client would restore calls to removed routes.
