import { useQuery } from "@tanstack/react-query";
import { AchievementsService } from "../../../../../wrapper/src/server";

export function useObtainedAchievement(
  targetUserId: string,
  achievementId: string | undefined,
) {
  return useQuery({
    queryKey: ["obtained-achievement", targetUserId, achievementId],
    queryFn: () => {
      if (!achievementId) {
        return null;
      }
      return AchievementsService.achievementsControllerGetObtainedAchievementV1(
        achievementId,
        targetUserId,
      );
    },
    retry: false,
  });
}
