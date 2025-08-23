import React, { SetStateAction, useContext } from "react";
import { ActionIcon, Chip, Divider, Group, Tooltip } from "@mantine/core";
import { IconLayoutColumns, IconLayoutList } from "@tabler/icons-react";
import { GameViewContext } from "#@/components/game/view/GameView";

export type GameViewLayoutOption = "grid" | "list";

export interface GameViewLayoutSwitcherProps {
  mode: "icon" | "chip";
  setLayout: (layout: GameViewLayoutOption) => void;
}

const GameViewLayoutSwitcher = ({
  mode = "icon",
  setLayout,
}: GameViewLayoutSwitcherProps) => {
  const { layout } = useContext(GameViewContext);

  const handleLayoutChange = (changeTo: GameViewLayoutOption) => {
    console.log("Changing layout to", changeTo);
    setLayout(changeTo);
  };

  if (mode === "chip") {
    const icon = layout === "grid" ? <IconLayoutColumns /> : <IconLayoutList />;

    return (
      <Group wrap={"nowrap"} gap={"xs"}>
        <Chip
          variant={"outline"}
          icon={icon}
          classNames={{
            iconWrapper: "me-1",
          }}
          color={"#262525"}
          checked
          onChange={() =>
            handleLayoutChange(layout === "grid" ? "list" : "grid")
          }
        >
          {layout === "grid" ? "Grid" : "List"}
        </Chip>
      </Group>
    );
  }

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
