import React from "react";
import { Carousel, CarouselProps } from "@mantine/carousel";
import { Game } from "@/wrapper/server";
import GameGridItem from "@/components/game/figure/GameGridItem";
import { Flex, Skeleton, Text } from "@mantine/core";
import CenteredLoading from "@/components/general/CenteredLoading";
import useOnMobile from "@/components/general/hooks/useOnMobile";

interface IGameInfoCarouselProps extends CarouselProps {
    isLoading: boolean;
    isError: boolean;
    games: Game[] | undefined;
}

const buildGamesFigures = (games: Game[] | undefined) => {
    if (games == undefined || games.length === 0) return null;

    return games.map((game, index) => {
        if (index < 40) {
            return (
                <Carousel.Slide key={game.id} className={"w-full h-full"}>
                    <GameGridItem game={game} withQuickAdd={false} />
                </Carousel.Slide>
            );
        }
        return null;
    });
};

const buildSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < 7; i++) {
        skeletons.push(
            <Carousel.Slide key={i} className="w-full h-full">
                <Skeleton height={230} />
            </Carousel.Slide>,
        );
    }

    return skeletons;
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

export default GameInfoCarousel;
