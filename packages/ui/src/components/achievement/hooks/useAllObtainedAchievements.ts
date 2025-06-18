import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AchievementsService,
  ObtainedAchievementDto,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export function useAllObtainedAchievements(
  targetUserId: string | undefined,
  isFeatured?: boolean,
  orderBy = {
    createdAt: "DESC",
  },
): ExtendedUseQueryResult<ObtainedAchievementDto[]> {
  const queryClient = useQueryClient();
  const queryKey = [
    "achievement",
    "obtained",
    "all",
    targetUserId,
    orderBy,
    isFeatured,
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
            isFeatured,
            orderBy,
          );

        if (achievements == undefined) {
          return [];
        }

        return achievements;
      },
      enabled: !!targetUserId,
    }),
    invalidate,
    queryKey,
  };
}
