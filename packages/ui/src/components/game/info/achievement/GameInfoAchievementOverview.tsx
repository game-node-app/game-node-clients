import React, { useCallback, useMemo } from "react";
import {
  DetailsBox,
  GameInfoAchievementOverviewItem,
  useGameAchievementsV2,
  useUserId,
} from "#@/components";
import { Skeleton } from "@mantine/core";

interface Props {
  gameId: number;
}

const GameInfoAchievementOverview = ({ gameId }: Props) => {
  const userId = useUserId();
  const { data: achievements, isLoading } = useGameAchievementsV2(
    userId,
    gameId,
  );

  const enabledSources = useMemo(() => {
    return achievements?.map((achievement) => achievement.source) ?? [];
  }, [achievements]);

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(2)
      .fill(0)
      .map((_, i) => (
        <Skeleton
          key={`achievements-loading-${i}`}
          animate
          visible
          className={"w-full h-12"}
        />
      ));
  }, []);

  return (
    <DetailsBox
      title={"Achievements"}
      enabled={enabledSources.length > 0 || isLoading}
      withPadding
      withBackground
      withDimmedTitle
    >
      {isLoading && buildLoadingSkeletons()}
      {enabledSources.map((source) => (
        <GameInfoAchievementOverviewItem
          key={`achievement-overview-${source}`}
          source={source}
          gameId={gameId}
        />
      ))}
    </DetailsBox>
  );
};

export { GameInfoAchievementOverview };
