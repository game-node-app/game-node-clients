import React from "react";
import {
  Group,
  Stack,
  Title,
  Text,
  Badge,
  Box,
  Skeleton,
  SimpleGrid,
  Button,
  Tabs,
  StackProps,
} from "@mantine/core";
import {
  BackToTopButton,
  Break,
  CollectionEntryAchievementTracker,
  CollectionEntryAddOrUpdateModal,
  CollectionEntryDetailsBox,
  CollectionEntryPlaytimeTracker,
  CollectionEntryReviewBox,
  DetailsBox,
  GameFigureImage,
  GameInfoContentTitle,
  GameInfoPlaytimeTracker,
  getCollectionEntryStatusName,
  getSizedImageUrl,
  ImageSize,
  JournalPlaylogView,
  useCollectionEntry,
  useGame,
  useOnMobile,
  useUserProfile,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "#@/util";

interface Props extends StackProps {
  userId: string;
  collectionEntryId: string;
  withTitle?: boolean;
  onGoBack?: () => void;
}

const CollectionEntryDetailView = ({
  userId,
  collectionEntryId,
  onGoBack,
  withTitle = true,
  ...others
}: Props) => {
  const onMobile = useOnMobile();
  const profileQuery = useUserProfile(userId);
  const collectionEntryQuery = useCollectionEntry(collectionEntryId);
  const gameId = collectionEntryQuery.data?.gameId;
  const gameQuery = useGame(collectionEntryQuery.data?.gameId, {
    relations: {
      cover: true,
      screenshots: true,
    },
  });

  const [editOpened, editOpenedUtils] = useDisclosure();

  return (
    <Stack className={"w-full"} {...others}>
      <BackToTopButton />
      {gameId && (
        <CollectionEntryAddOrUpdateModal
          id={gameId}
          opened={editOpened}
          onClose={editOpenedUtils.close}
        />
      )}
      {withTitle && (
        <>
          {profileQuery.isLoading ? (
            <Skeleton className={"w-72 h-8"} />
          ) : (
            <GameInfoContentTitle
              title={`${profileQuery.data?.username}'s Collection Entry`}
              onGoBack={() => onGoBack?.()}
            />
          )}
        </>
      )}

      <Group className={"w-full lg:flex-nowrap items-start"}>
        <Stack className={"lg:w-2/12 w-full items-center"}>
          <Box className={"w-3/4 lg:w-full"}>
            <GameFigureImage
              game={gameQuery.data}
              imageSize={ImageSize.COVER_BIG_2X}
            />
          </Box>

          <Title className={"text-center text-xl"}>
            {gameQuery.data?.name}
          </Title>
          <Button className={"w-full uppercase"} onClick={editOpenedUtils.open}>
            Add to your library
          </Button>
          <Link href={`/game/${gameId}`} className={"w-full"}>
            <Button className={"w-full uppercase"}>View Game</Button>
          </Link>
        </Stack>
        <Stack className={"grow"}>
          <SimpleGrid
            cols={{
              base: 1,
              lg: 2,
            }}
          >
            <CollectionEntryDetailsBox
              userId={userId}
              collectionEntryId={collectionEntryId}
            />
            <Break />
            <CollectionEntryPlaytimeTracker
              userId={userId}
              collectionEntryId={collectionEntryId}
            />
            <CollectionEntryReviewBox
              userId={userId}
              collectionEntryId={collectionEntryId}
            />
          </SimpleGrid>
        </Stack>
      </Group>
      {!onMobile && gameId && (
        <Group className={"w-full lg:flex-nowrap items-start"}>
          <Box className={"w-full lg:w-7/12"}>
            <JournalPlaylogView userId={userId as string} gameId={gameId} />
          </Box>
          <Box className={"w-full lg:w-5/12"}>
            <CollectionEntryAchievementTracker
              userId={userId}
              gameId={gameId}
            />
          </Box>
        </Group>
      )}
      {onMobile && gameId && (
        <Tabs defaultValue={"playlog"} variant={"outline"}>
          <Tabs.List grow>
            <Tabs.Tab value={"playlog"}>Playlog</Tabs.Tab>
            <Tabs.Tab value={"achievements"}>Achievements</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={"playlog"}>
            <JournalPlaylogView
              userId={userId as string}
              gameId={gameId}
              withTitle={false}
            />
          </Tabs.Panel>
          <Tabs.Panel value={"achievements"}>
            <CollectionEntryAchievementTracker
              userId={userId}
              gameId={gameId}
              withTitle={false}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </Stack>
  );
};

export { CollectionEntryDetailView };
