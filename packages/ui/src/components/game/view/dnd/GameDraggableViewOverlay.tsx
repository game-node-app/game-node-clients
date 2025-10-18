import React from "react";
import {
  GameDraggableListItemContent,
  useGameDraggableViewContext,
} from "#@/components";
import { DragOverlay } from "@dnd-kit/core";
import { Portal } from "@mantine/core";
import { GameDraggableGridItemContent } from "#@/components/game/view/dnd/item/GameDraggableGridItemContent";

/**
 * Renders an out-of-bounds version of the current dragged item, which can be moved outside
 * of the current scroll container. This is essential if the game list is scrollable. <br>
 * Should be rendered as a child of {@link GameDraggableView}.
 * @constructor
 */
const GameDraggableViewOverlay = () => {
  const { activeGame, layout } = useGameDraggableViewContext();

  const TargetContent =
    layout === "list"
      ? GameDraggableListItemContent
      : GameDraggableGridItemContent;

  return (
    <Portal>
      <DragOverlay>
        {activeGame && (
          <TargetContent game={activeGame} isDragging={false} isOverlay />
        )}
      </DragOverlay>
    </Portal>
  );
};

export { GameDraggableViewOverlay };
