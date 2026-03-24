import { TBasePaginationRequest } from "#@/util";
import { useQuery } from "@tanstack/react-query";
import { GameAchievementService } from "@repo/wrapper/server";

interface UseObtainedGameAchievementsProps extends TBasePaginationRequest {
  userId: string;
  orderBy?: object;
}

export function useObtainedGameAchievements(
  dto: UseObtainedGameAchievementsProps,
) {
  return useQuery({
    queryKey: [
      "game",
      "achievements",
      "obtained",
      dto.userId,
      dto.offset,
      dto.limit,
      dto.orderBy,
    ],
    queryFn: async () => {
      return GameAchievementService.gameAchievementV2ControllerFindAllObtainedByUserIdV2(
        dto.userId,
        dto.offset,
        dto.limit,
        dto.orderBy,
      );
    },
    enabled: !!dto.userId,
  });
}
