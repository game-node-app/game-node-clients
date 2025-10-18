import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GameDraggableItemProps } from "#@/components";
import { GameDraggableListItemContent } from "#@/components/game/view/dnd/item/GameDraggableListItemContent";

const GameDraggableListItem = ({ game }: GameDraggableItemProps) => {
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
    <GameDraggableListItemContent
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

export { GameDraggableListItem };
