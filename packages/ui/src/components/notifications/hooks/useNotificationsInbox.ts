import {
  acknowledgeNotificationsRead,
  DEFAULT_NOTIFICATIONS_LIMIT,
  NOTIFICATIONS_AGGREGATED_QUERY_KEY,
  type NotificationInboxFilter,
  useInfiniteAggregatedNotifications,
} from "#@/components/notifications/hooks/useInfiniteAggregatedNotifications";
import { groupNotificationsByDate } from "#@/components/notifications/util/groupNotificationsByDate";
import { createErrorNotification } from "#@/util/createErrorNotification";
import {
  InfiniteData,
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  NotificationInboxItemDto,
  NotificationsResponseDto,
  NotificationsService,
} from "@repo/wrapper/server";
import { useMemo } from "react";

type NotificationsInfiniteData = InfiniteData<NotificationsResponseDto>;

export interface UseNotificationsInboxOptions {
  filter?: NotificationInboxFilter;
  limit?: number;
}

function isNotificationsInfiniteData(
  value: unknown,
): value is NotificationsInfiniteData {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { pages?: unknown }).pages)
  );
}

function updateNotificationsInfiniteData(
  queryClient: QueryClient,
  update: (data: NotificationsInfiniteData) => NotificationsInfiniteData,
) {
  queryClient.setQueriesData<unknown>(
    { queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY },
    (data: unknown) =>
      isNotificationsInfiniteData(data) ? update(data) : data,
  );
}

/**
 * Greatest `lastEventAt` among every inbox page in cache, across both filters.
 * `undefined` when nothing is cached (the server then defaults to "now").
 */
function getLatestLastEventAt(queryClient: QueryClient): string | undefined {
  const queries = queryClient.getQueriesData<unknown>({
    queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
  });

  let latestTime = Number.NEGATIVE_INFINITY;
  let latestLastEventAt: string | undefined;

  for (const [, data] of queries) {
    if (!isNotificationsInfiniteData(data)) continue;
    for (const page of data.pages) {
      for (const item of page.data) {
        const time = new Date(item.lastEventAt).getTime();
        if (!Number.isNaN(time) && time > latestTime) {
          latestTime = time;
          latestLastEventAt = item.lastEventAt;
        }
      }
    }
  }

  return latestLastEventAt;
}

/**
 * Inbox state for one filter: grouped sections, unread counters, single-item
 * acknowledgement and mark-all-as-read (one `read-all` request for both tabs).
 */
export function useNotificationsInbox({
  filter = "all",
  limit = DEFAULT_NOTIFICATIONS_LIMIT,
}: UseNotificationsInboxOptions = {}) {
  const queryClient = useQueryClient();
  const query = useInfiniteAggregatedNotifications(limit, filter);

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data?.pages],
  );

  const sections = useMemo(() => groupNotificationsByDate(items), [items]);

  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  const hasUnread = useMemo(
    () =>
      unreadCount > 0 || items.some((item) => item.readVersion < item.version),
    [items, unreadCount],
  );

  const acknowledgeItemMutation = useMutation({
    mutationFn: async (item: NotificationInboxItemDto) => {
      const acknowledged = await acknowledgeNotificationsRead([item]);
      return { item, acknowledged };
    },
    onMutate: async (item) => {
      await queryClient.cancelQueries({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
      });
      const snapshots = queryClient.getQueriesData<unknown>({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
      });

      if (item.readVersion < item.version) {
        updateNotificationsInfiniteData(queryClient, (data) => ({
          ...data,
          pages: data.pages.map((page, index) => ({
            ...page,
            unreadCount:
              index === 0
                ? Math.max(0, page.unreadCount - 1)
                : page.unreadCount,
            data: page.data.map((pageItem) =>
              pageItem.id === item.id
                ? { ...pageItem, readVersion: pageItem.version }
                : pageItem,
            ),
          })),
        }));
      }

      return { snapshots };
    },
    onError: (error, _item, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      createErrorNotification(error as Error);
    },
    onSettled: () => {
      // Stale without refetching: an item opened in the "Unread" tab stays in
      // the list (as read) until the next refresh instead of jumping away.
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
        refetchType: "none",
      });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async (before: string | undefined) => {
      return NotificationsService.notificationsControllerAcknowledgeReadAllV1(
        before ? { before } : {},
      );
    },
    onMutate: async (before) => {
      await queryClient.cancelQueries({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
      });
      const snapshots = queryClient.getQueriesData<unknown>({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
      });
      const beforeTime = before ? new Date(before).getTime() : undefined;

      updateNotificationsInfiniteData(queryClient, (data) => ({
        ...data,
        pages: data.pages.map((page, index) => ({
          ...page,
          unreadCount: index === 0 ? 0 : page.unreadCount,
          data: page.data.map((item) =>
            beforeTime === undefined ||
            new Date(item.lastEventAt).getTime() <= beforeTime
              ? { ...item, readVersion: item.version }
              : item,
          ),
        })),
      }));

      return { snapshots };
    },
    onSuccess: (response) => {
      const unreadCount = response?.unreadCount;
      if (typeof unreadCount !== "number") return;

      updateNotificationsInfiniteData(queryClient, (data) => ({
        ...data,
        pages: data.pages.map((page, index) =>
          index === 0 ? { ...page, unreadCount } : page,
        ),
      }));
    },
    onError: (error, _before, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      createErrorNotification(error as Error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
      });
    },
  });

  const markAsRead = (item: NotificationInboxItemDto) => {
    acknowledgeItemMutation.mutate(item);
  };

  const markAllAsRead = () => {
    markAllMutation.mutate(getLatestLastEventAt(queryClient));
  };

  return {
    sections,
    unreadCount,
    hasUnread,
    markAsRead,
    markAllAsRead,
    isMarkingAll: markAllMutation.isPending,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
