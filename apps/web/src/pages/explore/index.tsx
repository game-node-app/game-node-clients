import { ActionIcon, Affix, Stack, Transition } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  CenteredErrorMessage,
  GameView,
  getInfiniteTrendingGamesKey,
  getInfiniteTrendingGamesRequest,
  SimpleInfiniteLoader,
  useGames,
  useInfiniteTrendingGames,
} from "@repo/ui";
import {
  GameRepositoryFindAllDto,
  GameRepositoryService,
  StatisticsRankingResponseDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { IconArrowUp } from "@tabler/icons-react";
import { dehydrate, InfiniteData, QueryClient } from "@tanstack/react-query";
import { NextPageContext } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import ExploreScreenFilters from "../../components/explore/ExploreScreenFilters";
import {
  DEFAULT_EXPLORE_TRENDING_GAMES_DTO,
  exploreScreenUrlQueryToDto,
} from "../../components/explore/utils";

export const getServerSideProps = async (context: NextPageContext) => {
  const query = context.query;
  const queryDto = exploreScreenUrlQueryToDto(query);
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: getInfiniteTrendingGamesKey(queryDto),
    queryFn: async ({ pageParam }) => {
      const response =
        await StatisticsService.statisticsControllerFindRankingsV1({
          ...getInfiniteTrendingGamesRequest(queryDto),
          offset: pageParam,
        });
      return response;
    },
    initialPageParam: 0,
  });

  const ranking = queryClient.getQueryData<
    InfiniteData<StatisticsRankingResponseDto>
  >(getInfiniteTrendingGamesKey(queryDto));
  const gameIds = [
    ...new Set(
      ranking?.pages[0]?.items
        .map((item) => item.sourceId)
        .filter((id): id is number => typeof id === "number") ?? [],
    ),
  ];
  if (gameIds.length) {
    const useGamesDto: GameRepositoryFindAllDto = {
      gameIds: gameIds,
      relations: {
        cover: true,
      },
    };

    await queryClient.prefetchQuery({
      queryKey: ["game", "all", useGamesDto.gameIds, useGamesDto.relations],
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
  const { t } = useTranslation();
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
    return [
      ...new Set(
        trendingGamesQuery.data.pages.flatMap((page) =>
          page.items
            .map((item) => item.sourceId)
            .filter((id): id is number => typeof id === "number"),
        ),
      ),
    ];
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

  const games =
    gamesIds
      ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
      .filter((game) => game !== undefined) ?? [];

  const isFetching =
    trendingGamesQuery.isFetching ||
    trendingGamesQuery.isFetchingNextPage ||
    trendingGamesQuery.isPending ||
    trendingGamesQuery.isFetchingPreviousPage ||
    gamesQuery.isFetching;

  const isLoading = trendingGamesQuery.isLoading || gamesQuery.isLoading;
  const isError = trendingGamesQuery.isError || gamesQuery.isError;

  if (isError) {
    return (
      <CenteredErrorMessage mt={"2rem"} message={t("explore.fetchError")} />
    );
  }

  return (
    <Stack className={"w-full mb-8"} align={"center"}>
      <Head>
        <title>{t("explore.metaTitle")}</title>
      </Head>
      <Stack className={"w-full"}>
        <GameView
          layout={"grid"}
          cols={{
            base: 4,
            lg: 8,
          }}
        >
          <ExploreScreenFilters
            hasLoadedQueryParams={hasLoadedQueryParams}
            onFilterChange={(stateAction) => {
              setTrendingGamesDto(stateAction);
              setHasLoadedQueryParams(true);
            }}
          />
          <GameView.Content items={games}>
            <GameView.LoadingSkeletons
              isVisible={isFetching || isLoading}
              itemCount={games.length}
            />
          </GameView.Content>
        </GameView>

        <SimpleInfiniteLoader
          key={gamesQuery.data?.map((game) => game.id).join(",")}
          fetchNextPage={async () => {
            await trendingGamesQuery.fetchNextPage();
          }}
          isFetching={isFetching}
          hasNextPage={trendingGamesQuery.hasNextPage}
        />
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