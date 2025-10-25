import { ProfileMetricsService } from "@repo/wrapper/server";
import { Period } from "#@/util";
import { useQuery } from "@tanstack/react-query";

export function useProfileMetricsReport(userId: string, period: Period) {
  return useQuery({
    queryKey: ["profile", "metrics", "report", userId, period],
    queryFn: async () => {
      return ProfileMetricsService.profileMetricsControllerGetPeriodReportV1(
        userId,
        period,
      );
    },
    enabled: !!userId,
  });
}
