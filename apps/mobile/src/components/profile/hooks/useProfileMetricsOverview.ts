import { useQuery } from "@tanstack/react-query";
import { ProfileMetricsService, ProfileService } from "@repo/wrapper/server";

export function useProfileMetricsOverview(userId: string) {
    return useQuery({
        queryKey: ["profile", "metrics", userId],
        queryFn: async () => {
            return ProfileMetricsService.profileMetricsControllerGetStatsOverviewV1(userId);
        },
    });
}
