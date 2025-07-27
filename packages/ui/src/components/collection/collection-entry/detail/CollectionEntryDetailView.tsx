import React, { useMemo } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  StackProps,
  Tabs,
  Title,
} from "@mantine/core";
import {
  BackToTopButton,
  Break,
  CollectionEntryAchievementTracker,
  CollectionEntryEditModal,
  CollectionEntryDetailsBox,
  CollectionEntryPlaytimeTracker,
  CollectionEntryRemoveModal,
  CollectionEntryReviewBox,
  GameFigureImage,
  GameInfoContentTitle,
  getSizedImageUrl,
  ImageSize,
  JournalPlaylogView,
  useCollectionEntry,
  useGame,
  useOnMobile,
  useOwnCollectionEntryForGameId,
  useUserProfile,
} from "#@/components";
import { useDisclosure } from "@mantine/hooks";
import { getRandomItem, Link } from "#@/util";
import { IconTrashFilled } from "@tabler/icons-react";

interface Props extends StackProps {
  userId: string;
  collectionEntryId: string;
  withTitle?: boolean;
  onGoBack?: () => void;
  backgroundImageSize?: ImageSize;
}

const CollectionEntryDetailView = ({
  userId,
  collectionEntryId,
  onGoBack,
  withTitle = true,
  backgroundImageSize = ImageSize.SCREENSHOT_HUGE,
  ...others
}: Props) => {
  const onMobile = useOnMobile();

  const profileQuery = useUserProfile(userId);
  const collectionEntryQuery = useCollectionEntry(collectionEntryId);

  const gameId = collectionEntryQuery.data?.gameId;

  const ownCollectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

  const gameQuery = useGame(collectionEntryQuery.data?.gameId, {
    relations: {
      cover: true,
      screenshots: true,
    },
  });

  const backgroundImageUrl = useMemo(() => {
    const randomScreenshot = getRandomItem(gameQuery.data?.screenshots ?? []);

    if (randomScreenshot == undefined) {
      return undefined;
    }

    return getSizedImageUrl(randomScreenshot.url, backgroundImageSize);
  }, [gameQuery.data?.screenshots]);

  const isInLibrary = ownCollectionEntryQuery.data != undefined;

  const [editOpened, editOpenedUtils] = useDisclosure();
  const [removeOpened, removeOpenedUtils] = useDisclosure();

  return (
    <Stack className={"w-full"}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "80vh",
          backgroundImage: `
              linear-gradient(180deg,rgba(0, 0, 0, 0.1) 0%, rgba(10, 10, 10, 0.6) 34%, rgba(25, 25, 25, 1) 87%), 
              url(${backgroundImageUrl})
            `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 9,
          opacity: 0.6,
        }}
      />
      <Stack className={"w-full z-10"} {...others}>
        <BackToTopButton />
        {gameId && (
          <>
            <CollectionEntryEditModal
              id={gameId}
              opened={editOpened}
              onClose={editOpenedUtils.close}
            />
            <CollectionEntryRemoveModal
              gameId={gameId}
              opened={removeOpened}
              onClose={removeOpenedUtils.close}
              onSuccess={onGoBack}
            />
          </>
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

            <Group className={"w-full gap-2 flex-nowrap"}>
              <Button
                className={"grow uppercase"}
                onClick={editOpenedUtils.open}
              >
                {isInLibrary ? "Edit in library" : "Add to library"}
              </Button>
              {isInLibrary && (
                <ActionIcon
                  size={"lg"}
                  variant={"default"}
                  onClick={removeOpenedUtils.open}
                >
                  <IconTrashFilled />
                </ActionIcon>
              )}
            </Group>
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
    </Stack>
  );
};

export { CollectionEntryDetailView };
