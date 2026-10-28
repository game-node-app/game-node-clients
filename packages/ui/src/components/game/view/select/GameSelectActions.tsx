import React from "react";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconSquareCheck, IconSquareCheckFilled } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

export interface GameSelectActionsProps {
  isAllGamesSelected: boolean;
  onSelectAll: () => void;
}

const GameSelectActions = ({
  onSelectAll,
  isAllGamesSelected,
}: GameSelectActionsProps) => {
  const { t } = useTranslation();
  const label = isAllGamesSelected
    ? t("game.select.deselectAll")
    : t("game.select.selectAll");

  return (
    <Group wrap={"nowrap"} gap={"xs"}>
      <Tooltip label={label}>
        <ActionIcon
          size={"lg"}
          variant={"transparent"}
          onClick={onSelectAll}
          aria-label={label}
        >
          {isAllGamesSelected ? (
            <IconSquareCheckFilled className={"w-full h-full"} />
          ) : (
            <IconSquareCheck className={"w-full h-full"} />
          )}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export { GameSelectActions };
