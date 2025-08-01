import React from "react";
import { Carousel, CarouselProps } from "@mantine/carousel";
import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { Flex, Text } from "@mantine/core";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { TGameOrSearchGame } from "#@/components";

interface IGameInfoCarouselProps extends CarouselProps {
  isLoading: boolean;
  isError: boolean;
  games: TGameOrSearchGame[] | undefined;
}

const buildGamesFigures = (games: TGameOrSearchGame[] | undefined) => {
  if (games == undefined || games.length === 0) return null;

  return games.map((game, index) => {
    if (index < 40) {
      return (
        <Carousel.Slide key={game.id} className={"w-full h-full"}>
          <GameGridItem
            game={game}
            figureProps={{
              withHoverTitle: false,
            }}
          />
        </Carousel.Slide>
      );
    }
    return null;
  });
};

const buildErrorView = () => {
  return (
    <Flex>
      <Text>No entry found.</Text>
    </Flex>
  );
};

const GameInfoCarousel = ({
  games,
  isLoading,
  isError,
  ...others
}: IGameInfoCarouselProps) => {
  const onMobile = useOnMobile();

  if (isError) {
    return buildErrorView();
  }

  if ((!isLoading && games == undefined) || games?.length === 0) {
    return buildErrorView();
  }

  return (
    <Carousel
      slideSize={{
        base: "65%",
        lg: "15%",
      }}
      height={"fit-content"}
      align="start"
      slideGap={{
        base: "xs",
        lg: "md",
      }}
      withControls={!onMobile}
      dragFree
      {...others}
    >
      {isLoading ? <CenteredLoading /> : buildGamesFigures(games)}
    </Carousel>
  );
};

export { GameInfoCarousel };
