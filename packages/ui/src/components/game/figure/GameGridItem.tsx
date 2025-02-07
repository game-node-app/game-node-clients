import React from "react";
import {
  IGameFigureProps,
  GameFigureImage,
} from "#@/components/game/figure/GameFigureImage";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { GameFigureWithQuickAdd } from "#@/components/game/figure/GameFigureWithQuickAdd";
import { GameHoverEditFigure, useOnMobile } from "#@/components";

interface IGameGridFigureProps {
  game: TGameOrSearchGame;
  figureProps?: Omit<Partial<IGameFigureProps>, "game">;
}

const GameGridItem = ({ game, figureProps }: IGameGridFigureProps) => {
  const onMobile = useOnMobile();

  const Figure = onMobile ? GameFigureWithQuickAdd : GameHoverEditFigure;

  return (
    <Figure
      {...figureProps}
      game={game}
      href={`/game/${game?.id}`}
      withHoverTitle={true}
    />
  );
};

export { GameGridItem };
