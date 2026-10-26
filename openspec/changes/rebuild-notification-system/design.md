# Design

## Context

`game-node-server` completed `rebuild-notification-system` (see `proposal.md` for motivation and capability scope). Examining `game-node-clients` shows four areas coupled to the retired server contracts:

1. **OpenAPI wrapper (`packages/wrapper`)**: `packages/wrapper/input/server_swagger.json` still defines the old `/v1/notifications`, `/v1/notifications/new`, `/v1/notifications/view`, and `/v1/statistics/queue/like` routes and legacy DTOs (`Notification`, `NotificationAggregateDto`, `PaginatedNotificationAggregationDto`, `NotificationViewUpdateDto`). Note that the working tree also contains in-flight `federate-connection-auth` changes in `packages/wrapper/input/server_swagger.json`, while `game-node-server/server_swagger.json` additionally contains unrelated search/achievement endpoints not yet adopted in `game-node-clients`.
2. **Notification hooks and components (`packages/ui/src/components/notifications`)**:
   - `useAggregatedNotifications` and `useInfiniteAggregatedNotifications` use `offset` pagination and return `PaginatedNotificationAggregationDto`.
   - `AggregatedNotification` dispatches to nine per-source components (`packages/ui/src/components/notifications/item/*`) that issue N+1 queries (`useComment`, `usePost`, `useReview`, `useGame`, `useActivity`, `useReport`, `useImporterNotification`, and `UserAvatar` -> `useUserProfile`) while rendering the list.
3. **Web and mobile notification views**:
   - `apps/web/src/components/general/shell/header/GlobalShellHeaderNotifications.tsx`, `apps/mobile/src/pages/notifications.tsx`, and `apps/mobile/src/components/notifications/NotificationsIcon.tsx` flatten `aggregation.notifications`, inspect `!notification.isViewed`, and call `PUT /v1/notifications/view` with `{ isViewed: true, notificationIds }`.
   - `packages/ui/src/components/general/NotificationsManager.tsx` and `apps/web/src/components/general/NotificationsManager.tsx` contain unused helper functions importing the deleted `Notification` model.
4. **Reactions (`packages/ui/src/components/statistics`)**:
   - `useUserLike` and `ItemLikesButton` require `targetUserId` and call `StatisticsQueueService.statisticsQueueControllerAddLikeV1` / `RemoveLikeV1` without awaiting the returned promise (`.then()`), preventing error rollback and sending a `targetUserId` field that the new `ReactionRequestDto` rejects (`forbidNonWhitelisted: true`).

## Goals / Non-Goals

**Goals:**
- Update `@repo/wrapper` with only the notification and reaction OpenAPI schemas/paths from `game-node-server`, preserving existing in-flight connection auth changes.
- Render all six notification types from `NotificationInboxItemDto` in a single component without per-item queries during list rendering, and delete obsolete hydration components and hooks.
- Support cursor pagination, server `unreadCount`, and bounded version-aware read acknowledgements (`PATCH /v1/notifications/read`) across web and mobile.
- Switch `useUserLike` and `ItemLikesButton` to `PUT/DELETE /v1/statistics/like` without `targetUserId`, awaiting the promise and syncing committed `{ isLiked, likesCount }`.

**Non-Goals:**
- Introducing new notification polling transports (WebSockets/SSE/push), toast stream managers, or notification preference screens.
- Modifying view counter queueing (`POST /v1/statistics/queue/view`), which remains unchanged on the server.
- Pulling unrelated search or achievement OpenAPI changes from `game-node-server/server_swagger.json`.

## Decisions

### 1. Scoped OpenAPI update and codegen in `@repo/wrapper`

Update `packages/wrapper/input/server_swagger.json` specifically for the notification and reaction paths (`/v1/notifications`, `/v1/notifications/read`, `/v1/statistics/like`, removing `/v1/notifications/new`, `/v1/notifications/view`, `/v1/statistics/queue/like`) and their corresponding component schemas from `game-node-server/server_swagger.json`, then run `yarn --cwd packages/wrapper build` (`node generate.js`) and remove stale generated model files (`Notification.ts`, `NotificationAggregateDto.ts`, `PaginatedNotificationAggregationDto.ts`, `NotificationViewUpdateDto.ts`).

*Alternative considered:* Copying `game-node-server/server_swagger.json` wholesale. Rejected because `game-node-server/server_swagger.json` includes unrelated search and achievement schema changes outside this task's scope.

### 2. Collapse per-source notification components into `AggregatedNotification`

Delete `packages/ui/src/components/notifications/item/*` (9 files), `packages/ui/src/components/notifications/hooks/useNotificationContent.tsx`, `packages/ui/src/components/notifications/utils/getUniqueProfileNames.ts`, and `packages/ui/src/components/importer/hooks/useImporterNotification.ts` (none of which have external callers). Render `NotificationInboxItemDto` directly inside `AggregatedNotification.tsx`:

- **Props**: `{ aggregatedNotification: NotificationInboxItemDto; onClick: () => void; backgroundColor: "normal" | "darker" }` (keeping the component name and prop signature shape familiar for web and mobile callers).
- **Actor-based events (`content.liked`, `comment.created`, `comment.replied`, `profile.followed`)**:
  - Lead avatar uses `<Avatar src={leadActor?.avatar?.filename ? getS3StoredUpload(leadActor.avatar.filename) : undefined} />` directly from `actors[0]`, avoiding `UserAvatar`'s `useUserProfile` query.
  - Actor label formats up to two names from `actors` (`actors.slice(0, 2).map((a) => a.username).join(", ")`) and derives remaining actors from `Math.max(0, actorCount - Math.min(actors.length, 2))`, fixing the legacy string-length subtraction bug (`profileNames.length - latestProfileNames.length`).
  - Body text uses `preview.text` and target context:
    - `profile.followed`: `has started following you.`
    - `content.liked`: uses `preview.text` (lowercased after actor names, e.g., `liked your post`, `liked your review`, `liked your comment`, `liked your activity`, appending `of <game.name>` when `target?.type === "activity"` and `target.game?.name` is present).
    - `comment.created`: `commented on your <target.type>: "<preview.text>"` (or generic summary when `preview.text` is a fallback).
    - `comment.replied`: `replied to your comment: "<preview.text>"`.
