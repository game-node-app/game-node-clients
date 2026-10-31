import { GameDraggableItemProps } from "#@/components";
import { GameDraggableGridItemContent } from "#@/components/game/view/dnd/item/GameDraggableGridItemContent";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

const GameDraggableGridItem = ({ game }: GameDraggableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id!, data: { game } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <GameDraggableGridItemContent
      game={game}
      isDragging={isDragging}
      isOverlay={false}
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    />
  );
};

export { GameDraggableGridItem };