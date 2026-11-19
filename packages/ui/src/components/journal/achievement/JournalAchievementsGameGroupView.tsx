import {
  GameFigureImage,
  JournalAchievementsIconsList,
  JournalAchievementsTags,
  useGame,
} from "#@/components";
import { buildPresenterComponent } from "#@/context";
import { Box, Flex, Skeleton, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { JournalAchievementsGameGroup } from "@repo/wrapper/server";
import { useMemo } from "react";

export interface JournalAchievementsGameGroupViewProps {
  userId: string;
  gameGroup: JournalAchievementsGameGroup;
}

const DEFAULT_JournalAchievementsGameGroupView = ({
  userId,
  gameGroup,
}: JournalAchievementsGameGroupViewProps) => {
  const { t } = useTranslation();
  const { data: game, isLoading: isGameLoading } = useGame(
    gameGroup.gameId,
    {
      relations: {
        cover: true,
      },
    },
    { ownerUserId: userId },
  );

  const flavorText = useMemo(
    () =>
      t("journal.achievements.count", {
        count: gameGroup.achievements.length,
      }),
    [gameGroup.achievements.length, t],
  );

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

const JournalAchievementsGameGroupView = buildPresenterComponent(
  "JournalAchievementsGameGroup",
  DEFAULT_JournalAchievementsGameGroupView,
);

export { JournalAchievementsGameGroupView };
