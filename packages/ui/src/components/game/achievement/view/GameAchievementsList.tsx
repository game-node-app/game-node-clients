import React, { useCallback } from "react";
import { Box, Skeleton, Stack, Text } from "@mantine/core";
import {
  CenteredErrorMessage,
  GameAchievementListItem,
  GameInfoAchievementOverviewItem,
  useGameAchievements,
} from "#@/components";
import { GameExternalStoreDto } from "@repo/wrapper/server";

interface Props {
  externalGame: GameExternalStoreDto;
}

const GameAchievementsList = ({ externalGame }: Props) => {
  const { data, isLoading, isError, error } = useGameAchievements(
    externalGame.id,
  );

  const achievements = data ?? [];

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(5)
      .fill(0)
      .map((_, i) => (
        <Skeleton key={i} className={"h-12 w-full pe-3 lg:pe-0 lg:w-96"} />
      ));
  }, []);

  return (
    <Stack className={"w-full"}>
      <Stack className={"w-full ps-3 gap-6"}>
        <Text className={"text-dimmed text-sm"}>
          Beware: some achievements may contain spoilers.
        </Text>
        {isError && <CenteredErrorMessage error={error} />}
        {isLoading && buildLoadingSkeletons()}
        {achievements.map((achievement) => (
          <GameAchievementListItem
            key={achievement.externalId}
            achievement={achievement}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export { GameAchievementsList };
