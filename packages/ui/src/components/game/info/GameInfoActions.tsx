import {
  CollectionEntryVisibilitySubmenu,
  GameInfoQuickAddMenu,
  GameInfoShare,
  PreferredPlatformsViewModal,
  toLibraryVisibilityLevel,
  useUpdateFavoriteStatusMutation,
} from "#@/components";
import { CollectionEntryEditModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryEditModal.tsx";
import { CollectionEntryRemoveModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryRemoveModal";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { GameCoverPickerModal } from "#@/components/game/info/GameCoverPickerModal";
import { buildPresenterComponent } from "#@/context";
import { Modal } from "#@/util";
import {
  ActionIcon,
  Button,
  Group,
  GroupProps,
  Menu,
  Stack,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import {
  IconChevronDown,
  IconHeartFilled,
  IconHeartPlus,
  IconDots,
  IconPhotoEdit,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";

const ACTION_SIZE = 36;
const ACTIONS_MAX_WIDTH = 320;

export interface GameInfoActionsProps {
  wrapperProps?: GroupProps;
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
  const [coverPickerOpened, coverPickerUtils] = useDisclosure();

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

  const visibility =
    toLibraryVisibilityLevel(collectionEntryQuery.data?.visibility) ?? "public";

  const favoriteLabel = !gameInLibrary
    ? t("game.tooltips.addToLibraryFirst")
    : gameInFavorites
      ? t("game.tooltips.removeFavorites")
      : t("game.tooltips.addFavorites");

  return (
    <>
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
      <GameCoverPickerModal
        opened={coverPickerOpened}
        onClose={coverPickerUtils.close}
        game={game}
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

      <Stack
        gap={"xs"}
        w={"100%"}
        maw={ACTIONS_MAX_WIDTH}
        className={wrapperProps?.className}
      >
        {/* Primary action: the split button owns the full row. */}
        <Group gap={0} wrap={"nowrap"} w={"100%"}>
          <Button
            onClick={addUpdateModalUtils.open}
            loading={collectionEntryQuery.isLoading}
            className="flex-1 rounded-tr-none rounded-br-none"
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
              size={ACTION_SIZE}
              aria-label={t("game.tooltips.quickAdd")}
              className="rounded-tl-none rounded-bl-none border-0 border-l-[1px] border-body"
            >
              <IconChevronDown />
            </ActionIcon>
          </GameInfoQuickAddMenu>
        </Group>

        {/* Secondary actions share the row evenly, so they never wrap. */}
        <Group gap={"xs"} wrap={"nowrap"} w={"100%"}>
          <Tooltip label={favoriteLabel}>
            <ActionIcon
              aria-label={favoriteLabel}
              size={ACTION_SIZE}
              variant="default"
              className="flex-1 w-auto"
              // `data-disabled` keeps the tooltip working: a native `disabled`
              // button swallows pointer events, so we'd lose the explanation.
              data-disabled={!gameInLibrary || undefined}
              aria-disabled={!gameInLibrary}
              onClick={() => {
                if (!gameInLibrary) return;
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

          <Tooltip label={t("game.coverPicker.open")}>
            <ActionIcon
              aria-label={t("game.coverPicker.open")}
              size={ACTION_SIZE}
              variant="default"
              className="flex-1 w-auto"
              onClick={coverPickerUtils.open}
            >
              <IconPhotoEdit size={"1.05rem"} />
            </ActionIcon>
          </Tooltip>

          {gameInLibrary && (
            <Tooltip label={t("game.tooltips.share")}>
              <ActionIcon
                aria-label={t("game.tooltips.share")}
                size={ACTION_SIZE}
                variant="default"
                className="flex-1 w-auto"
                onClick={shareModalUtils.open}
              >
                <IconShare size={"1.05rem"} />
              </ActionIcon>
            </Tooltip>
          )}

          {/*
            Entry-only actions (visibility, remove) live in the overflow menu.
            Without a library entry there is nothing to put in it.
          */}
          {gameInLibrary && (
            <Menu
              shadow={"md"}
              position={"bottom-end"}
              width={240}
              withinPortal
            >
              <Menu.Target>
                <Tooltip label={t("game.tooltips.moreActions")}>
                  <ActionIcon
                    aria-label={t("game.tooltips.moreActions")}
                    size={ACTION_SIZE}
                    variant="default"
                    className="flex-1 w-auto"
                  >
                    <IconDots size={"1.05rem"} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <CollectionEntryVisibilitySubmenu
                  gameId={game.id}
                  value={visibility}
                />
                <Menu.Divider />
                <Menu.Item
                  color={"red"}
                  leftSection={<IconTrash size={16} />}
                  onClick={removeModalUtils.open}
                >
                  {t("game.tooltips.removeLibrary")}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Stack>
    </>
  );
};

const GameInfoActions = buildPresenterComponent(
  "GameInfoActions",
  DEFAULT_GameInfoActions,
);

export { GameInfoActions };
