import React, { useMemo } from "react";
import {
  GameDraggableListItem,
  GameViewLayoutOption,
  TGameOrSearchGame,
} from "#@/components";
import {
  rectSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export interface GameDraggableContentProps {
  /**
   * Rendered items for this specific instance.
   * Multiple instances can be used to render different lists/grids (e.g. move a item from a grid to another).
   * As such, these should only be items pertaining to this instance.
   */
  items: TGameOrSearchGame[];
  layout: GameViewLayoutOption;
}

/**
 * Renders a draggable list/grid of games. <br>
 * @constructor
 */
const GameDraggableContent = ({ items, layout }: GameDraggableContentProps) => {
  const strategy = useMemo(
    () =>
      layout === "list" ? verticalListSortingStrategy : rectSortingStrategy,
    [layout],
  );

  return (
    <SortableContext items={items.map((game) => game.id!)} strategy={strategy}>
      {items.map((game) => (
        <GameDraggableListItem key={game.id} game={game} />
      ))}
    </SortableContext>
  );
};

export { GameDraggableContent };
