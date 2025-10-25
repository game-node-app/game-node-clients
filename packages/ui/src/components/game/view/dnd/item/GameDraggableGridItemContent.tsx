import React from "react";
import { GameDraggableItemContentProps, GameFigureImage } from "#@/components";
import { cn } from "#@/util";
import { Group } from "@mantine/core";

const GameDraggableGridItemContent = ({
  game,
  isDragging,
  isOverlay,
  ref,
  ...others
}: GameDraggableItemContentProps) => {
  return (
    <Group
      ref={ref}
      {...others}
      className={cn("min-h-40 w-auto", {
        "opacity-25": isDragging && !isOverlay,
        "z-[99999] scale-110 transition-transform": isOverlay,
      })}
    >
      <GameFigureImage
        game={game}
        linkProps={{
          onClick: (evt) => evt.preventDefault(),
        }}
      />
    </Group>
  );
};

export { GameDraggableGridItemContent };
