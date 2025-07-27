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
  CollectionEntryEditModal,
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
 * <strong>Important: </strong> hover effects have inconsistent behavior in mobile.
 * @constructor
 */
const GameHoverEditFigure = ({
  withHoverTitle = true,
  game,
  ...others
}: Props) => {
  const [addModalOpened, addModalUtils] = useDisclosure();

  return (
    <Box className={"w-full h-full group"}>
      <GameFigureImage game={game} {...others}>
        <CollectionEntryEditModal
          id={game!.id!}
          opened={addModalOpened}
          onClose={addModalUtils.close}
        />
        <Box
          className={`absolute w-full h-full top-0 transition-opacity ease-in-out duration-300 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100`}
        >
          <Overlay
            gradient={
              "linear-gradient(180deg, rgba(28, 28, 28, 0) 33%, #1C1C1C 100%)"
            }
            opacity={1}
            className={"z-10"}
          />
          <Stack className={"relative h-full w-full p-2 z-10"}>
            <Flex className={"absolute top-1.5 right-1.5"}>
              <ActionIcon
                variant={"default"}
                onClick={addModalUtils.open}
                className={"ms-auto z-20"}
              >
                <IconDots />
              </ActionIcon>
            </Flex>
            <Box className={"h-full w-full"}>
              <Link
                href={game?.href ?? `/game/${game?.id}`}
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
      </GameFigureImage>
    </Box>
  );
};

export { GameHoverEditFigure };
