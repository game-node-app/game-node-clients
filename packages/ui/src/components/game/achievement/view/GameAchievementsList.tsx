import React from "react";
import { Box, Stack } from "@mantine/core";
import {
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

  return (
    <Stack className={"w-full"}>
      <Box className={"max-w-fit"}>
        <GameInfoAchievementOverviewItem externalGame={externalGame} />
      </Box>
      <Stack className={"w-full ps-3 gap-6"}>
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
