import useUserId from "@/components/auth/hooks/useUserId";
import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    NotificationAggregateDto,
    NotificationsService,
    PaginatedNotificationAggregationDto,
} from "@/wrapper/server";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

export function useAggregatedNotifications(
    offset = 0,
    limit = 20,
): ExtendedUseQueryResult<PaginatedNotificationAggregationDto> {
    const userId = useUserId();
    const queryClient = useQueryClient();
    const queryKey = ["notifications", "aggregated", userId];
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey,
        });
    };
    return {
        ...useQuery({
            queryKey,
            queryFn: () => {
                return NotificationsService.notificationsControllerFindAllAndAggregateV1(
                    offset,
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
