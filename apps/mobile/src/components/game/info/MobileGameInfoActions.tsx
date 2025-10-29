import React from "react";
import {
  CollectionEntryEditModal,
  CollectionEntryRemoveModal,
  GameInfoActionsProps,
  GameInfoShare,
  Modal,
  useOwnCollectionEntryForGameId,
  useReviewForUserIdAndGameId,
  useUpdateFavoriteStatusMutation,
  useUserId,
} from "@repo/ui";
import { useDisclosure } from "@mantine/hooks";
import { ActionIcon, Button, Group, Stack, Tooltip } from "@mantine/core";
import {
  IconHeartFilled,
  IconHeartPlus,
  IconShare,
  IconX,
} from "@tabler/icons-react";
import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const MobileGameInfoActions = ({
  wrapperProps,
  game,
}: GameInfoActionsProps) => {
  const [addUpdateModalOpened, addUpdateModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [shareModalOpened, shareModalUtils] = useDisclosure();

  const userId = useUserId();
  const collectionEntryQuery = useOwnCollectionEntryForGameId(game?.id);

  const gameInLibrary =
    !collectionEntryQuery.isError && collectionEntryQuery.data != undefined;

  const gameInFavorites =
    gameInLibrary && collectionEntryQuery.data!.isFavorite;

  const reviewQuery = useReviewForUserIdAndGameId(userId, game?.id);

  const hasReview = reviewQuery.data != undefined;

  const collectionEntryFavoriteMutation = useUpdateFavoriteStatusMutation(
    game?.id,
    gameInFavorites,
  );

  if (game == undefined) {
    return null;
  }

  if (collectionEntryQuery.data == undefined) {
    return (
      <Group className={"w-full justify-center"} {...wrapperProps}>
        <CollectionEntryEditModal
          opened={addUpdateModalOpened}
          onClose={addUpdateModalUtils.close}
          gameId={game.id}
        />
        <Button
          onClick={addUpdateModalUtils.open}
          loading={collectionEntryQuery.isLoading}
          className={"w-40 h-10"}
        >
          Add to library
        </Button>
      </Group>
    );
  }

  return (
    <Stack align={"center"}>
      <Group gap={"0.725rem"} {...wrapperProps}>
        <CollectionEntryEditModal
          opened={addUpdateModalOpened}
          onClose={addUpdateModalUtils.close}
          gameId={game.id}
        />
        <CollectionEntryRemoveModal
          opened={removeModalOpened}
          onClose={removeModalUtils.close}
          gameId={game.id}
        />
        <Modal
          opened={shareModalOpened}
          onClose={shareModalUtils.close}
          title={"Share"}
        >
          <GameInfoShare
            gameId={game.id}
            onShare={async (file) => {
              const base64 = await blobToBase64(file);

              const cachedFileResult = await Filesystem.writeFile({
                path: file.name,
                data: base64,
                directory: Directory.Cache,
              });

              await Share.share({
                title: "My review of this game",
                dialogTitle: "Share your review with friends!",
                url: cachedFileResult.uri,
              });
            }}
          />
        </Modal>

        <Button
          onClick={addUpdateModalUtils.open}
          loading={collectionEntryQuery.isLoading}
          className={"w-40 h-10"}
        >
          Update
        </Button>

        <Tooltip label={"Add to your favorites"}>
          <ActionIcon
            size="xl"
            variant="default"
            disabled={!gameInLibrary}
            onClick={() => {
              collectionEntryFavoriteMutation.mutate(game.id);
            }}
          >
            {gameInFavorites ? (
              <IconHeartFilled size={"1.05rem"} />
            ) : (
              <IconHeartPlus size={"1.05rem"} />
            )}
          </ActionIcon>
        </Tooltip>
        {hasReview && (
          <Tooltip label={"Share this game"}>
            <ActionIcon
              size="xl"
              variant="default"
              onClick={shareModalUtils.open}
            >
              <IconShare size={"1.05rem"} />
            </ActionIcon>
          </Tooltip>
        )}
        {gameInLibrary && (
          <Tooltip label={"Remove from your library"}>
            <ActionIcon
              variant="default"
              size="xl"
              onClick={removeModalUtils.open}
            >
              <IconX color="red" />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Stack>
  );
};

export { MobileGameInfoActions };
