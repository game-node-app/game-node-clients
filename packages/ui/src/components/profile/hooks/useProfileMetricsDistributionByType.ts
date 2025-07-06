import { useQuery } from "@tanstack/react-query";
import { ProfileMetricsService } from "../../../../../wrapper/src/server";

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
  return useQuery({
    queryKey: ["profile", "metrics", "distribution", "type", userId, by],
    queryFn: async () => {
      return ProfileMetricsService.profileMetricsControllerGetTypeDistributionV1(
        userId,
        by,
      );
    },
  });
}
