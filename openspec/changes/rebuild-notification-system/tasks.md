# Tasks

## 1. OpenAPI Wrapper and Generated Server Client

- [x] 1.1 Update `packages/wrapper/input/server_swagger.json` with the notification (`/v1/notifications`, `/v1/notifications/read`) and reaction (`/v1/statistics/like`) paths and schemas from `game-node-server/server_swagger.json`, removing `/v1/notifications/new`, `/v1/notifications/view`, `/v1/statistics/queue/like`, and retired notification schemas while preserving existing connection-auth definitions; verify with `node` that only notification and reaction paths/schemas changed.
- [x] 1.2 Regenerate `@repo/wrapper` via `yarn --cwd packages/wrapper build`, remove stale generated model files (`Notification.ts`, `NotificationAggregateDto.ts`, `PaginatedNotificationAggregationDto.ts`, `NotificationViewUpdateDto.ts`), and verify `yarn --cwd packages/wrapper check-types` passes.

## 2. Reactions Hook and Like Button Callers

- [x] 2.1 Update `packages/ui/src/components/statistics/hooks/useUserLike.ts` and `packages/ui/src/components/statistics/input/ItemLikesButton.tsx` to remove `targetUserId`, call `StatisticsService.statisticsControllerAddLikeV1` and `statisticsControllerRemoveLikeV1` with `{ sourceType, sourceId }`, await the promise, reconcile cached `{ isLiked, likesCount }` on success, and roll back on error; verify no `StatisticsQueueService` like calls or `targetUserId` props remain in `packages/ui/src/components/statistics`.
- [x] 2.2 Remove `targetUserId` from all `ItemLikesButton` callers (`ReviewListItem.tsx`, `CommentsListItemActions.tsx`, `PostsListItem.tsx`, `ProfileReviewListItem.tsx`, `ActivityItemLikes.tsx`) and add a unit test verifying like/unlike requests, optimistic updates, committed reconciliation, and error rollback via `yarn --cwd apps/mobile test.unit --run`.

## 3. Materialized Notification Components and Hooks

- [x] 3.1 Update `useAggregatedNotifications.ts` and `useInfiniteAggregatedNotifications.ts` to use cursor pagination (`cursor`, `limit`, `pagination.nextCursor`, `pagination.hasMore`) against `NotificationsService.notificationsControllerFindAllV1`; verify `useInfiniteAggregatedNotifications` advances with `nextCursor` only when `hasMore` is `true`.
- [x] 3.2 Rewrite `AggregatedNotification.tsx` to render `NotificationInboxItemDto` across all six event types (`content.liked`, `comment.created`, `comment.replied`, `profile.followed`, `import.discovery-completed`, `moderation.applied`), navigate directly for `post`/`activity`/`profile`/`importer` targets, and resolve `review` targets on click to `/game/<gameId>?tab=reviews&reviewId=<id>`; delete obsolete per-source item files (`packages/ui/src/components/notifications/item/*`), `useNotificationContent.tsx`, `getUniqueProfileNames.ts`, and `useImporterNotification.ts`, and regenerate `@repo/ui` barrels (`yarn --cwd packages/ui barrels:generate`), verifying `yarn --cwd packages/ui type-check` passes.

## 4. Web and Mobile Notification Views

- [x] 4.1 Update `apps/web/src/components/general/shell/header/GlobalShellHeaderNotifications.tsx`, `apps/mobile/src/pages/notifications.tsx`, and `apps/mobile/src/components/notifications/NotificationsIcon.tsx` to render `NotificationInboxItemDto` items, derive unread indicators from `unreadCount` and `readVersion < version`, and acknowledge unread items via `NotificationsService.notificationsControllerAcknowledgeReadV1` in batches of at most 100 items.
- [x] 4.2 Clean up dead `Notification` imports in `packages/ui/src/components/general/NotificationsManager.tsx` and `apps/web/src/components/general/NotificationsManager.tsx`, and pass `reviewId` URL state to `GameInfoReviewScreen` in `apps/mobile/src/pages/game.tsx`; add unit tests covering zero-hydration rendering of all six notification types, target navigation, cursor pagination, and versioned read acknowledgements, and verify `yarn --cwd apps/mobile test.unit --run`, `yarn --cwd packages/ui type-check`, and `yarn --cwd apps/mobile typecheck` pass.
