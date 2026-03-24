import React from "react";
import { JournalAchievementsGameGroup } from "@repo/wrapper/server";
import {
  CenteredLoading,
  GameAchievementHoverIcon,
  GameFigureImage,
  useGame,
} from "#@/components";
import { Box, Flex, Group, Skeleton, Stack, Text } from "@mantine/core";

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
      <Box className={"min-w-20 w-20 relative"}>
        {isGameLoading ? (
          <Skeleton className={"w-20 h-24"} />
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
        <Text className={"text-sm text-dimmed"}>{flavorText}</Text>
        <Group
          className={"gap-1.5 flex-nowrap max-w-full overflow-x-auto pb-2"}
        >
          {gameGroup.achievements.map((achievement) => (
            <GameAchievementHoverIcon
              key={achievement.externalId}
              achievement={achievement}
            />
          ))}
        </Group>
      </Stack>
    </Flex>
  );
};

export { JournalAchievementsGameGroupView };
