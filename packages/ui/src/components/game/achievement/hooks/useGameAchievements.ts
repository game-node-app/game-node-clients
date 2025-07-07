import { useQuery } from "@tanstack/react-query";
import {
  GameAchievementDto,
  GameAchievementService,
  GameExternalGame,
  GameObtainedAchievementDto,
} from "@repo/wrapper/server";

export const ACHIEVEMENT_ENABLED_STORES = [
  GameExternalGame.category._1,
  GameExternalGame.category._36,
  GameExternalGame.category._11,
];

export type GameAchievementWithObtainedInfo = GameAchievementDto &
  Pick<GameObtainedAchievementDto, "isObtained" | "obtainedAt">;

export function useGameAchievements(externalGameId: number) {
  return useQuery({
    queryKey: ["game", "achievements", externalGameId],
    queryFn: async (): Promise<GameAchievementWithObtainedInfo[]> => {
      const [availableAchievements, obtainedAchievements] =
        await Promise.allSettled([
          GameAchievementService.gameAchievementControllerFindAllByExternalGameIdV1(
            externalGameId,
          ),
          GameAchievementService.gameAchievementControllerFindAllObtainedByExternalGameIdV1(
            externalGameId,
          ),
        ]);

      if (availableAchievements.status === "rejected") {
        throw new Error("No achievements available for this item.");
      }

      return availableAchievements.value.map((achievement) => {
        let isObtained = false;
        let obtainedAt: string | null = null;

        if (obtainedAchievements.status === "fulfilled") {
          const relatedProgress = obtainedAchievements.value.find(
            (obtainedAchievement) =>
              obtainedAchievement.externalId === achievement.externalId,
          );
          isObtained = relatedProgress?.isObtained ?? false;
          obtainedAt = relatedProgress?.obtainedAt ?? null;
        }

        return {
          ...achievement,
          isObtained,
          obtainedAt,
        };
      });
    },
    retry: 1,
  });
}
