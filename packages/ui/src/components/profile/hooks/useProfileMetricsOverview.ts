import { useQuery } from "@tanstack/react-query";
import { ProfileMetricsService } from "../../../../../wrapper/src/server";

export function useProfileMetricsOverview(userId: string) {
  return useQuery({
    queryKey: ["profile", "metrics", userId],
    queryFn: async () => {
      return ProfileMetricsService.profileMetricsControllerGetStatsOverviewV1(
        userId,
      );
    },
    enabled: !!userId,
  });
}
