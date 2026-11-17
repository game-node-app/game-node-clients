import { useQuery } from "@tanstack/react-query";
import { ProfileMetricsService } from "../../../../../wrapper/src/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export type ProfileMetricsDistributionTypeBy =
  | "genre"
  | "category"
  | "mode"
  | "platform"
  | "theme"
  | "status";

export function useProfileMetricsDistributionByType(
  userId: string,
  by: ProfileMetricsDistributionTypeBy,
) {
  const viewerId = useUserId();

  return useQuery({
    queryKey: [
      "profile",
      "metrics",
      "distribution",
      "type",
      userId,
      by,
      viewerId ?? null,
    ],
    queryFn: async () => {
      return ProfileMetricsService.profileMetricsControllerGetTypeDistributionV1(
        userId,
        by,
      );
    },
  });
}
