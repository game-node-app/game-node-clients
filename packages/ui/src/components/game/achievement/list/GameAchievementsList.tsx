import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Skeleton, Stack, Tabs, Text } from "@mantine/core";
import {
  CenteredErrorMessage,
  GameAchievementProgressOverview,
  GameAchievementsListItem,
  useGameAchievementsV2,
  useGamesResource,
} from "#@/components";
import { GameAchievementGroupDto } from "@repo/wrapper/server";

interface Props {
  source: GameAchievementGroupDto.source;
  userId: string | undefined;
  gameId: number;
}

/**
 * Renders a game's achievement list for a given source. <br>
 * Also allows for platform filtering if more than one platform is available.
 * @param source
 * @param userId
 * @param gameId
 * @constructor
 */
const GameAchievementsList = ({ source, userId, gameId }: Props) => {
  const { data, isLoading, isError, error } = useGameAchievementsV2(
    userId,
    gameId,
  );

  const platformsQuery = useGamesResource("platforms");

  const [selectedPlatformId, setSelectedPlatformId] = useState<
    number | undefined
  >(undefined);

  const targetAchievementsGroup = useMemo(() => {
    return data?.find((group) => group.source === source);
  }, [data, source]);

  /**
   * Rendered achievements, based on source and selected platform id.
   */
  const renderedAchievements = useMemo(() => {
    if (targetAchievementsGroup == undefined || selectedPlatformId == undefined)
      return [];

    return targetAchievementsGroup.achievements.filter((achievement) => {
      return achievement.platformIds.includes(selectedPlatformId);
    });
  }, [selectedPlatformId, targetAchievementsGroup]);

  const availablePlatforms = useMemo(() => {
    if (
      platformsQuery.data == undefined ||
      targetAchievementsGroup == undefined
    )
      return [];

    const achievementPlatformIds = Array.from(
      new Set(
        targetAchievementsGroup.achievements.flatMap(
          (achievement) => achievement.platformIds,
        ),
      ),
    );

    return platformsQuery.data.filter((platform) => {
      return achievementPlatformIds.includes(platform.id);
    });
  }, [platformsQuery.data, targetAchievementsGroup]);

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(5)
      .fill(0)
      .map((_, i) => (
        <Skeleton key={i} className={"h-12 w-full pe-3 lg:pe-0 lg:w-96"} />
      ));
  }, []);

  /**
   * Automatically selects the first available platform for rendering.
   */
  useEffect(() => {
    if (targetAchievementsGroup) {
      const firstWithOwnedAchievement = targetAchievementsGroup.achievements
        .find((achievement) => achievement.isObtained)
        ?.platformIds.at(0);

      if (firstWithOwnedAchievement) {
        setSelectedPlatformId(firstWithOwnedAchievement);
        return;
      }

      const firstAvailablePlatform = targetAchievementsGroup.achievements
        .at(0)
        ?.platformIds.at(0);

      if (firstAvailablePlatform) {
        setSelectedPlatformId(firstAvailablePlatform);
      }
    }
  }, [targetAchievementsGroup]);

  return (
    <Stack className={"w-full flex flex-col gap-3"}>
      {isError && <CenteredErrorMessage error={error} />}
      {isLoading && buildLoadingSkeletons()}
      {availablePlatforms.length > 1 && (
        <Select
          data={availablePlatforms.map((platform) => ({
            label: platform.name,
            value: String(platform.id),
          }))}
          value={String(selectedPlatformId)}
          onChange={(value) => {
            setSelectedPlatformId(Number(value));
          }}
          description={"Platform"}
          className={"max-w-fit"}
          size={"sm"}
        />
      )}
      <Stack className={"gap-2"}>
        <GameAchievementProgressOverview
          source={source}
          gameId={gameId}
          userId={userId}
          targetPlatformId={selectedPlatformId}
        />
        {renderedAchievements.map((achievement) => (
          <GameAchievementsListItem
            key={`${achievement.externalGameId}-${achievement.externalId}`}
            achievement={achievement}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export { GameAchievementsList };
