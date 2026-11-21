import { Break, GameFigureImage, ImageSize } from "#@/components";
import { buildPresenterComponent } from "#@/context";
import { Box, Skeleton, Title } from "@mantine/core";
import { Game } from "@repo/wrapper/server";

export interface GameInfoTitleFigureProps {
  game: Game;
}

const DEFAULT_GameInfoTitleFigure = ({ game }: GameInfoTitleFigureProps) => {
  return (
    <Box className="w-full lg:max-w-72">
      <Box className="w-full">
        <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
      </Box>

      <Break />
      <Title ta={"center"} size={"h3"} className="mx-5 lg:mx-1 mt-4 lg:mt-8">
        {game ? game.name : <Skeleton />}
      </Title>
    </Box>
  );
};

const GameInfoTitleFigure = buildPresenterComponent(
  "GameInfoTitleFigure",
  DEFAULT_GameInfoTitleFigure,
);

export { GameInfoTitleFigure };