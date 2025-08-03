import {
  GameFigureWithQuickAddProps,
  GameHoverEditFigureProps,
  IGameFigureImageProps,
} from "#@/components";

export type GameFigureProps = IGameFigureImageProps &
  GameFigureWithQuickAddProps &
  GameHoverEditFigureProps;
