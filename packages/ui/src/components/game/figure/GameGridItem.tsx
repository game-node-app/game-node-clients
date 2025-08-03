import React from "react";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { GameFigureWithQuickAdd } from "#@/components/game/figure/GameFigureWithQuickAdd";
import {
  GameFigureProps,
  GameHoverEditFigure,
  useOnMobile,
} from "#@/components";

interface GameGridItemProps {
  game: TGameOrSearchGame;
  figureProps?: Omit<Partial<GameFigureProps>, "game">;
}

const GameGridItem = ({ game, figureProps }: GameGridItemProps) => {
  const onMobile = useOnMobile();

  const Figure = onMobile ? GameFigureWithQuickAdd : GameHoverEditFigure;

  return <Figure game={game} withHoverTitle={true} {...figureProps} />;
};

export { GameGridItem };
