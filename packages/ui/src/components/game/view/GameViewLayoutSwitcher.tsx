import React, { SetStateAction, useContext } from "react";
import { ActionIcon, Divider, Group, Tooltip } from "@mantine/core";
import { IconLayoutColumns, IconLayoutList } from "@tabler/icons-react";
import { GameViewContext } from "#@/components/game/view/GameView";

export interface GameViewLayoutSwitcherProps {
  setLayout: React.Dispatch<SetStateAction<"grid" | "list">>;
}

const GameViewLayoutSwitcher = ({ setLayout }: GameViewLayoutSwitcherProps) => {
  const { layout } = useContext(GameViewContext);

  const handleLayoutChange = (changeTo: "grid" | "list") => {
    setLayout(changeTo);
  };

  return (
    <Group wrap={"nowrap"} gap={"xs"}>
      <Tooltip label={"Grid"} position={"bottom"}>
        <ActionIcon
          size={"md"}
          onClick={() => handleLayoutChange("grid")}
          variant={layout === "grid" ? "filled" : "outline"}
        >
          <IconLayoutColumns />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={"vertical"} />
      <Tooltip label={"List"} position={"bottom"}>
        <ActionIcon
          size={"md"}
          onClick={() => handleLayoutChange("list")}
          variant={layout === "list" ? "filled" : "outline"}
        >
          <IconLayoutList />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export { GameViewLayoutSwitcher };
