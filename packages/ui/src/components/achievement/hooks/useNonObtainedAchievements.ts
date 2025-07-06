import { ExtendedUseQueryResult } from "#@/util";
import { AchievementDto, AchievementsService } from "@repo/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useNonObtainedAchievements(
  targetUserId: string,
): ExtendedUseQueryResult<AchievementDto[]> {
  const queryClient = useQueryClient();
  const queryKey = ["achievement", "pending", "all", targetUserId];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 3) });

  return {
    ...useQuery({
      queryKey,
      queryFn: async () => {
        if (!targetUserId) return [];

        const obtainedAchievements =
          await AchievementsService.achievementsControllerGetAllObtainedAchievementsV1(
            targetUserId!,
          );

        const achievements =
          await AchievementsService.achievementsControllerGetAchievementsV1(
            0,
            100000,
          );

        return achievements.data.filter(
          (achievement) =>
            !obtainedAchievements.some(
              (obtainedAchievement) =>
                obtainedAchievement.achievementId === achievement.id,
            ),
        );
      },
      enabled: !!targetUserId,
    }),
    invalidate,
    queryKey,
  };
}
