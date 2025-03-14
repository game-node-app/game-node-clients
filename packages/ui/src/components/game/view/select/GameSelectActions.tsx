import React from "react";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconSquareCheck, IconSquareCheckFilled } from "@tabler/icons-react";

export interface GameSelectActionsProps {
  isAllGamesSelected: boolean;
  onSelectAll: () => void;
}

const GameSelectActions = ({
  onSelectAll,
  isAllGamesSelected,
}: GameSelectActionsProps) => {
  return (
    <Group wrap={"nowrap"} gap={"xs"}>
      <Tooltip label={"Select all items"}>
        <ActionIcon size={"lg"} variant={"transparent"} onClick={onSelectAll}>
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
