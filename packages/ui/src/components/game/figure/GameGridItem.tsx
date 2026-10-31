import {
  GameFigureProps,
  GameHoverEditFigure,
  useOnMobile,
} from "#@/components";
import { GameFigureWithQuickAdd } from "#@/components/game/figure/GameFigureWithQuickAdd";
import { TGameOrSearchGame } from "#@/components/game/util/types";

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