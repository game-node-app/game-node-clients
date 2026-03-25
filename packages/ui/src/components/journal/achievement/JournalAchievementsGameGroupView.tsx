import React from "react";
import { JournalAchievementsGameGroup } from "@repo/wrapper/server";
import {
  GameAchievementHoverIcon,
  GameFigureImage,
  useGame,
} from "#@/components";
import { Badge, Box, Flex, Group, Skeleton, Stack, Text } from "@mantine/core";
import { cn } from "#@/util";

interface Props {
  userId: string;
  gameGroup: JournalAchievementsGameGroup;
}

const JournalAchievementsGameGroupView = ({ userId, gameGroup }: Props) => {
  const { isPlatinum, isComplete } = gameGroup;

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
        <Flex className={"flex-nowrap justify-start gap-1.5"}>
          {gameGroup.isComplete && (
            <Badge
              size="sm"
              radius="sm"
              variant="light"
              color="teal"
              className="font-semibold tracking-wide"
            >
              Completed
            </Badge>
          )}

          {gameGroup.isPlatinum && (
            <Badge
              size="sm"
              radius="sm"
              variant="gradient"
              gradient={{ from: "#0d47a1", to: "#cfd8dc", deg: 120 }}
              className="font-semibold tracking-wide text-[#0b1930]"
            >
              Platinum
            </Badge>
          )}
        </Flex>
        <Text className={"text-sm text-dimmed mt-auto"}>{flavorText}</Text>
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
