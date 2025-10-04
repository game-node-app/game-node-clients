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
import { CenteredLoading, GameInfoTitleFigure } from "#@/components";

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
}

const GameInfoView = ({ id }: IGameInfoViewProps) => {
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
        className="justify-center lg:justify-start lg:ps-3 w-full"
      >
        <Grid.Col span={{ xs: 12, lg: 3 }}>
          <Flex
            wrap={"wrap"}
            justify={"center"}
            align={"start"}
            w={"inherit"}
            h={"inherit"}
          >
            <GameInfoTitleFigure game={game} />
            <Break />
            <GameInfoActions game={game} wrapperProps={{ className: "mt-4" }} />
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
