import React, { useState } from "react";
import {
  ActionIcon,
  Box,
  Flex,
  Overlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  CollectionEntryAddOrUpdateModal,
  GameFigureImage,
  IGameFigureProps,
} from "#@/components";
import { Link } from "#@/util";
import { IconDots } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

interface Props extends IGameFigureProps {
  withHoverTitle: boolean;
}

/**
 * Game Figure which features a hover effect that shows
 * an edit button and the game's title if desired.
 * <strong>Important: </strong> hover effects have inconsistent behaviour in mobile.
 * @constructor
 */
const GameHoverEditFigure = ({
  withHoverTitle = true,
  game,
  ...others
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addModalOpened, addModalUtils] = useDisclosure();

  return (
    <Box
      className={"w-full h-full"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GameFigureImage game={game} {...others}>
        <CollectionEntryAddOrUpdateModal
          id={game!.id!}
          opened={addModalOpened}
          onClose={addModalUtils.close}
        />
        {isHovered && (
          <Box className={"absolute w-full h-full top-0"}>
            <Overlay
              gradient={
                "linear-gradient(180deg, rgba(28, 28, 28, 0) 33%, #1C1C1C 100%)"
              }
              opacity={1}
              className={"z-10"}
            />
            <Stack className={"relative h-full w-full p-2 z-20"}>
              <Flex className={"w-full justify-end"}>
                <ActionIcon variant={"default"} onClick={addModalUtils.open}>
                  <IconDots />
                </ActionIcon>
              </Flex>
              <Box className={"h-full w-full"}>
                <Link
                  href={`/game/${game?.id}`}
                  className={"h-full w-full flex flex-col"}
                >
                  {withHoverTitle && (
                    <Text className={"font-bold text-lg mt-auto"}>
                      {game?.name}
                    </Text>
                  )}
                </Link>
              </Box>
            </Stack>
          </Box>
        )}
      </GameFigureImage>
    </Box>
  );
};

export { GameHoverEditFigure };
