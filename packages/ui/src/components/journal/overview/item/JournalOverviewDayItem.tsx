import React, { useMemo } from "react";
import { JournalEntryDetailsDto } from "@repo/wrapper/server";
import { ActionIcon, Box, Center, Group, Stack, Text } from "@mantine/core";
import {
  CenteredLoading,
  GameFigureImage,
  GameRating,
  getCollectionEntryStatusName,
  useCollectionEntry,
  useGame,
  useReviewForUserIdAndGameId,
} from "#@/components";
import { IconArrowRight } from "@tabler/icons-react";

interface Props {
  item: JournalEntryDetailsDto;
}

const JournalOverviewDayItem = ({ item }: Props) => {
  const collectionEntryQuery = useCollectionEntry(item.collectionEntryId);
  const gameQuery = useGame(item.gameId, {
    relations: {
      cover: true,
    },
  });

  const targetUserId =
    collectionEntryQuery.data?.collections.at(0)?.libraryUserId;

  const reviewQuery = useReviewForUserIdAndGameId(targetUserId, item.gameId);

  const platformNames = useMemo(() => {
    return collectionEntryQuery.data?.ownedPlatforms
      .map((platform) => platform.abbreviation)
      .join(" / ");
  }, [collectionEntryQuery.data?.ownedPlatforms]);

  if (!collectionEntryQuery.data || !gameQuery.data) return <CenteredLoading />;

  return (
    <Group className={"w-full flex-nowrap items-center"}>
      <Box className={"min-w-16 w-16"}>
        <GameFigureImage game={gameQuery.data} />
      </Box>
      <Group className={"grow lg:flex-nowrap gap-4"}>
        <Stack>
          <Text className={"font-bold w-full lg:w-fit"}>
            {gameQuery.data.name}
          </Text>
          {reviewQuery.data && <GameRating value={reviewQuery.data.rating} />}
        </Stack>

        <Group
          className={
            "w-full lg:w-fit lg:ms-auto lg:me-12 lg:gap-24 flex-nowrap"
          }
        >
          <Text className={"text-sm text-center"}>{platformNames}</Text>
          <Text className={"text-sm text-center"}>
            {getCollectionEntryStatusName(item.status)}
          </Text>
        </Group>
      </Group>
      <Center>
        <ActionIcon variant={"subtle"} size={"lg"}>
          <IconArrowRight />
        </ActionIcon>
      </Center>
    </Group>
  );
};

export { JournalOverviewDayItem };
