import React from "react";
import { GameFigureImage, GameInfoTitleFigureProps } from "@repo/ui";
import { Box, Center, Stack, Text, Title } from "@mantine/core";

const MobileGameInfoTitleFigure = ({ game }: GameInfoTitleFigureProps) => {
  return (
    <Stack>
      <Center className={"w-full"}>
        <Box className={"w-56"}>
          <GameFigureImage game={game} />
        </Box>
      </Center>
      <Text className={"text-center text-white font-medium"}>{game.name}</Text>
    </Stack>
  );
};

export { MobileGameInfoTitleFigure };
