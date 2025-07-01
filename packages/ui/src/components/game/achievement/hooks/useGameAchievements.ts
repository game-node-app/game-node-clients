import { useQuery } from "@tanstack/react-query";
import {
  GameAchievementDto,
  GameAchievementService,
  GameExternalGame,
  GameObtainedAchievementDto,
} from "@repo/wrapper/server";

export const ACHIEVEMENT_ENABLED_STORES = [GameExternalGame.category._1];

export type GameAchievementWithObtainedInfo = GameAchievementDto &
  Pick<GameObtainedAchievementDto, "isObtained" | "obtainedAt">;

export function useGameAchievements(externalGameId: number) {
  return useQuery({
    queryKey: ["game", "achievements", externalGameId],
    queryFn: async (): Promise<GameAchievementWithObtainedInfo[]> => {
      const [availableAchievements, obtainedAchievements] = await Promise.all([
        GameAchievementService.gameAchievementControllerFindAllByExternalGameIdV1(
          externalGameId,
        ),
        GameAchievementService.gameAchievementControllerFindAllObtainedByExternalGameIdV1(
          externalGameId,
        ),
      ]);

      return availableAchievements.map((achievement) => {
        const relatedProgress = obtainedAchievements.find(
          (obtainedAchievement) =>
            obtainedAchievement.externalId === achievement.externalId,
        );

        return {
          ...achievement,
          isObtained: relatedProgress?.isObtained ?? false,
          obtainedAt: relatedProgress?.obtainedAt ?? null,
        };
      });
    },
  });
}
