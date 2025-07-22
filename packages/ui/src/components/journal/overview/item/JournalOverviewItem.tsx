import React, { useMemo } from "react";
import { ActionIcon, Box, Center, Group, Text } from "@mantine/core";
import {
  CenteredLoading,
  GameFigureImage,
  GameRating,
  getCollectionEntryStatusName,
  useCollectionEntry,
  useGame,
  useReviewForUserIdAndGameId,
} from "#@/components";
import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "#@/util";
import { JournalEntryStatusDto } from "@repo/wrapper/server";

interface Props {
  targetDay: number;
  item: JournalEntryStatusDto;
}

const JournalOverviewItem = ({ item, targetDay }: Props) => {
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
    <Group
      className={
        "w-full flex-nowrap items-center bg-[#212121] border-[#2B2A2A] rounded-md border p-3"
      }
    >
      <Group className={"flex-nowrap h-full"}>
        <Center className={"w-4 lg:w-6"}>
          <Text className={"text-lg text-[#A2A2A2] font-bold"}>
            {targetDay}
          </Text>
        </Center>
        <Box className={"w-16 lg:w-20"}>
          <GameFigureImage game={gameQuery.data} />
        </Box>
      </Group>

      <Group className={"grow lg:flex-nowrap gap-4"}>
        <Text className={"font-bold w-full lg:w-fit lg:max-w-52"}>
          {gameQuery.data.name}
        </Text>
        <Group className={"grow lg:justify-end lg:gap-16"}>
          {reviewQuery.data && (
            <GameRating value={reviewQuery.data.rating} size={"sm"} />
          )}
          <Group className={"w-full lg:w-fit lg:gap-16 flex-nowrap"}>
            <Text className={"text-sm lg:text-center w-16 lg:w-20 text-wrap"}>
              {platformNames}
            </Text>
            <Text className={"text-sm lg:text-center w-16 lg:w-20 text-wrap"}>
              {getCollectionEntryStatusName(item.status)}
            </Text>
          </Group>
        </Group>
      </Group>
      <Center>
        <Link
          href={`/library/${targetUserId}/collection/entry/${collectionEntryQuery.data.id}`}
        >
          <ActionIcon variant={"subtle"} size={"lg"}>
            <IconChevronRight
              size={"1.8rem"}
              strokeWidth={3}
              className={"text-brand-5"}
            />
          </ActionIcon>
        </Link>
      </Center>
    </Group>
  );
};

export { JournalOverviewItem };
