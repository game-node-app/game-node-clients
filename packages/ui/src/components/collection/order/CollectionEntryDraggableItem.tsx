import React from "react";
import { Game } from "@repo/wrapper/server";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { Box, Group, Loader, Text } from "@mantine/core";
import { GameFigureImage } from "#@/components";
import { IconGripHorizontal } from "@tabler/icons-react";
import { cn } from "#@/util";

interface Props {
  game: Game;
  provided: DraggableProvided;
  isDragging: boolean;
  isPending: boolean;
}

const CollectionEntryDraggableItem = ({
  game,
  provided,
  isDragging,
  isPending,
}: Props) => {
  return (
    <Group
      className={cn("w-full gap-4 bg-paper-2 rounded-lg p-3", {
        "bg-paper-1": isDragging,
      })}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <Box className={"w-11"}>
        <GameFigureImage game={game} />
      </Box>
      <Text className={"text-white w-48 text-wrap"}>{game.name}</Text>
      <Box className={"ms-auto me-2"}>
        {isPending ? (
          <Loader size={20} />
        ) : (
          <IconGripHorizontal
            size={20}
            className={cn({
              "text-brand-4": isDragging,
            })}
          />
        )}
      </Box>
    </Group>
  );
};

export { CollectionEntryDraggableItem };
