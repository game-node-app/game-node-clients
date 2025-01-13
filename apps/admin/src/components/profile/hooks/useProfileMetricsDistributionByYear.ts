import { useQuery } from "@tanstack/react-query";
import { ProfileMetricsService } from "@/wrapper/server";

export type ProfileMetricsDistributionYearBy =
    | "release_year"
    | "finish_year"
    | "playtime";

export function useProfileMetricsDistributionByYear(
    userId: string | undefined,
    by: ProfileMetricsDistributionYearBy,
) {
    return useQuery({
        queryKey: ["profile", "metrics", "distribution", userId, by],
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
