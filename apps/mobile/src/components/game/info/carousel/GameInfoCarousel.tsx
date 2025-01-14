import React, { useCallback } from "react";
import { Carousel, CarouselProps } from "@mantine/carousel";
import { Game } from "@/wrapper/server";
import GameGridItem from "@/components/game/figure/GameGridItem";
import { Skeleton } from "@mantine/core";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";

interface IGameInfoCarouselProps extends Omit<CarouselProps, "slideSize"> {
    isLoading: boolean;
    isError: boolean;
    games: Game[] | undefined;
}

const GameInfoCarousel = ({ games, isLoading, isError, ...others }: IGameInfoCarouselProps) => {
    const buildGamesFigures = useCallback(() => {
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
    }, [games]);

    const buildLoadingSkeletons = useCallback(() => {
        const skeletons = [];
        for (let i = 0; i < 7; i++) {
            skeletons.push(
                <Carousel.Slide key={i} className="w-full h-full">
                    <Skeleton height={190} />
                </Carousel.Slide>,
            );
        }

        return skeletons;
    }, []);

    if (isError) {
        return <CenteredErrorMessage message={"Failed to fetch items. Please try again."} />;
    }

    return (
        <Carousel
            height={"fit-content"}
            align="start"
            slideGap={"xs"}
            withControls={false}
            withIndicators={false}
            dragFree
            {...others}
            slideSize={"45%"}
        >
            {isLoading ? buildLoadingSkeletons() : buildGamesFigures()}
        </Carousel>
    );
};

export default GameInfoCarousel;
