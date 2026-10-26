# Spec Delta

## Purpose

Let web and mobile users browse ranked games and reviews through the common backend ranking contract while retaining useful filters, order, and bounded navigation.

## ADDED Requirements

### Requirement: Existing discovery requests use common popular rankings
Game and review discovery SHALL use `POST /v1/statistics/rankings` with the appropriate `sourceType` and explicit `popular` mode. The client SHALL retain existing month defaults for home and Explore, all-time game-review lists, and existing period choices. Requests SHALL use one period selector and only filters supported for that source.

#### Scenario: Home discovery loads
- **WHEN** the home game grid or review carousel loads
- **THEN** it requests popular month rankings for games or reviews respectively with its existing item limit

#### Scenario: Explore period changes
- **WHEN** a user selects week, month, quarter, half-year, year, or all time in Explore
- **THEN** the ranking request uses that exact supported preset and starts at offset zero

### Requirement: Ranking consumers use source identities and preserve order
The client SHALL consume ranking `items` and their native `sourceId` values instead of legacy statistics rows. Hydrated games and reviews SHALL retain the ranking order and use source identities as item keys. An empty ranking SHALL render the existing empty state without an unnecessary batch content request.

#### Scenario: Content hydration returns another order
- **WHEN** a ranking returns A before B and the content batch returns B before A
- **THEN** the UI renders A before B and associates each item with the correct source

#### Scenario: Ranking refresh overlaps pages
- **WHEN** live ranking pages contain the same source more than once
- **THEN** the combined discovery list renders that source once, preserving its first ranked occurrence
- **AND** refreshing the list starts a new traversal rather than promising a frozen snapshot

### Requirement: Explore filters remain compatible with strict ranking inputs
Web Explore SHALL round-trip its supported period and game criteria through its URL and form. It SHALL normalize selected resource IDs into numeric arrays and omit unknown, malformed, or unsupported query properties from requests. Invalid period values SHALL use the existing month default.

#### Scenario: Shared filtered Explore URL is opened
- **WHEN** Explore opens with a supported period and comma-separated genre, platform, theme, or game-mode IDs
- **THEN** server and browser construct equivalent requests containing numeric criterion arrays
- **AND** the controls represent those filters

#### Scenario: URL contains an unrelated property
- **WHEN** an Explore URL contains an unknown criterion, malformed resource ID, or unsupported period
- **THEN** unsupported values are omitted or replaced with the documented default before requesting rankings
- **AND** the request contains no arbitrary property that strict backend validation would reject

### Requirement: Review filters and priority retain backend semantics
Review discovery SHALL preserve game, author, exclude-own, and pinned-review selectors when present, using `authorId` for the author selector. It SHALL retain the backend's eligible ordering and SHALL NOT inject an excluded pinned review into the result list.

#### Scenario: Game reviews include a target review
- **WHEN** a game-review list requests an eligible pinned review with exclude-own enabled
- **THEN** it submits `gameId`, `reviewId`, and `excludeOwn` under the common review ranking contract
- **AND** hydration and presentation retain the server's pin priority

#### Scenario: Pin is absent from eligible results
- **WHEN** the backend excludes a pinned review because of its game, actor, or access filters
- **THEN** the ranked list does not add that review independently of the returned ranking

### Requirement: Ranking navigation respects pagination bounds
The client SHALL use the returned `pagination.total`, `limit`, `offset`, and `hasNextPage`. Requests SHALL stay within limits 1–100 and offsets 0–10,000. Infinite and numbered navigation SHALL stop at the last requestable page, deriving page counts from the filtered total instead of a retired `totalPages` field.

#### Scenario: Infinite ranking has another valid page
- **WHEN** a response has `hasNextPage` true and its offset plus limit is at most 10,000
- **THEN** infinite scrolling requests that next offset with the same effective filters

#### Scenario: Total exceeds the requestable offset range
- **WHEN** another page would require an offset greater than 10,000
- **THEN** the client offers no such page or infinite-load request even if the backend reports more matching sources

### Requirement: Ranking cache identity includes effective selectors and actor context
The client SHALL distinguish cached ranking results by source, mode, period or range, filters, and pagination shape. Actor-dependent review results SHALL also be scoped to the current actor. A period, filter, or actor change SHALL NOT present the previous selection as the new selection's loaded result.

#### Scenario: Period-only change follows a cached result
- **WHEN** month results are cached and the user switches to all time with unchanged criteria and limit
- **THEN** the client loads or reuses all-time results under a different cache identity

#### Scenario: Actor changes with exclude-own enabled
- **WHEN** a different actor requests an otherwise identical review ranking
- **THEN** the previous actor's filtered page is not reused as the new actor's result

### Requirement: Server prefetch and mobile refresh use the migrated cache contract
Web Explore server prefetch SHALL use the same effective request, first-page offset, response shape, and cache identity as browser discovery and content hydration. Mobile pull-to-refresh SHALL invalidate the migrated infinite-game ranking query and reload the list from its first page.

#### Scenario: Prefetched Explore page is hydrated
- **WHEN** a browser loads a server-prefetched filtered Explore page
- **THEN** the prefetched ranking and content are available under the browser's matching query identities
- **AND** subsequent scrolling continues with the response's next valid offset

#### Scenario: Mobile user refreshes Explore
- **WHEN** a mobile user pulls to refresh a previously paginated ranking
- **THEN** the active ranking is refreshed under its current period starting from its first page