- **Importer events (`import.discovery-completed`)**:
  - Reads `{ provider, gameCount, importedCount, skippedCount, failedCount, gameSample }` from `preview`, renders `<Image src={getServerStoredIcon(provider)} w={38} h={38} />`, and formats the discovery message directly without calling `ImporterWatchService`.
- **Moderation events (`moderation.applied`)**:
  - Maps `preview.action` (`"alert"` -> `reports.messages.alert`, `"suspension"` -> `reports.messages.suspend`, `"ban"` -> `reports.messages.ban`) with `preview.reason`, `reports.messages.contentDeleted`, and `reports.messages.appeal`.

*Alternative considered:* Keeping nine separate wrapper subcomponents for `NotificationInboxItemDto`. Rejected because the server already normalizes all events into three presentation shapes (actor + text preview, importer preview, moderation preview) and four target shapes; nine files of boilerplate violate YAGNI.

### 3. Target navigation and on-click review resolution

- For `target.type` in `post`, `activity`, `profile`, and `importer`, build `href` directly:
  - `post` -> `/posts?postId=${target.id}`
  - `activity` -> `/activity/detail/${target.id}`
  - `profile` -> `/profile/${target.id}`
  - `importer` -> `/importer/${target.provider}`
- For `target.type === "review"`, `NotificationContentTargetDto` provides `{ type: "review", id, focusId? }` without `gameId`. To avoid fetching review entities during list rendering while still opening the game review modal when clicked, clicking a review notification calls `ReviewsService.reviewsControllerFindOneByIdV1(target.id)` on demand and routes via `useRouter().push(\`/game/\${review.gameId}?tab=reviews&reviewId=\${review.id}\`)`.
- In `apps/mobile/src/pages/game.tsx`, include `reviewId` in `useUrlState` and pass `targetReviewId={params.reviewId}` to `<GameInfoReviewScreen />` so mobile matches web's review modal deep-linking.

### 4. Cursor pagination and bounded version-aware read acknowledgements

- `useInfiniteAggregatedNotifications(limit = DEFAULT_NOTIFICATIONS_LIMIT)` uses `initialPageParam: undefined as string | undefined`, calls `NotificationsService.notificationsControllerFindAllV1(pageParam, limit)`, and sets `getNextPageParam: (lastPage) => (lastPage.pagination.hasMore && lastPage.pagination.nextCursor ? lastPage.pagination.nextCursor : undefined)`.
- `useAggregatedNotifications(cursor?: string, limit = 20)` wraps `NotificationsService.notificationsControllerFindAllV1(cursor, limit)`.
- In `GlobalShellHeaderNotifications.tsx`, `apps/mobile/src/pages/notifications.tsx`, and `apps/mobile/src/components/notifications/NotificationsIcon.tsx`:
  - `hasUnreadNotifications` checks `(data?.pages[0]?.unreadCount ?? 0) > 0 || items.some((item) => item.readVersion < item.version)`.
  - `notificationViewMutation` accepts `NotificationInboxItemDto[]`, filters `item.readVersion < item.version`, deduplicates by `item.id` (retaining max `version`), chunks into slices of at most 100 items, and calls `NotificationsService.notificationsControllerAcknowledgeReadV1({ items: chunk })` before invalidating the notifications query.

### 5. Synchronous reaction mutations without `targetUserId`

- Remove `targetUserId` from `IToggleLikeProps`, `useUserLike`, `ItemLikesButton`, and all five callers (`ReviewListItem`, `CommentsListItemActions`, `PostsListItem`, `ProfileReviewListItem`, `ActivityItemLikes`).
- In `useUserLike`:
  - Format `sourceId` appropriately (`sourceType === FindOneStatisticsDto.sourceType.GAME ? Number(sourceId) : String(sourceId)`).
  - `await` `StatisticsService.statisticsControllerRemoveLikeV1(dto)` when `isLiked` is true, or `StatisticsService.statisticsControllerAddLikeV1(dto)` when `isLiked` is false.
  - Keep optimistic toggling in `onMutate` and rollback in `onError`, and add `onSuccess(response)` to update the cached `StatisticsWithStatus` with `{ isLiked: response.isLiked, likesCount: response.likesCount }`.

## Risks / Trade-offs

- [Review target notifications do not carry `gameId` in `NotificationContentTargetDto`] → Resolve `ReviewsService.reviewsControllerFindOneByIdV1(target.id)` only when the user clicks a review notification, keeping list rendering at zero extra queries.
- [`NotificationAvatarDto.filename` contains the stored `ProfileAvatar.filename` without `extension`] → Render `getS3StoredUpload(actor.avatar.filename)` when `actor.avatar?.filename` is present and let `<Avatar>` fall back to its default placeholder if an image lacks an extension or fails to load, avoiding per-actor `/v1/profile` requests.
- [Large numbers of loaded unread items on mark-all-as-read] → Chunk read acknowledgement payloads into batches of at most 100 items to respect `NotificationReadRequestDto`'s `@ArrayMaxSize(100)` constraint.
