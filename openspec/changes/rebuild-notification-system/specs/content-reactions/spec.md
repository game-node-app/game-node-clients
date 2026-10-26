# Spec Delta

## Purpose

Perform authenticated like and unlike transitions through the synchronous server reaction contract without client-supplied recipient parameters, keeping UI counters responsive and synchronized with committed server state.

## ADDED Requirements

### Requirement: Server-derived reaction requests
The client SHALL submit like and unlike requests to `PUT /v1/statistics/like` and `DELETE /v1/statistics/like` with only `{ sourceType, sourceId }`, and SHALL NOT accept or transmit `targetUserId` or any other recipient property.

#### Scenario: Liking a content item or game
- **WHEN** an authenticated user toggles a like on an unliked game, review, post, activity, or comment
- **THEN** the client sends `PUT /v1/statistics/like` with `{ sourceType, sourceId }` and no `targetUserId` field

#### Scenario: Unliking a content item or game
- **WHEN** an authenticated user toggles a like on a currently liked game, review, post, activity, or comment
- **THEN** the client sends `DELETE /v1/statistics/like` with `{ sourceType, sourceId }` and no `targetUserId` field

### Requirement: Optimistic transition with committed reconciliation
The client SHALL apply an optimistic `{ isLiked, likesCount }` update before the reaction request completes, SHALL reconcile the cached statistics state with the committed `{ isLiked, likesCount }` response on success, and SHALL roll back to the previous cached state if the request fails.

#### Scenario: Reaction request succeeds
- **WHEN** `PUT /v1/statistics/like` or `DELETE /v1/statistics/like` resolves with `{ isLiked, likesCount }`
- **THEN** the item's statistics query cache is updated to the server-returned `isLiked` and `likesCount` values

#### Scenario: Reaction request fails
- **WHEN** `PUT /v1/statistics/like` or `DELETE /v1/statistics/like` rejects with an error
- **THEN** the client restores the previous `isLiked` and `likesCount` values in the query cache
