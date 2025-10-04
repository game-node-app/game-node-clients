import React from "react";
import { Chip, Group } from "@mantine/core";
import { GameView, GameViewLayoutOption } from "#@/components";

interface Props {
  includeExtraContent: boolean;
  onExtraContentChange: (includeExtraContent: boolean) => void;
  onLayoutChange?: (layout: GameViewLayoutOption) => void;
}

const GameSearchViewActions = ({
  includeExtraContent,
  onExtraContentChange,
  onLayoutChange,
}: Props) => {
  return (
    <Group className={"w-full flex-nowrap gap-sm overflow-x-hidden"}>
      {onLayoutChange && (
        <GameView.LayoutSwitcher mode={"chip"} setLayout={onLayoutChange} />
      )}
      <Chip
        variant={"outline"}
        checked={includeExtraContent}
        onChange={onExtraContentChange}
      >
        Show DLCs/Extras
      </Chip>
    </Group>
  );
};

export { GameSearchViewActions };
