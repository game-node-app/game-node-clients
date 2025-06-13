import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AchievementsService,
  ObtainedAchievementDto,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export function useAllObtainedAchievements(
  targetUserId: string | undefined,
  /**
   * Performs client-side sorting. Doesn't affect sorting between pages.
   */
  sortByLatestObtained = false,
): ExtendedUseQueryResult<ObtainedAchievementDto[]> {
  const queryClient = useQueryClient();
  const queryKey = [
    "achievement",
    "obtained",
    "all",
    targetUserId,
    sortByLatestObtained,
  ];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 3) });
  return {
    ...useQuery({
      queryKey,
      queryFn: async () => {
        const achievements =
          await AchievementsService.achievementsControllerGetAllObtainedAchievementsV1(
            targetUserId!,
          );
        if (achievements == undefined || achievements.length === 0) {
          return [];
        }

        if (sortByLatestObtained) {
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
