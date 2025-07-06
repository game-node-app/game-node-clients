import React from "react";
import { Box, Flex, Grid, Paper, Skeleton, Stack, Title } from "@mantine/core";
import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { GameInfoDetails } from "#@/components/game/info/GameInfoDetails";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { GameInfoActions } from "#@/components/game/info/GameInfoActions";
import { GameRepositoryFindOneDto } from "@repo/wrapper/server";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { GameInfoImageCarousel } from "#@/components/game/info/carousel/GameInfoImageCarousel";
import { Break } from "#@/components/general/Break";
import { useGame } from "#@/components/game/hooks/useGame";
import { CenteredLoading } from "#@/components";

export const DEFAULT_GAME_INFO_VIEW_DTO: GameRepositoryFindOneDto = {
  relations: {
    cover: true,
    genres: true,
    themes: true,
    gameModes: true,
    artworks: true,
    screenshots: true,
    platforms: true,
  },
};

interface IGameInfoViewProps {
  id: number;
  withActions?: boolean;
}

const GameInfoView = ({ id, withActions = true }: IGameInfoViewProps) => {
  const gameQuery = useGame(id, DEFAULT_GAME_INFO_VIEW_DTO);
  const game = gameQuery.data;

  const onMobile = useOnMobile();

  if (!game) {
    return <CenteredLoading />;
  }

  return (
    <Stack className={"w-full"}>
      <Grid
        columns={12}
        className="justify-center lg:justify-start p-3 lg:ps-3 w-full"
      >
        <Grid.Col span={{ xs: 12, lg: 3 }}>
          <Flex
            wrap={"wrap"}
            justify={"center"}
            align={"start"}
            w={"inherit"}
            h={"inherit"}
          >
            <Box className="w-full lg:w-96">
              <GameFigureImage game={game} imageSize={ImageSize.COVER_BIG_2X} />
            </Box>

            <Break />
            <Title
              ta={"center"}
              size={"h3"}
              className="mx-5 lg:mx-1 mt-4 lg:mt-8"
            >
              {game ? game.name : <Skeleton />}
            </Title>
            <Break />
            {withActions && (
              <GameInfoActions
                game={game}
                wrapperProps={{ className: "mt-4" }}
              />
            )}
          </Flex>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 9 }}>
          <GameInfoDetails game={game} />
        </Grid.Col>
      </Grid>

      <GameInfoImageCarousel
        gameId={game?.id}
        imageSize={ImageSize.SCREENSHOT_BIG}
        carouselProps={{
          withIndicators: !onMobile,
          withControls: !onMobile,
        }}
      />
    </Stack>
  );
};

export { GameInfoView };
