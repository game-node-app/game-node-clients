import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AchievementDto,
    AchievementsService,
    ObtainedAchievement,
} from "@/wrapper/server";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

export function useAllObtainedAchievements(
    targetUserId: string | undefined,
    /**
     * Performs client-side sorting. Doesn't affect sorting between pages.
     */
    sortByLatestObtained = false,
): ExtendedUseQueryResult<ObtainedAchievement[] | null> {
    const queryClient = useQueryClient();
    const queryKey = [
        "obtained-achievement",
        "all",
        targetUserId,
        sortByLatestObtained,
    ];
    const invalidate = () => queryClient.invalidateQueries({ queryKey });
    return {
        ...useQuery({
            queryKey,
            queryFn: async () => {
                if (!targetUserId) {
                    return null;
                }
                const achievements =
                    await AchievementsService.achievementsControllerGetAllObtainedAchievementsV1(
                        targetUserId,
                    );
                if (achievements == undefined || achievements.length === 0) {
                    return null;
                } else if (sortByLatestObtained) {
                    return achievements.toSorted((a, b) => {
                        const aCreateDate = new Date(a.createdAt);
                        const bCreateDate = new Date(b.createdAt);
                        return aCreateDate.getTime() - bCreateDate.getTime();
                    });
                }

                return achievements;
            },
            enabled: !!targetUserId,
        }),
        invalidate,
        queryKey,
    };
}
