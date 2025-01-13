import { useQuery } from "@tanstack/react-query";
import { ActivitiesService } from "@/wrapper/server";

export function useLatestActivities(
    userId: string | undefined,
    offset = 0,
    limit = 10,
) {
    return useQuery({
        queryKey: ["activities", "latest", userId, offset, limit],
        queryFn: async () => {
            return ActivitiesService.activitiesRepositoryControllerFindLatestV1(
                userId,
                offset,
                limit,
            );
        },
        retry: 1,
    });
}
