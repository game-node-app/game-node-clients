import React from "react";
import { JournalAchievementsGameGroup } from "@repo/wrapper/server";
import {
  GameFigureImage,
  JournalAchievementsIconsList,
  JournalAchievementsTags,
  useGame,
} from "#@/components";
import { Badge, Box, Flex, Skeleton, Stack, Text } from "@mantine/core";

interface Props {
  userId: string;
  gameGroup: JournalAchievementsGameGroup;
}

const JournalAchievementsGameGroupView = ({ userId, gameGroup }: Props) => {
  const { data: game, isLoading: isGameLoading } = useGame(gameGroup.gameId, {
    relations: {
      cover: true,
    },
  });

  const flavorText = `${gameGroup.achievements.length} achievement${gameGroup.achievements.length > 1 ? "s" : ""}`;

  return (
    <Flex
      className={
        "bg-paper-6 border rounded-md border-[#2B2A2A] gap-2 p-2 flex-col lg:flex-row lg:flex-nowrap"
      }
    >
      <Box className={"min-w-24 w-24 relative"}>
        {isGameLoading ? (
          <Skeleton className={"w-24 h-32"} />
        ) : (
          <GameFigureImage game={game} />
        )}
      </Box>
      <Stack className={"flex-grow gap-1"}>
        {isGameLoading ? (
          <Skeleton className={"h-4 w-48"} />
        ) : (
          <Text className={"font-bold w-full lg:w-fit lg:max-w-full truncate"}>
            {game?.name}
          </Text>
        )}
        <JournalAchievementsTags group={gameGroup} />
        <Text className={"text-sm text-dimmed mt-auto"}>{flavorText}</Text>
        <JournalAchievementsIconsList achievements={gameGroup.achievements} />
      </Stack>
    </Flex>
  );
};

export { JournalAchievementsGameGroupView };
