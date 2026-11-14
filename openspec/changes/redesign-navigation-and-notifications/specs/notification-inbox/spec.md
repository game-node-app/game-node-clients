# Spec Delta

## Purpose

Bring the inbox retrieval and read-acknowledgement rules in line with the extended server contract: a server-side `unread` filter and a single `read-all` endpoint. This delta modifies requirements introduced by `rebuild-notification-system`, which must be archived first.

## MODIFIED Requirements

### Requirement: Cursor-paginated inbox retrieval
The client SHALL fetch notifications from `GET /v1/notifications` using an optional opaque `cursor`, an integer `limit` and an optional `filter` (`all` or `unread`, default `all`). It SHALL advance infinite pagination using `pagination.nextCursor` only when `pagination.hasMore` is `true`, and SHALL keep a separate query and cursor per filter, because the server rejects a cursor used with a different filter.

#### Scenario: Initial inbox page load
- **WHEN** an authenticated user opens notifications or the notification indicator initializes
- **THEN** the client requests the first page without a cursor
- **AND** exposes the returned `data`, `pagination`, and `unreadCount`

#### Scenario: Loading subsequent pages
- **WHEN** `pagination.hasMore` is `true` and `pagination.nextCursor` is non-null, and the user requests more notifications
- **THEN** the client fetches the next page passing `pagination.nextCursor` as `cursor` and the same `filter` used for the first page

#### Scenario: Unread-only retrieval
- **WHEN** the client needs only unread notifications
- **THEN** it requests `GET /v1/notifications?filter=unread` under a query key that includes the filter
- **AND** never reuses a cursor obtained with `filter=all`

#### Scenario: End of inbox reached
- **WHEN** `pagination.hasMore` is `false` or `pagination.nextCursor` is `null`
- **THEN** the client does not display or trigger further page loads

### Requirement: Unread indicator and versioned read acknowledgements
The client SHALL treat an inbox item as unread when `readVersion < version`, SHALL display an unread indicator when `unreadCount > 0` or any loaded item has `readVersion < version`, SHALL acknowledge individual items via `PATCH /v1/notifications/read` using `{ items: [{ id, version }] }` with at most 100 items per request, and SHALL mark the whole inbox as read via a single `PATCH /v1/notifications/read-all` request.

#### Scenario: Clicking an unread notification item
- **WHEN** the user clicks an inbox item where `readVersion < version`
- **THEN** the client sends a read acknowledgement for `{ id: item.id, version: item.version }` and invalidates the notifications query

#### Scenario: Clicking an already-read notification item
- **WHEN** the user clicks an inbox item where `readVersion >= version`
- **THEN** the client does not send a redundant read acknowledgement request

#### Scenario: Marking all notifications as read
- **WHEN** the user triggers mark-all-as-read
- **THEN** the client sends one `PATCH /v1/notifications/read-all` request with `before` set to the greatest `lastEventAt` among loaded items (or no `before` when nothing is loaded)
- **AND** uses the returned `unreadCount` and refreshes the inbox state for every filter
