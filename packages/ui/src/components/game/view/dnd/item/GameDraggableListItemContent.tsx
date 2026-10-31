import { GameDraggableItemContentProps, GameFigureImage } from "#@/components";
import { cn } from "#@/util";
import { Box, Group, Text } from "@mantine/core";
import { IconGripHorizontal } from "@tabler/icons-react";

const GameDraggableListItemContent = ({
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
      className={cn("w-full gap-4 bg-paper-2 rounded-lg p-3 h-24", {
        "bg-paper-1": isDragging,
        "opacity-15": isDragging && !isOverlay,
        "z-[99999]": isOverlay,
      })}
    >
      <Box className={"w-11"}>
        <GameFigureImage
          game={game}
          linkProps={{
            onClick: (evt) => evt.preventDefault(),
          }}
        />
      </Box>
      <Text className={"text-white w-48 text-wrap"}>{game.name}</Text>
      <Box className={"ms-auto me-2"}>
        <IconGripHorizontal
          size={20}
          className={cn({
            "text-brand-4": isDragging,
          })}
        />
      </Box>
    </Group>
  );
};

GameDraggableListItemContent.displayName = "GameDraggableListItemContent";

export { GameDraggableListItemContent };