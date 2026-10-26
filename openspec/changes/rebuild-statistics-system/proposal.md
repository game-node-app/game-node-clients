# Proposal

## Why

`game-node-server` has completed `rebuild-statistics-system`, retiring the statistics routes and response shapes still used by these clients. Adapt the shared frontend integration so discovery, engagement counters, reactions, and game views work with the replacement API on web and mobile.

## What Changes

- **BREAKING** Replace legacy statistics models, statistics-row status lookups, trending requests, and queued views with the source summary/status, common rankings, and durable view contracts.
- Update the statistics portion of the OpenAPI input and regenerate the wrapper, preserving unrelated API contracts. Correct the exported pagination and status-ID schema types to match the inspected backend DTOs.
- Keep synchronous like/unlike requests, optimistic updates, committed reconciliation, and failure rollback working with the new summary/status cache and native source identities.
- Record one view identity per game navigation, reuse it across retries, and avoid duplicate impressions during rerenders or repeated effects.
- Migrate shared discovery and review components, web Explore filtering and server prefetch, and mobile Explore pagination/refresh to ranking `items` and native `sourceId` values. Preserve the existing periods and filters using explicit `popular` mode, ranking order, review exclusions/pins, and bounded pagination.

## Capabilities

### New Capabilities

- `engagement-statistics`: Frontend source summaries and actor status, preserved committed reactions, and retry-stable navigation impressions.
- `popularity-rankings`: Frontend game/review discovery through the common ranking contract, including filters, hydration, caching, pagination, and web prefetch.

### Modified Capabilities

None. There are no main specs in this repository. Preserve the completed client `rebuild-notification-system` change's `content-reactions` requirements; this migration changes their supporting statistics reads, not the reaction contract.

## Impact

- `packages/wrapper/input/server_swagger.json`, generated statistics models/services, and public exports.
- `packages/ui/src/components/statistics`, source-type references in activity/comment/post/review components, shared trending components, and `GameInfoReviewList`.
- Web Explore utilities, filters, page/server prefetch, and game-page view recording; mobile Explore component/refresh and game-page view recording.
- Existing mobile Vitest reaction coverage and focused statistics/ranking integration tests using the installed test stack. Admin has no direct statistics-route callers; shared wrapper/UI compilation still covers its dependency surface.
- No major backend blocker was found in the completed backend artifacts, controllers, DTOs, and OpenAPI export. The Swagger typing discrepancies have a bounded frontend correction; no backend code change or dependency is required.
- Coordinate release with the backend cutover: retired routes have no compatibility adapter. New analytics screens, time-series UI, recent-mode controls, backend projections/migrations, unrelated API migrations, and production deployment are outside this change.
