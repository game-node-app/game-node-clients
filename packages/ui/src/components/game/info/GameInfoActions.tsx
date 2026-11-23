import {
  CollectionEntryVisibilityMenu,
  CollectionEntryVisibilitySubmenu,
  GameInfoQuickAddMenu,
  PreferredPlatformsViewModal,
  toLibraryVisibilityLevel,
  useOnMobile,
  useUpdateFavoriteStatusMutation,
} from "#@/components";
import { CollectionEntryEditModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryEditModal.tsx";
import { CollectionEntryRemoveModal } from "#@/components/collection/collection-entry/form/modal/CollectionEntryRemoveModal";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { GameCoverPickerModal } from "#@/components/game/info/GameCoverPickerModal";
import { GameShareModal } from "#@/components/game/share/GameShareModal";
import { buildPresenterComponent } from "#@/context";
import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Stack,
  StackProps,
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

/** Controls are 36px on a pointer device, but need a larger touch target. */
const DESKTOP_ACTION_SIZE = 36;
const MOBILE_ACTION_SIZE = 40;
const ACTIONS_MAX_WIDTH = 320;

export interface GameInfoActionsProps {
  wrapperProps?: StackProps;
  game: Game | undefined;
}

/**
 * Component that handles the library-related actions for a game.
 * The game add report is handled here.
 *
 * Shared by web and mobile. Sharing is open to everyone (signed out, not in the
 * library, no review): the platform-specific pieces (native share sheet, saving
 * the image) come from the `shareFile`/`saveFile` hook registry.
 * @constructor
 */
const DEFAULT_GameInfoActions = ({
  game,
  wrapperProps,
}: GameInfoActionsProps) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
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

  const actionSize = onMobile ? MOBILE_ACTION_SIZE : DESKTOP_ACTION_SIZE;

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
      <GameShareModal
        gameId={game.id}
        opened={shareModalOpened}
        onClose={shareModalUtils.close}
      />

      <Stack gap={"xs"} w={"100%"} maw={ACTIONS_MAX_WIDTH} {...wrapperProps}>
        {/* Primary action: the split button owns the full row. */}
        <Group gap={0} wrap={"nowrap"} w={"100%"}>
          <Button
            onClick={addUpdateModalUtils.open}
            loading={collectionEntryQuery.isLoading}
            h={actionSize}
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
              size={actionSize}
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
              size={actionSize}
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
              size={actionSize}
              variant="default"
              className="flex-1 w-auto"
              onClick={coverPickerUtils.open}
            >
              <IconPhotoEdit size={"1.05rem"} />
            </ActionIcon>
          </Tooltip>

          {/*
            Touch devices have no hover, which Mantine's submenu relies on, so
            the current visibility keeps its own button there and the overflow
            menu only holds the destructive action.
          */}
          {onMobile && gameInLibrary && (
            <CollectionEntryVisibilityMenu
              gameId={game.id}
              value={visibility}
              size={actionSize}
              className="flex-1 w-auto"
            />
          )}

          {/* Not gated by the library: the card only needs the game. */}
          <Tooltip label={t("game.tooltips.share")}>
            <ActionIcon
              aria-label={t("game.tooltips.share")}
              size={actionSize}
              variant="default"
              className="flex-1 w-auto"
              onClick={shareModalUtils.open}
            >
              <IconShare size={"1.05rem"} />
            </ActionIcon>
          </Tooltip>

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
                    size={actionSize}
                    variant="default"
                    className="flex-1 w-auto"
                  >
                    <IconDots size={"1.05rem"} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                {!onMobile && (
                  <>
                    <CollectionEntryVisibilitySubmenu
                      gameId={game.id}
                      value={visibility}
                    />
                    <Menu.Divider />
                  </>
                )}
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
