import React from "react";
import {
  GameFigureImage,
  IGameFigureImageProps,
  useOnMobile,
} from "#@/components";
import { ActionIcon, Box, Flex, Overlay, Stack } from "@mantine/core";
import { IconDots, IconEdit } from "@tabler/icons-react";

interface AwardsCategoryGameFigureProps extends IGameFigureImageProps {
  onEditClick: () => void;
}

const AwardsCategoryGameFigure = ({
  onEditClick,
  ...others
}: AwardsCategoryGameFigureProps) => {
  const onMobile = useOnMobile();

  return (
    <Box
      className={"w-full h-full group"}
      onClick={() => {
        if (onMobile) {
          onEditClick();
        }
      }}
    >
      <GameFigureImage
        {...others}
        linkProps={{
          onClick: (evt) => evt.preventDefault(),
        }}
      >
        <Box
          className={`hidden lg:block absolute w-full h-full top-0 transition-opacity ease-in-out duration-300 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100`}
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
                onClick={onEditClick}
                className={"ms-auto z-20"}
              >
                <IconEdit size={24} />
              </ActionIcon>
            </Flex>
          </Stack>
        </Box>
      </GameFigureImage>
    </Box>
  );
};

export { AwardsCategoryGameFigure };
