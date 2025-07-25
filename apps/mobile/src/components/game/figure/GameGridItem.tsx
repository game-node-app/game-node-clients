import React, { useMemo } from "react";
import GameFigureWithQuickAdd from "@/components/game/figure/GameFigureWithQuickAdd";
import { GameFigureImage, IGameFigureProps, TGameOrSearchGame } from "@repo/ui";

interface IGameGridFigureProps {
  game: TGameOrSearchGame;
  figureProps?: Omit<Partial<IGameFigureProps>, "game">;
  /**
   * If quick add functionality should be enabled. Checks will still be performed to see if
   * it's possible to show the game add modal.
   */
  withQuickAdd?: boolean;
}

const GameGridItem = ({
  game,
  figureProps,
  withQuickAdd = true,
}: IGameGridFigureProps) => {
  const Figure = withQuickAdd ? GameFigureWithQuickAdd : GameFigureImage;

  return <Figure {...figureProps} game={game} />;
};

export default GameGridItem;
