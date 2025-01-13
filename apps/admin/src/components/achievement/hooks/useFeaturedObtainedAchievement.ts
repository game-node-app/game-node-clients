import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AchievementsService, ObtainedAchievement } from "@/wrapper/server";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

export function useFeaturedObtainedAchievement(
    userId: string | undefined,
): ExtendedUseQueryResult<ObtainedAchievement | undefined> {
    const queryClient = useQueryClient();
    const queryKey = ["achievements", "featured", userId];

    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey,
        });
    };

    return {
        ...useQuery({
            queryKey,
            queryFn: async () => {
                if (!userId) {
                    return null;
                }

                const featuredAchivement =
                    await AchievementsService.achievementsControllerGetFeaturedAchievementForUserIdV1(
                        userId,
                    );

                if (!featuredAchivement) {
                    return null;
                }

                return featuredAchivement;
            },
            enabled: !!userId,
        }),
        invalidate,
        queryKey,
    };
}
