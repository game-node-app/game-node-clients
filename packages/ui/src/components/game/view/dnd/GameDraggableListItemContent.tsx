import React, { forwardRef } from "react";
import { GameDraggableItemProps, GameFigureImage } from "#@/components";
import { Box, Group, GroupProps, Text } from "@mantine/core";
import { cn } from "#@/util";
import { IconGripHorizontal } from "@tabler/icons-react";

type GameDraggableListItemContentProps = GameDraggableItemProps & GroupProps;

const GameDraggableListItemContent = forwardRef<
  HTMLDivElement,
  GameDraggableListItemContentProps
>(
  (
    {
      game,
      isDragging,
      isOverlay,
      ...others
    }: GameDraggableListItemContentProps,
    ref,
  ) => {
    return (
      <Group
        ref={ref}
        {...others}
        className={cn("w-full gap-4 bg-paper-2 rounded-lg p-3 h-24", {
          "bg-paper-1": isDragging,
          "opacity-15": isDragging && !isOverlay,
          "z-[99999]": isOverlay,
        })}
      >
        <Box className={"w-11"}>
          <GameFigureImage game={game} />
        </Box>
        <Text className={"text-white w-48 text-wrap"}>{game.name}</Text>
        <Box className={"ms-auto me-2"}>
          {/*{isPending ? (*/}
          {/*  <IconClock size={20} className={isPending && "text-yellow-300"} />*/}
          {/*) : (*/}
          {/*  <IconGripHorizontal*/}
          {/*    size={20}*/}
          {/*    className={cn({*/}
          {/*      "text-brand-4": false,*/}
          {/*    })}*/}
          {/*  />*/}
          {/*)}*/}
          <IconGripHorizontal
            size={20}
            className={cn({
              "text-brand-4": isDragging,
            })}
          />
        </Box>
      </Group>
    );
  },
);

GameDraggableListItemContent.displayName = "GameDraggableListItemContent";

export { GameDraggableListItemContent };
