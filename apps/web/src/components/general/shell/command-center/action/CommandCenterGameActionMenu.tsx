import { ActionIcon, Menu } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { GameInfoQuickAddMenu, SearchGame } from "@repo/ui";
import { IconMenu2 } from "@tabler/icons-react";
import { useCommandCenterContext } from "../context/CommandCenterContext";

interface Props {
  game: SearchGame;
}

const CommandCenterGameActionMenu = ({ game }: Props) => {
  const { t } = useTranslation();
  const { openModal } = useCommandCenterContext();

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
          <Menu.Item
            color="red"
            onClick={() => openModal("gameRemoveForm", game)}
          >
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
