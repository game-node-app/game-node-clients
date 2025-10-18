import { TGameOrSearchGame } from "#@/components";
import { SortableData } from "@dnd-kit/sortable";
import { GroupProps } from "@mantine/core";
import { RefCallback, RefObject } from "react";

export interface GameSortableItemData extends SortableData {
  game: TGameOrSearchGame;
}

export interface GameDraggableItemContentProps extends GroupProps {
  game: TGameOrSearchGame;
  isDragging: boolean;
  isOverlay: boolean;
  ref?: RefCallback<HTMLDivElement>;
}

export type GameDraggableItemProps = Pick<
  GameDraggableItemContentProps,
  "game"
>;
