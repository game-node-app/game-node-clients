import {
  GameInfoQuickAddMenu,
  GameInfoShare,
  PreferredPlatformsViewModal,
  useUpdateFavoriteStatusMutation,
} from "#@/components";
import { CollectionEntryEditModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryEditModal.tsx";
import { CollectionEntryRemoveModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryRemoveModal";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { buildPresenterComponent } from "#@/context";
import { Modal } from "#@/util";
import { ActionIcon, Button, Group, Stack, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import {
  IconChevronDown,
  IconChevronsDown,
  IconHeartFilled,
  IconHeartPlus,
  IconShare,
  IconX,
} from "@tabler/icons-react";
import React from "react";

export interface GameInfoActionsProps {
  wrapperProps?: React.ComponentPropsWithoutRef<typeof Group>;
  game: Game | undefined;
}

/**
 * Component that handles the library-related actions for a game.
 * The game add report is handled here.
 * @constructor
 */
const DEFAULT_GameInfoActions = ({
  game,
  wrapperProps,
}: GameInfoActionsProps) => {
  const { t } = useTranslation();
  const [addUpdateModalOpened, addUpdateModalUtils] = useDisclosure();
  const [removeModalOpened, removeModalUtils] = useDisclosure();
  const [shareModalOpened, shareModalUtils] = useDisclosure();
  const [preferredPlatformsModalOpened, preferredPlatformsModalUtils] =
    useDisclosure();

  const collectionEntryQuery = useOwnCollectionEntryForGameId(game?.id);

  const gameInLibrary =
    !collectionEntryQuery.isError && collectionEntryQuery.data != undefined;

  const gameInFavorites =
    gameInLibrary && collectionEntryQuery.data!.isFavorite;

  const collectionEntryFavoriteMutation = useUpdateFavoriteStatusMutation(
    game?.id,
    gameInFavorites,
  );

  if (game == undefined) {
    return null;
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
        <PreferredPlatformsViewModal
          opened={preferredPlatformsModalOpened}
          onClose={preferredPlatformsModalUtils.close}
        />
        <Modal
          opened={shareModalOpened}
          onClose={shareModalUtils.close}
          title={t("game.labels.share")}
        >
          <GameInfoShare
            gameId={game.id}
            onShare={async (file) => {
              // eslint-disable-next-line no-undef
              const toShare: ShareData = {
                title: t("game.share.title"),
                text: t("game.share.seeMoreAt", { gameId: game?.id }),
                files: [file],
                url: `https://gamenode.app/game/${game?.id}`,
              };

              return await navigator.share(toShare);
            }}
          />
        </Modal>

        <Group className="gap-0">
          <Button
            onClick={addUpdateModalUtils.open}
            loading={collectionEntryQuery.isLoading}
            className="rounded-tr-none rounded-br-none"
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
              size={36}
              className="rounded-tl-none rounded-bl-none border-0 border-l-[1px] border-body"
            >
              <IconChevronDown />
            </ActionIcon>
          </GameInfoQuickAddMenu>
        </Group>

        <Tooltip label={t("game.tooltips.addFavorites")}>
          <ActionIcon
            size="lg"
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

        {gameInLibrary && (
          <>
            <Tooltip label={t("game.tooltips.removeLibrary")}>
              <ActionIcon
                variant="default"
                size="lg"
                onClick={removeModalUtils.open}
              >
                <IconX color="red" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t("game.tooltips.share")}>
              <ActionIcon
                size="lg"
                variant="default"
                onClick={shareModalUtils.open}
              >
                <IconShare size={"1.05rem"} />
              </ActionIcon>
            </Tooltip>
          </>
        )}
      </Group>
    </Stack>
  );
};

const GameInfoActions = buildPresenterComponent(
  "GameInfoActions",
  DEFAULT_GameInfoActions,
);

export { GameInfoActions };
