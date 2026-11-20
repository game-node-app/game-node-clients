import {
  GameFigureImage,
  GameRating,
  getLocalizedCollectionEntryStatusName,
  useCollectionEntry,
  useGame,
  useReviewForUserIdAndGameId,
} from "#@/components";
import { buildPresenterComponent } from "#@/context";
import { isNotFoundApiError, Link } from "#@/util";
import { ActionIcon, Box, Center, Group, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { JournalEntryStatusDto } from "@repo/wrapper/server";
import { IconChevronRight } from "@tabler/icons-react";
import { useMemo } from "react";

export interface JournalOverviewItemProps {
  /**
   * Owner of the journal (and of the collection entry).
   * Known upfront, so game/review requests don't wait for the collection entry.
   */
  userId: string;
  targetDay: number;
  item: JournalEntryStatusDto;
}

/**
 * Data needed by a journal overview row. Shared by the default (web) item and
 * the presenters registered by the apps.
 */
function useJournalOverviewItem(userId: string, item: JournalEntryStatusDto) {
  const collectionEntryQuery = useCollectionEntry(item.collectionEntryId);

  const gameQuery = useGame(
    item.gameId,
    {
      relations: {
        cover: true,
      },
    },
    { ownerUserId: userId },
  );

  const reviewQuery = useReviewForUserIdAndGameId(userId, item.gameId);

  const platformNames = useMemo(() => {
    return collectionEntryQuery.data?.ownedPlatforms
      .map((platform) => platform.abbreviation)
      .join(" / ");
  }, [collectionEntryQuery.data?.ownedPlatforms]);

  return { collectionEntryQuery, gameQuery, reviewQuery, platformNames };
}

const DEFAULT_JournalOverviewItem = ({
  userId,
  item,
  targetDay,
}: JournalOverviewItemProps) => {
  const { t } = useTranslation();
  const targetUserId = userId;
  const { collectionEntryQuery, gameQuery, reviewQuery, platformNames } =
    useJournalOverviewItem(userId, item);

  if (isNotFoundApiError(collectionEntryQuery.error)) {
    // The entry became hidden after the overview was cached: omit the row
    // instead of keeping a spinner for content the viewer may not see.
    return null;
  }

  if (!collectionEntryQuery.data || !gameQuery.data) {
    return <Skeleton className={"w-full h-28 lg:h-32 rounded-md"} />;
  }

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
              {getLocalizedCollectionEntryStatusName(item.status, t)}
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

const JournalOverviewItem = buildPresenterComponent(
  "JournalOverviewItem",
  DEFAULT_JournalOverviewItem,
);

export { JournalOverviewItem, useJournalOverviewItem };
