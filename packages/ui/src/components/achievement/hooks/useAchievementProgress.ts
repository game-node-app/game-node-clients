import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AchievementProgressDto,
  AchievementsService,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export function useAchievementProgress(
  userId: string | undefined,
): ExtendedUseQueryResult<AchievementProgressDto[]> {
  const queryClient = useQueryClient();
  const queryKey = ["achievements", "progress", userId];
  return {
    ...useQuery({
      queryKey,
      queryFn: () =>
        AchievementsService.achievementsV2ControllerGetProgressV2(userId!),
      enabled: !!userId,
      staleTime: 60 * 1000,
    }),
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
    queryKey,
  };
}
