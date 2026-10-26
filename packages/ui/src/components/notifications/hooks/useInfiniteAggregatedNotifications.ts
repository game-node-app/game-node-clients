import { ExtendedUseInfiniteQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import {
  NotificationInboxItemDto,
  NotificationReadItemDto,
  NotificationsResponseDto,
  NotificationsService,
} from "@repo/wrapper/server";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export const DEFAULT_NOTIFICATIONS_LIMIT = 10;
export const MAX_READ_ACK_BATCH_SIZE = 100;

export async function acknowledgeNotificationsRead(
  items: NotificationInboxItemDto[],
): Promise<boolean> {
  if (!items || items.length === 0) return false;

  const map = new Map<number, number>();
  for (const item of items) {
    if (item.readVersion >= item.version) continue;
    const existing = map.get(item.id);
    if (existing == null || item.version > existing) {
      map.set(item.id, item.version);
    }
  }

  if (map.size === 0) return false;

  const deduplicated: NotificationReadItemDto[] = Array.from(
    map.entries(),
  ).map(([id, version]) => ({ id, version }));

  for (let i = 0; i < deduplicated.length; i += MAX_READ_ACK_BATCH_SIZE) {
    const chunk = deduplicated.slice(i, i + MAX_READ_ACK_BATCH_SIZE);
    await NotificationsService.notificationsControllerAcknowledgeReadV1({
      items: chunk,
    });
  }

  return true;
}

export function useInfiniteAggregatedNotifications(
  limit = DEFAULT_NOTIFICATIONS_LIMIT,
): ExtendedUseInfiniteQueryResult<NotificationsResponseDto> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", "aggregated", "infinite", userId];
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey,
    });
  };

  return {
    ...useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) => {
        return NotificationsService.notificationsControllerFindAllV1(
          pageParam,
          limit,
        );
      },
      placeholderData: keepPreviousData,
      getNextPageParam: (lastPage) => {
        return lastPage.pagination.hasMore && lastPage.pagination.nextCursor
          ? lastPage.pagination.nextCursor
          : undefined;
      },
      initialPageParam: undefined as string | undefined,
      enabled: !!userId,
      // Checks for updates every 30 seconds
      staleTime: 30000,
      refetchInterval: 15000,
    }),
    queryKey,
    invalidate,
  };
}
