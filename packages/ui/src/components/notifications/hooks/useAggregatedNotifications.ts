import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  NotificationsResponseDto,
  NotificationsService,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export function useAggregatedNotifications(
  cursor?: string,
  limit = 20,
): ExtendedUseQueryResult<NotificationsResponseDto> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = ["notifications", "aggregated", userId, cursor, limit];
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["notifications", "aggregated", userId],
    });
  };
  return {
    ...useQuery({
      queryKey,
      queryFn: () => {
        return NotificationsService.notificationsControllerFindAllV1(
          cursor,
          limit,
        );
      },
      placeholderData: keepPreviousData,
      enabled: !!userId,
    }),
    invalidate,
    queryKey,
  };
}
