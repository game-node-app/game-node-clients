import React from "react";
import {
  cn,
  CollectionEntryEditModal,
  CollectionEntryRemoveModal,
  GameInfoActionsProps,
  GameInfoQuickAddMenu,
  GameInfoShare,
  Modal,
  PreferredPlatformsViewModal,
  useOwnCollectionEntryForGameId,
  useReviewForUserIdAndGameId,
  useUpdateFavoriteStatusMutation,
  useUserId,
} from "@repo/ui";
import { useDisclosure } from "@mantine/hooks";
import { ActionIcon, Button, Group, Stack, Tooltip } from "@mantine/core";
import {
  IconChevronDown,
  IconHeartFilled,
  IconHeartPlus,
  IconShare,
  IconX,
} from "@tabler/icons-react";
import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useTranslation } from "@repo/locales";

const MobileGameInfoActions = ({
  wrapperProps,
  game,
}: GameInfoActionsProps) => {
  const { t } = useTranslation();
  const [addUpdateModalOpened, addUpdateModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [shareModalOpened, shareModalUtils] = useDisclosure();
  const [preferredPlatformsModalOpened, preferredPlatformsModalUtils] =
    useDisclosure();

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
          className={"min-w-40 h-10"}
        >
          {t("game.buttons.addLibrary")}
        </Button>
      </Group>
    );
  }

  return (
    <Stack align={"center"}>
      <Group
        gap={"0.725rem"}
        {...wrapperProps}
        className={cn("w-full justify-center", wrapperProps?.className)}
      >
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
          title={t("game.labels.share")}
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
                title: t("game.share.myReview"),
                dialogTitle: t("game.share.shareReview"),
                url: cachedFileResult.uri,
              });
            }}
          />
        </Modal>
        <PreferredPlatformsViewModal
          opened={preferredPlatformsModalOpened}
          onClose={preferredPlatformsModalUtils.close}
        />

        <Group className="gap-0">
          <Button
            onClick={addUpdateModalUtils.open}
            loading={collectionEntryQuery.isLoading}
            className="rounded-tr-none rounded-br-none h-10 min-w-20"
          >
            {gameInLibrary
              ? t("game.buttons.update")
              : t("game.buttons.addLibrary")}
          </Button>
          <GameInfoQuickAddMenu
            game={game}
            onPreferredPlatformSetupClick={preferredPlatformsModalUtils.open}
          >
            <ActionIcon
              variant="filled"
              size={40}
              className="rounded-tl-none rounded-bl-none border-0 border-l-[1px] border-body"
            >
              <IconChevronDown />
            </ActionIcon>
          </GameInfoQuickAddMenu>
        </Group>

        <Tooltip label={t("game.tooltips.addFavorites")}>
          <ActionIcon
            size={40}
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
        <Tooltip label={t("game.tooltips.share")}>
          <ActionIcon
            size={40}
            variant="default"
            onClick={shareModalUtils.open}
          >
            <IconShare size={"1.05rem"} />
          </ActionIcon>
        </Tooltip>
        {gameInLibrary && (
          <Tooltip label={t("game.tooltips.removeLibrary")}>
            <ActionIcon
              variant="default"
              size={40}
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
