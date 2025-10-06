import React from "react";
import {
  CollectionCreateOrUpdateModal,
  CollectionRemoveModal,
  CollectionThumbnailCardProps,
  GameFigureImage,
  useCollection,
  useCollectionEntriesForCollectionId,
  useGames,
  useUserId,
} from "@repo/ui";
import {
  ActionIcon,
  Box,
  Center,
  Group,
  Menu,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBrandTelegram,
  IconDots,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { IonRippleEffect, useIonRouter } from "@ionic/react";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { getTabAwareHref } from "@/util/getTabAwareHref.ts";
import { notifications } from "@mantine/notifications";
import { Share } from "@capacitor/share";

const ITEMS_LIMIT = 9;

const MobileCollectionThumbnailCard = ({
  collectionId,
}: CollectionThumbnailCardProps) => {
  const router = useIonRouter();
  const ownUserId = useUserId();
  const clipboardManager = useClipboard();
  const [collectionEditOpened, collectionEditUtils] = useDisclosure();
  const [collectionRemoveOpened, collectionRemoveUtils] = useDisclosure();

  const { data: collection, isLoading } = useCollection(collectionId);
  const { data: collectionEntries } = useCollectionEntriesForCollectionId({
    collectionId,
    limit: 20,
  });

  const gameIds = collectionEntries?.data.map((entry) => entry.gameId);
  const { data: games } = useGames({
    gameIds,
    relations: {
      cover: true,
    },
  });

  const isOwnCollection =
    collection?.libraryUserId != undefined &&
    collection?.libraryUserId === ownUserId;
  const isEmpty = games?.length === 0;
  const hasHitLimit = (games?.length ?? 0) >= ITEMS_LIMIT;
  const remainingItems = (games?.length ?? 0) + 1 - ITEMS_LIMIT;

  const targetHref = `/library/${collection?.libraryUserId}/collection/${collectionId}`;

  return (
    <Menu>
      <CollectionCreateOrUpdateModal
        collectionId={collectionId}
        opened={collectionEditOpened}
        onClose={collectionEditUtils.close}
      />
      <CollectionRemoveModal
        collectionId={collectionId}
        opened={collectionRemoveOpened}
        onClose={collectionRemoveUtils.close}
      />
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPencil size={20} />}
          onClick={collectionEditUtils.open}
        >
          Edit Collection
        </Menu.Item>
        <Menu.Item
          leftSection={<IconBrandTelegram size={20} />}
          onClick={async () => {
            clipboardManager.copy(
              `https://${window.location.host}${targetHref}`,
            );
            await Share.share({
              url: `https://${window.location.host}${targetHref}`,
              text: `Check out my ${collection?.name} collection on GameNode!`,
              dialogTitle: "Share your collection with friends!",
            });
          }}
        >
          Share
        </Menu.Item>
        <Menu.Item
          className={"text-red-500"}
          leftSection={<IconTrash size={20} />}
          onClick={collectionRemoveUtils.open}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
      <Stack
        className={"py-2 px-4 bg-paper-2 rounded-md ion-activatable relative"}
      >
        <IonRippleEffect className={"z-10 rounded-md"} />
        <Group className={"w-full justify-between"}>
          <Title
            className={"text-white text-2xl"}
            onClick={() => {
              router.push(getTabAwareHref(targetHref));
            }}
          >
            {collection?.name}
          </Title>
          {isOwnCollection && (
            <Menu.Target>
              <ActionIcon variant={"subtle"} color={"white"} className={"z-50"}>
                <IconDots />
              </ActionIcon>
            </Menu.Target>
          )}
        </Group>
        <Box
          className={"grid grid-flow-col grid-cols-[repeat(12,minmax(0,_1fr))]"}
          onClick={() => {
            router.push(getTabAwareHref(targetHref));
          }}
        >
          {isEmpty && (
            <Text className={"col-span-12 text-center"}>
              This collection is empty.
            </Text>
          )}
          {games?.slice(0, ITEMS_LIMIT).map((game, i) => {
            return (
              <Box
                key={`${collectionId}-${game.id}`}
                className={"rounded"}
                style={{
                  gridColumn: `${i + 1 === 1 ? 1 : i + 1} / span 3`,
                  gridRowStart: 1,
                }}
              >
                <GameFigureImage
                  game={game}
                  linkProps={{ onClick: (evt) => evt.preventDefault() }}
                />
              </Box>
            );
          })}
          {hasHitLimit && (
            <Box
              className={
                "bg-[#242424] rounded pointer-events-auto cursor-pointer"
              }
              style={{
                gridColumn: `10 / span 3`,
                gridRowStart: 1,
                zIndex: 1,
              }}
            >
              <Center className={"w-full h-full p-4"}>
                <Text className={"text-xl text-wrap text-center"}>
                  {remainingItems} more
                </Text>
              </Center>
            </Box>
          )}
        </Box>
      </Stack>
    </Menu>
  );
};

export { MobileCollectionThumbnailCard };
