# Tasks

Use the two capability specs for behavior and `design.md` for the inspected file scope and contract decisions. Implement only in `game-node-clients`; backend cutover/deployment is not a task here. Reuse the installed mobile Vitest/Testing Library setup, keep fixtures small, and update each checkbox when its behavior and focused check pass. Record unavailable or pre-existing failures separately; scenarios do not require one test each.

## 1. Replacement wrapper contracts

- [x] 1.1 Update only statistics paths and referenced public schemas in `packages/wrapper/input/server_swagger.json` from the backend export, preserving reaction routes and unrelated APIs. Correct ranking limit/offset and status/reaction source-ID types to the DTOs, documenting the local corrections in schema descriptions. Verify scoped schema/path differences, valid references, and retained constraints/defaults with a focused comparison against both API inputs.
- [x] 1.2 Regenerate with `yarn --cwd packages/wrapper build`; remove obsolete statistics models, queue service, and stale public/declaration exports. Add a focused generated-transport check for source-based status, ranking numeric pagination, durable view bodies, and retained reaction requests; verify no generated operation targets retired routes and unrelated contracts remain unchanged.

## 2. Source summaries, actor status, and reactions

- [x] 2.1 Replace legacy statistics generics with summary/status DTOs in `useItemStatistics`; use native source IDs for both requests, disable unresolved/invalid game sources, preserve read failures/metadata, and scope the canonical source cache to the actor. Migrate all legacy source-type references in shared hooks, content/comment helpers and components, and both game pages. Verify with focused hook checks for numeric game IDs, UUID comments, zero counters, read failure, and anonymous-to-authenticated state changes.
- [x] 2.2 Adapt `useUserLike` and the existing `content-reactions.test.tsx` fixtures/cache keys to the new shape with valid native IDs and controlled summary/status reads. Preserve source-only requests, optimistic non-negative counts, committed reconciliation, rollback, and unrelated fields; run the reaction tests including metadata/view-state preservation on success and failure.

## 3. Durable navigation views

- [x] 3.1 Replace queued capture in `useUserView` with immutable durable-view mutation variables supplied a per-visit UUID; deduplicate pending/accepted impressions, retain failed identities for retry, and invalidate the captured source after acceptance without incrementing projected counts. Add and run focused checks for duplicate pending triggers, a lost-acknowledgement retry with the same UUID/binding, failed acceptance, and unchanged lagging counters.
- [x] 3.2 Update web game-route and Ionic mobile view-entry/leave handling to create one UUID per visit, including A-to-B-to-A navigation and retained-page returns; avoid generating views for unresolved routes, rerenders, or tab changes. Remove obsolete source-only registration refs. Verify the caller lifecycle with focused checks covering a new return-visit UUID and repeated triggers within one visit.

## 4. Common rankings and shared consumers

- [x] 4.1 Migrate `useTrendingGames`, `useTrendingReviews`, and `useInfiniteTrendingGames` to source-fixed popular ranking requests and `StatisticsRankingResponseDto`. Include complete selectors/actor context in keys, export the infinite key builder for prefetch, reset changed selections, and derive bounded next offsets from response pagination. Add and run focused checks for period-only changes, actor-specific reviews, normal pagination, and stopping before an offset above 10,000.
- [x] 4.2 Update `TrendingGamesList` and `TrendingReviewCarousel` to generated period values, ranking `items`, source IDs/keys, and existing month/limit defaults. Preserve server order through hydration and avoid content fetches for empty rankings. Verify with a small out-of-order content fixture and an empty ranking while retaining existing loading/empty presentation.
- [x] 4.3 Migrate `GameInfoReviewList` to all-time review rankings, retaining game/exclude-own/pin selectors and using response total/limit to derive bounded page counts. Reset offset on selector changes and remove content-first sorting that overrides ranking/pin order. Verify eligible-pin order, an absent excluded pin, an ordinary next page, and the maximum requestable page with focused fixtures.

## 5. Web and mobile Explore

- [x] 5.1 Update web Explore utilities and filters to the ranking request/period/criteria types, allowlist supported URL properties, normalize resource IDs into valid numeric arrays, default invalid periods, and preserve selected criteria when only period changes. Add and run tests for supported URL/form round-trips, malformed/unknown query values, and matching server/browser request normalization.
- [x] 5.2 Migrate web Explore server prefetch and rendering to ranking `items`, the infinite hook's effective request/key builder, and the actual `useGames` hydration key. Preserve ranking order and deduplicate overlapping live pages at the list boundary. Verify dehydrated first-page/content reuse, subsequent next-page offset, and overlap ordering with focused integration checks.
- [x] 5.3 Migrate mobile `ExploreGamesPageView` response types, period values, item hydration/order, and overlapping-page deduplication; update pull-to-refresh to reset/reload the current infinite ranking from page one under its retained query prefix. Verify period switching and refresh after multiple pages with focused component/hook checks.

## 6. Cross-client acceptance

- [x] 6.1 Run the selected statistics/reaction tests with `yarn --cwd apps/mobile test.unit --run` and the affected test paths; reuse already-valid focused results. Run wrapper `check-types`, UI `type-check`, mobile `typecheck`, and web/admin `tsc --noEmit` through their existing workspaces. Fix new regressions and record commands/results and unrelated failures; no backend suites, device builds, or load tests are required.
- [x] 6.2 Confirm repository searches find no retired statistics routes, DTOs, row-ID status reads, or legacy exports in runtime clients/wrapper; inspect that only intended frontend changes exist. Run `git diff --check` and `openspec validate rebuild-statistics-system --strict`, and report the coordinated client/API release requirement without deploying or editing backend artifacts.
