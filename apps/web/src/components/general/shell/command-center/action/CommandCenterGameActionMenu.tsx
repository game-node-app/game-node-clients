import React from "react";
import { ActionIcon, Button, Group, Menu } from "@mantine/core";
import { IconBoltFilled, IconEdit, IconMenu2 } from "@tabler/icons-react";
import {
  CollectionEntryEditModal,
  GameInfoQuickAddMenu,
  SearchGame,
} from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { useDisclosure } from "@mantine/hooks";
import { closeSpotlight } from "@mantine/spotlight";

interface Props {
  game: SearchGame;
}

const CommandCenterGameActionMenu = ({ game }: Props) => {
  const { t } = useTranslation();
  const [addUpdateModalOpened, addUpdateModalUtils] = useDisclosure();

  return (
    <GameInfoQuickAddMenu game={game}>
      <ActionIcon variant={"subtle"} color={"gray"}>
        <IconMenu2 />
      </ActionIcon>
    </GameInfoQuickAddMenu>
  );
};

export { CommandCenterGameActionMenu };
