import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Skeleton, Tabs, Text } from "@mantine/core";
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

  const buildPlatformTabs = useCallback(() => {
    if (availablePlatforms.length <= 1) {
      return null;
    }

    return (
      <Tabs.List className={"flex-nowrap mb-3"}>
        {availablePlatforms.map((platform) => (
          <Tabs.Tab key={`tab-${platform.id}`} value={String(platform.id)}>
            {platform.abbreviation.toUpperCase()}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    );
  }, [availablePlatforms]);

  const buildPlatformPanels = useCallback(() => {
    return availablePlatforms.map((platform) => {
      return (
        <Tabs.Panel
          value={String(platform.id)}
          key={`panel-${platform.id}`}
          className={"flex flex-col gap-2"}
        >
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
        </Tabs.Panel>
      );
    });
  }, [
    availablePlatforms,
    gameId,
    renderedAchievements,
    selectedPlatformId,
    source,
    userId,
  ]);

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
    <Tabs
      value={String(selectedPlatformId)}
      onChange={(value) => setSelectedPlatformId(Number(value))}
      className={"w-full flex flex-col gap-3"}
      keepMounted={false}
      variant={"outline"}
    >
      {isError && <CenteredErrorMessage error={error} />}
      {isLoading && buildLoadingSkeletons()}
      {buildPlatformTabs()}
      {buildPlatformPanels()}
    </Tabs>
  );
};

export { GameAchievementsList };
