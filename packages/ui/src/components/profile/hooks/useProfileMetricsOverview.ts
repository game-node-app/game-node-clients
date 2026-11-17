import { useQuery } from "@tanstack/react-query";
import { ProfileMetricsService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useProfileMetricsOverview(userId: string) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: ["profile", "metrics", userId, viewerId ?? null],
    queryFn: async () => {
      return ProfileMetricsService.profileMetricsControllerGetStatsOverviewV1(
        userId,
      );
    },
    enabled: !!userId,
  });
}
