import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AchievementsService, AchievementV2Dto } from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

// shortcut: catalog fetched in one 1000-item page, paginate server-side if published definitions exceed ~500.
export function useAchievementsV2(
  targetUserId?: string,
): ExtendedUseQueryResult<AchievementV2Dto[]> {
  const queryClient = useQueryClient();
  const queryKey = ["achievements", "v2", targetUserId];
  return {
    ...useQuery({
      queryKey,
      queryFn: async () =>
        (
          await AchievementsService.achievementsV2ControllerGetAchievementsV2(
            0,
            1000,
            targetUserId,
          )
        ).data,
      staleTime: 60 * 1000,
    }),
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
    queryKey,
  };
}
