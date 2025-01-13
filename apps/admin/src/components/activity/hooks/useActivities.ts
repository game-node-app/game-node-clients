import { useQuery } from "@tanstack/react-query";
import { ActivitiesService } from "@/wrapper/server";

/**
 * Returns all activities, sorted by create date (latest first).
 * @param userId
 */
export function useActivities(userId?: string) {
    return useQuery({
        queryKey: ["activities", "all", userId],
        queryFn: async () => {
            return ActivitiesService.activitiesRepositoryControllerFindLatestV1(
                userId,
                0,
                9999999999,
            );
        },
        retry: 1,
    });
}
