import React from "react";
import { Game } from "@repo/wrapper/server";
import { DraggableProvided } from "@hello-pangea/dnd";
import { Box, Group, Text } from "@mantine/core";
import { GameFigureImage } from "#@/components";
import { IconClock, IconGripHorizontal } from "@tabler/icons-react";
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
  /* eslint-disable-next-line react-hooks/refs */
  return (
    <Group
      className={cn("w-full gap-4 bg-paper-2 rounded-lg p-3", {
        "bg-paper-1": isDragging,
      })}
      /* eslint-disable-next-line react-hooks/refs */
      ref={provided.innerRef}
      /* eslint-disable-next-line react-hooks/refs */
      {...provided.draggableProps}
      /* eslint-disable-next-line react-hooks/refs */
      {...provided.dragHandleProps}
    >
      <Box className={"w-11"}>
        <GameFigureImage game={game} />
      </Box>
      <Text className={"text-white w-48 text-wrap"}>{game.name}</Text>
      <Box className={"ms-auto me-2"}>
        {isPending ? (
          <IconClock size={20} className={isPending && "text-yellow-300"} />
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
