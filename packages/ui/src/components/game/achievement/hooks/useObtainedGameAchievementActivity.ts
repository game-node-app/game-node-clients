import { useQuery } from "@tanstack/react-query";
import { GameAchievementService } from "@repo/wrapper/server";

export function useObtainedGameAchievementActivity(
  id: number | null | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["game", "achievements", "obtained", "activity", id],
    queryFn: async () => {
      return GameAchievementService.gameAchievementV2ControllerFindActivityByIdV2(
        id!,
      );
    },
    enabled: (options?.enabled ?? true) && !!id,
  });
}
