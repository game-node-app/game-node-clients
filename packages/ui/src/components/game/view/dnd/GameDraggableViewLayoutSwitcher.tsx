import React from "react";
import {
  GameViewLayoutSwitcherContent,
  GameViewLayoutSwitcherProps,
  useGameDraggableViewContext,
} from "#@/components";

const GameDraggableViewLayoutSwitcher = ({
  setLayout,
  mode,
}: GameViewLayoutSwitcherProps) => {
  const { layout } = useGameDraggableViewContext();

  return (
    <GameViewLayoutSwitcherContent
      layout={layout}
      setLayout={setLayout}
      mode={mode}
    />
  );
};

export { GameDraggableViewLayoutSwitcher };
