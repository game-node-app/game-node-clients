import { ActionIcon } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { GameInfoQuickAddMenu, SearchGame } from "@repo/ui";
import { IconMenu2 } from "@tabler/icons-react";
import { useCommandCenterContext } from "../context/CommandCenterContext";

interface Props {
  game: SearchGame;
}

const CommandCenterGameActionMenu = ({ game }: Props) => {
  const { openModal } = useCommandCenterContext();

  return (
    <GameInfoQuickAddMenu
      game={game}
      onPreferredPlatformSetupClick={() =>
        openModal("preferredPlatforms", null)
      }
    >
      <ActionIcon variant={"subtle"} color={"gray"}>
        <IconMenu2 />
      </ActionIcon>
    </GameInfoQuickAddMenu>
  );
};

export { CommandCenterGameActionMenu };
