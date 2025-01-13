import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActionIcon, Affix, Skeleton, Stack, Transition } from "@mantine/core";
import { NextPageContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import {
    GameRepositoryFindAllDto,
    GameRepositoryService,
    GameStatisticsPaginatedResponseDto,
    StatisticsService,
} from "@/wrapper/server";
import ExploreScreenFilters from "@/components/explore/ExploreScreenFilters";
import { useIntersection, useWindowScroll } from "@mantine/hooks";
import { useInfiniteTrendingGames } from "@/components/statistics/hooks/useInfiniteTrendingGames";
import { useGames } from "@/components/game/hooks/useGames";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import GameView from "@/components/game/view/GameView";
import { IconArrowUp } from "@tabler/icons-react";
import {
    DEFAULT_EXPLORE_TRENDING_GAMES_DTO,
    exploreScreenUrlQueryToDto,
} from "@/components/explore/utils";
import { jsonDeepEquals } from "@/util/jsonDeepEquals";
import Head from "next/head";
import CenteredLoading from "@/components/general/CenteredLoading";

export const getServerSideProps = async (context: NextPageContext) => {
    const query = context.query;
    const queryDto = exploreScreenUrlQueryToDto(query);
    const queryClient = new QueryClient();
    let gameIds: number[] | undefined = undefined;
    await queryClient.prefetchInfiniteQuery({
        queryKey: [
            "statistics",
            "trending",
            "game",
            "infinite",
            queryDto.limit,
            queryDto.period,
            queryDto.criteria,
        ],
        queryFn: async () => {
            const response =
                await StatisticsService.statisticsControllerFindTrendingGamesV1(
                    queryDto,
                );
            if (response && response.data) {
                gameIds = response.data.map((s) => s.gameId!);
            }
            return response;
        },
        initialPageParam: 0,
    });

    if (gameIds) {
        const useGamesDto: GameRepositoryFindAllDto = {
            gameIds: gameIds,
            relations: {
                cover: true,
            },
        };

        await queryClient.prefetchQuery({
            queryKey: ["game", "all", useGamesDto],
            queryFn: () => {
                return GameRepositoryService.gameRepositoryControllerFindAllByIdsV1(
                    useGamesDto,
                );
            },
        });
    }

    return {
        props: {
            dehydratedState: dehydrate(queryClient),
        },
    };
};

const Index = () => {
    const { ref, entry } = useIntersection({
        threshold: 1,
    });
    const [scroll, scrollTo] = useWindowScroll();
    const [hasLoadedQueryParams, setHasLoadedQueryParams] =
        useState<boolean>(false);
    const [trendingGamesDto, setTrendingGamesDto] = useState(
        DEFAULT_EXPLORE_TRENDING_GAMES_DTO,
    );

    const trendingGamesQuery = useInfiniteTrendingGames(
        trendingGamesDto,
        hasLoadedQueryParams,
    );

    const gamesIds = useMemo(() => {
        if (trendingGamesQuery.isError || trendingGamesQuery.data == undefined)
            return undefined;
        return trendingGamesQuery.data?.pages.flatMap(
            (
                statisticsPaginatedResponse: GameStatisticsPaginatedResponseDto,
            ) => {
                return statisticsPaginatedResponse.data.map(
                    (statistics) => statistics.gameId!,
                );
            },
        );
    }, [trendingGamesQuery.data, trendingGamesQuery.isError]);

    const gamesQuery = useGames(
        {
            gameIds: gamesIds!,
            relations: {
                cover: true,
            },
        },
        true,
    );

    const games = gamesQuery.data;

    const isFetching =
        trendingGamesQuery.isFetching ||
        trendingGamesQuery.isFetchingNextPage ||
        trendingGamesQuery.isPending ||
        trendingGamesQuery.isFetchingPreviousPage ||
        gamesQuery.isFetching;
    const isLoading = trendingGamesQuery.isLoading || gamesQuery.isLoading;
    const isError = trendingGamesQuery.isError || gamesQuery.isError;

    const buildLoadingSkeletons = useCallback(() => {
        return new Array(10).fill(0).map((v, i) => {
            return <Skeleton key={i} className={"w-full h-60 mt-4"} />;
        });
    }, []);

    useEffect(() => {
        const lastElement =
            trendingGamesQuery.data?.pages[
                trendingGamesQuery.data?.pages.length - 1
            ];

        const hasNextPage =
            lastElement != undefined &&
            lastElement.data.length > 0 &&
            lastElement.pagination.hasNextPage;

        const canFetchNextPage = !isFetching && !isLoading && hasNextPage;

        // Minimum amount of time (ms) since document creation for
        // intersection to be considered valid
        const minimumIntersectionTime = 3000;

        if (
            canFetchNextPage &&
            entry?.isIntersecting &&
            entry.time > minimumIntersectionTime
        ) {
            trendingGamesQuery.fetchNextPage({ cancelRefetch: false });
        }
    }, [entry, isFetching, isLoading, trendingGamesQuery]);

    if (isError) {
        return (
            <CenteredErrorMessage
                mt={"2rem"}
                message={
                    "Error while trying to fetch games. Please reload this page."
                }
            />
        );
    }

    return (
        <Stack className={"w-full mb-8"} align={"center"}>
            <Head>
                <title>Explore - GameNode</title>
            </Head>
            <Stack className={"w-full lg:w-10/12 "}>
                <GameView layout={"grid"}>
                    <ExploreScreenFilters
                        hasLoadedQueryParams={hasLoadedQueryParams}
                        onFilterChange={(stateAction) => {
                            setTrendingGamesDto(stateAction);
                            setHasLoadedQueryParams(true);
                            trendingGamesQuery.invalidate();
                        }}
                    />
                    <GameView.Content items={games!}>
                        {(isFetching || isLoading) && buildLoadingSkeletons()}
                    </GameView.Content>
                </GameView>

                <div id={"last-element-ref-tracker"} ref={ref}></div>
            </Stack>
            <Affix position={{ bottom: 20, right: 20 }}>
                <Transition transition="slide-up" mounted={scroll.y > 0}>
                    {(transitionStyles) => (
                        <ActionIcon
                            style={transitionStyles}
                            onClick={() => scrollTo({ y: 0 })}
                            size={"lg"}
                        >
                            <IconArrowUp />
                        </ActionIcon>
                    )}
                </Transition>
            </Affix>
        </Stack>
    );
};

export default Index;
