# Spec Delta

## Purpose

Render the authenticated user's notification inbox across web and mobile using cursor pagination, self-contained materialized notification summaries, typed destination routing, and version-based read acknowledgements without per-item hydration queries.

## ADDED Requirements

### Requirement: Cursor-paginated inbox retrieval
The client SHALL fetch notifications from `GET /v1/notifications` using an optional opaque `cursor` and integer `limit` parameter, and SHALL advance infinite pagination using `pagination.nextCursor` only when `pagination.hasMore` is `true`.

#### Scenario: Initial inbox page load
- **WHEN** an authenticated user opens notifications or the notification indicator initializes
- **THEN** the client requests the first page without a cursor
- **AND** exposes the returned `data`, `pagination`, and `unreadCount`

#### Scenario: Loading subsequent pages
- **WHEN** `pagination.hasMore` is `true` and `pagination.nextCursor` is non-null, and the user requests more notifications
- **THEN** the client fetches the next page passing `pagination.nextCursor` as `cursor`

#### Scenario: End of inbox reached
- **WHEN** `pagination.hasMore` is `false` or `pagination.nextCursor` is `null`
- **THEN** the client does not display or trigger further page loads

### Requirement: Zero-hydration item rendering
The client SHALL render each inbox item directly from its materialized `type`, `actors`, `actorCount`, `eventCount`, `preview`, and `target` fields without issuing per-item API requests for profiles, posts, reviews, comments, activities, games, importer notifications, or moderation reports during list rendering.

#### Scenario: Community interaction notification rendering
- **WHEN** an inbox item has type `content.liked`, `comment.created`, `comment.replied`, or `profile.followed`
- **THEN** the client renders the lead actor avatar from `actors[0].avatar`, up to two actor usernames from `actors`, any remaining distinct actor count from `actorCount`, and the materialized preview text without fetching user profiles or source entities

#### Scenario: Importer discovery notification rendering
- **WHEN** an inbox item has type `import.discovery-completed`
- **THEN** the client renders the provider icon and discovery summary counts (`gameCount`, `importedCount`, `skippedCount`, `failedCount`, and sampled titles when available) directly from `preview` without calling an importer notification detail endpoint

#### Scenario: Moderation notification rendering
- **WHEN** an inbox item has type `moderation.applied`
- **THEN** the client renders the localized moderation notice for `preview.action` (`alert`, `suspension`, or `ban`) and any `preview.reason` directly from `preview` without fetching a report entity

### Requirement: Typed target navigation
Clicking a notification item SHALL navigate to the internal route corresponding to its typed `target` (`post`, `activity`, `profile`, `importer`, or `review`).

#### Scenario: Direct route target navigation
- **WHEN** the user activates a notification with `target.type` of `post`, `activity`, `profile`, or `importer`
- **THEN** the client navigates to `/posts?postId=<id>`, `/activity/detail/<id>`, `/profile/<id>`, or `/importer/<provider>` respectively

#### Scenario: Review target navigation
- **WHEN** the user activates a notification with `target.type` of `review`
- **THEN** the client resolves the review on click and navigates to `/game/<gameId>?tab=reviews&reviewId=<id>` so the review modal opens on both web and mobile

### Requirement: Unread indicator and versioned read acknowledgements
The client SHALL treat an inbox item as unread when `readVersion < version`, SHALL display an unread indicator when `unreadCount > 0` or any loaded item has `readVersion < version`, and SHALL acknowledge unread items via `PATCH /v1/notifications/read` using `{ items: [{ id, version }] }` with at most 100 items per request.

#### Scenario: Clicking an unread notification item
- **WHEN** the user clicks an inbox item where `readVersion < version`
- **THEN** the client sends a read acknowledgement for `{ id: item.id, version: item.version }` and invalidates the notifications query

#### Scenario: Clicking an already-read notification item
- **WHEN** the user clicks an inbox item where `readVersion >= version`
- **THEN** the client does not send a redundant read acknowledgement request

#### Scenario: Marking all loaded unread notifications as read
- **WHEN** the user triggers mark-all-as-read while loaded pages contain unread items
- **THEN** the client acknowledges all unique unread `{ id, version }` pairs in batches of at most 100 items and refreshes the inbox state
