import { ProfileMetricsService } from "@repo/wrapper/server";
import { Period } from "#@/util";
import { useQuery } from "@tanstack/react-query";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useProfileMetricsReport(userId: string, period: Period) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: [
      "profile",
      "metrics",
      "report",
      userId,
      period,
      viewerId ?? null,
    ],
    queryFn: async () => {
      return ProfileMetricsService.profileMetricsControllerGetPeriodReportV1(
        userId,
        period,
      );
    },
    enabled: !!userId,
  });
}
