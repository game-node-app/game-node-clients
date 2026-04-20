import { ActionIcon, Menu } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { GameInfoQuickAddMenu, SearchGame, useUserId } from "@repo/ui";
import { IconMenu2 } from "@tabler/icons-react";
import { useCommandCenterContext } from "../context/CommandCenterContext";
import { useCallback } from "react";
import { CollectionsEntriesService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import ca from "zod/v4/locales/ca.cjs";

interface Props {
  game: SearchGame;
}

const CommandCenterGameActionMenu = ({ game }: Props) => {
  const { t } = useTranslation();
  const { openModal } = useCommandCenterContext();

  const onGameRemoveFrom = useCallback(async () => {
    try {
      await CollectionsEntriesService.collectionsEntriesControllerFindOwnEntryByGameIdV1(
        game.id!,
      );
    } catch (error) {
      console.error(
        "Error fetching collection entry for game id:",
        game.id,
        error,
      );
      notifications.show({
        title: t("collectionEntry.errors.notFound.title"),
        message: t("collectionEntry.errors.notFound.message"),
        color: "red",
      });
      return;
    }

    openModal("gameRemoveForm", game);
  }, [game, openModal, t]);

  return (
    <GameInfoQuickAddMenu
      game={game}
      onPreferredPlatformSetupClick={() =>
        openModal("preferredPlatforms", null)
      }
      dropdownChildren={
        <>
          <Menu.Label>{t("library.labels.management")}</Menu.Label>
          <Menu.Item onClick={() => openModal("gameAddEditForm", game)}>
            {t("collectionEntry.buttons.editInLibrary")}
          </Menu.Item>
          <Menu.Item color="red" onClick={() => onGameRemoveFrom()}>
            {t("collectionEntry.buttons.removeFromLibrary")}
          </Menu.Item>
        </>
      }
    >
      <ActionIcon variant={"subtle"} color={"gray"}>
        <IconMenu2 />
      </ActionIcon>
    </GameInfoQuickAddMenu>
  );
};

export { CommandCenterGameActionMenu };
