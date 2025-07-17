import { useQuery } from "@tanstack/react-query";
import {
  GameAchievementGroupDto,
  GameAchievementService,
  GameAchievementWithObtainedInfo,
  GameObtainedAchievementDto,
} from "@repo/wrapper/server";

export interface GameAchievementExtendedGroup extends GameAchievementGroupDto {
  achievements: GameAchievementWithObtainedInfo[];
}

export function useGameAchievementsV2(
  userId: string | undefined,
  gameId: number,
) {
  return useQuery({
    queryKey: ["game", "achievements", gameId, userId],
    queryFn: async (): Promise<GameAchievementExtendedGroup[]> => {
      const availableAchievements =
        await GameAchievementService.gameAchievementV2ControllerFindAllByGameIdV2(
          gameId,
        );

      if (availableAchievements.length === 0) {
        throw new Error("No achievements available for this title.");
      }

      let obtainedAchievements: GameObtainedAchievementDto[] = [];
      if (userId) {
        obtainedAchievements =
          await GameAchievementService.gameAchievementV2ControllerFindAllObtainedByUserIdV2(
            userId,
            gameId,
          );
      }

      return availableAchievements.map(
        (achievementGroup): GameAchievementExtendedGroup => {
          const obtainedInSource = obtainedAchievements.filter(
            (oa) => oa.source === achievementGroup.source,
          );

          const extendedAchievements = achievementGroup.achievements.map(
            (achievement): GameAchievementWithObtainedInfo => {
              const relatedObtainedAchievement = obtainedInSource.find(
                (oa) => oa.externalId === achievement.externalId,
              );
              return {
                ...achievement,
                isObtained: relatedObtainedAchievement?.isObtained ?? false,
                obtainedAt: relatedObtainedAchievement?.obtainedAt ?? null,
              };
            },
          );

          return {
            ...achievementGroup,
            achievements: extendedAchievements,
          };
        },
      );
    },
  });
}
