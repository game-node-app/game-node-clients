import { Box, Center, Stack, Text } from "@mantine/core";
import { GameFigureImage, GameInfoTitleFigureProps, ImageSize } from "@repo/ui";

const MobileGameInfoTitleFigure = ({ game }: GameInfoTitleFigureProps) => {
  return (
    <Stack>
      <Center className={"w-full"}>
        <Box className={"w-56"}>
          <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
        </Box>
      </Center>
      <Text className={"text-center text-white font-medium"}>{game.name}</Text>
    </Stack>
  );
};

export { MobileGameInfoTitleFigure };