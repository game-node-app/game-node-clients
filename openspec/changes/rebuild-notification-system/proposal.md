# Proposal

## Why

`game-node-server` replaced the legacy notification and queued-like endpoints in `rebuild-notification-system` with a cursor-paginated materialized notification inbox (`GET /v1/notifications`, `PATCH /v1/notifications/read`) and synchronous, server-owned reaction endpoints (`PUT/DELETE /v1/statistics/like`). The clients still call the retired offset/view notification routes, hydrate source entities per notification item on render, and send rejected `targetUserId` fields to the retired `/v1/statistics/queue/like` endpoints.

## What Changes

- **BREAKING** Update `@repo/wrapper` OpenAPI definitions and generated server client for the new `/v1/notifications`, `/v1/notifications/read`, and `/v1/statistics/like` contracts, removing retired models (`Notification`, `NotificationAggregateDto`, `PaginatedNotificationAggregationDto`, `NotificationViewUpdateDto`) and queued-like methods (`statisticsQueueControllerAddLikeV1`, `statisticsQueueControllerRemoveLikeV1`).
- **BREAKING** Replace offset-based notification hooks (`useAggregatedNotifications`, `useInfiniteAggregatedNotifications`) with cursor-based pagination over `NotificationsResponseDto` (`data`, `pagination.nextCursor`, `pagination.hasMore`, `unreadCount`).
- **BREAKING** Replace `AggregatedNotification` and delete the nine per-source hydration item components (`ActivityAggregatedNotification`, `ActivityCommentAggregatedNotification`, `FollowerAggregatedNotification`, `ImporterWatchAggregatedNotification`, `PostAggregatedNotification`, `PostCommentAggregatedNotification`, `ReportAggregatedNotification`, `ReviewAggregatedNotification`, `ReviewCommentAggregatedNotification`), `useNotificationContent`, `getUniqueProfileNames`, and `useImporterNotification`. Render all six notification event types (`content.liked`, `comment.created`, `comment.replied`, `profile.followed`, `import.discovery-completed`, `moderation.applied`) directly from the materialized `NotificationInboxItemDto` (`actors`, `actorCount`, `eventCount`, `preview`, `target`) without per-item API queries during list rendering.
- Navigate to typed notification targets (`post`, `activity`, `profile`, `importer`, and `review` resolved on click to its game review view), and pass `reviewId` URL query state to `GameInfoReviewScreen` on mobile so review target navigation works consistently on both web and mobile.
- Update web (`GlobalShellHeaderNotifications`) and mobile (`NotificationsPage`, `NotificationsIcon`) to derive unread state from `unreadCount` and `readVersion < version`, and acknowledge read items via `PATCH /v1/notifications/read` (`{ items: [{ id, version }] }`, bounded to 100 items per request).
- Clean up dead legacy `Notification` imports in `packages/ui/src/components/general/NotificationsManager.tsx` and `apps/web/src/components/general/NotificationsManager.tsx`.
- **BREAKING** Update `useUserLike`, `ItemLikesButton`, and all callers (`ReviewListItem`, `CommentsListItemActions`, `PostsListItem`, `ProfileReviewListItem`, `ActivityItemLikes`) to remove `targetUserId` and await `StatisticsService.statisticsControllerAddLikeV1` / `statisticsControllerRemoveLikeV1`, reconciling the query cache with the committed `{ isLiked, likesCount }` response while preserving optimistic UI updates and rollback on error.

## Capabilities

### New Capabilities
- `notification-inbox`: Cursor-paginated notification queries, zero-hydration rendering of materialized inbox items and actor/importer/moderation previews, typed target navigation, unread indicators, and version-based read acknowledgements across web and mobile.
- `content-reactions`: Authenticated client like and unlike toggles against `/v1/statistics/like` without client-supplied recipient parameters, with optimistic state transitions and committed response synchronization.

### Modified Capabilities

None.

## Impact

- `packages/wrapper/input/server_swagger.json` and generated files under `packages/wrapper/src/server/`.
- `packages/ui/src/components/notifications/**`, `packages/ui/src/components/importer/hooks/**`, `packages/ui/src/components/general/NotificationsManager.tsx`.
- `packages/ui/src/components/statistics/hooks/useUserLike.ts`, `packages/ui/src/components/statistics/input/ItemLikesButton.tsx`, and callers in `review`, `comment`, `posts`, `profile`, and `activity` components.
- `apps/web/src/components/general/shell/header/GlobalShellHeaderNotifications.tsx` and `apps/web/src/components/general/NotificationsManager.tsx`.
- `apps/mobile/src/pages/notifications.tsx`, `apps/mobile/src/components/notifications/NotificationsIcon.tsx`, and `apps/mobile/src/pages/game.tsx`.
- No new dependencies required. Unrelated in-flight workspace changes (`federate-connection-auth`) remain untouched.
