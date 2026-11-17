import { useQuery } from "@tanstack/react-query";
import { ProfileMetricsService } from "../../../../../wrapper/src/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export type ProfileMetricsDistributionYearBy =
  | "release_year"
  | "finish_year"
  | "playtime";

export function useProfileMetricsDistributionByYear(
  userId: string | undefined,
  by: ProfileMetricsDistributionYearBy,
) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: [
      "profile",
      "metrics",
      "distribution",
      userId,
      by,
      viewerId ?? null,
    ],
    queryFn: async () => {
      if (!userId) return null;
      return ProfileMetricsService.profileMetricsControllerGetYearDistributionV1(
        userId,
        by,
      );
    },
    enabled: !!userId,
  });
}
