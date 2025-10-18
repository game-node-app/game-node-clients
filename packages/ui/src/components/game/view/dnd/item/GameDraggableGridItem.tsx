import React from "react";
import { GameDraggableItemProps, GameFigureImage } from "#@/components";
import { useSortable } from "@dnd-kit/sortable";
import { Box } from "@mantine/core";
import { CSS } from "@dnd-kit/utilities";
import { GameDraggableGridItemContent } from "#@/components/game/view/dnd/item/GameDraggableGridItemContent";

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
