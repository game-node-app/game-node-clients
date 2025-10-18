import React, { useContext } from "react";
import { GameViewContext } from "#@/components/game/view/GameView";
import { GameViewLayoutSwitcherContent } from "#@/components";

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

  return (
    <GameViewLayoutSwitcherContent
      layout={layout}
      mode={mode}
      setLayout={setLayout}
    />
  );
};

export { GameViewLayoutSwitcher };
