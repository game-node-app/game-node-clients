import { TGameOrSearchGame } from "#@/components";

export interface GameDraggableItemProps {
  game: TGameOrSearchGame;
  isDragging: boolean;
  isOverlay: boolean;
}
