import { ActionIcon, Affix, Stack, Transition } from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  ExploreView,
  ExploreViewValue,
  gamesResourceOptions,
  getExploreRankingDto,
  getInfiniteTrendingGamesKey,
  getInfiniteTrendingGamesRequest,
  prefetchTrendingShelf,
  useAppExperience,
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
import { useRouter } from "next/router";
import ExploreScreenFilters from "../../components/explore/ExploreScreenFilters";
import {
  exploreUrlQueryToValue,
  exploreValueToUrlQuery,
} from "../../components/explore/utils";
import { OpenGraph } from "../../components/general/OpenGraph";

const prefetchRanking = async (
  queryClient: QueryClient,
  value: ExploreViewValue,
) => {
  const dto = getExploreRankingDto(value);
  const queryKey = getInfiniteTrendingGamesKey(dto);
  await queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      StatisticsService.statisticsControllerFindRankingsV1({
        ...getInfiniteTrendingGamesRequest(dto),
        offset: pageParam,
      }),
    initialPageParam: 0,
  });

  const ranking =
    queryClient.getQueryData<InfiniteData<StatisticsRankingResponseDto>>(
      queryKey,
    );
  const gameIds = [
    ...new Set(
      ranking?.pages[0]?.items
        .map((item) => item.sourceId)
        .filter((id): id is number => typeof id === "number") ?? [],
    ),
  ];
  if (!gameIds.length) return;

  const gamesDto: GameRepositoryFindAllDto = {
    gameIds,
    relations: { cover: true },
  };
  await queryClient.prefetchQuery({
    queryKey: ["game", "all", gamesDto.gameIds, gamesDto.relations],
    queryFn: () =>
      GameRepositoryService.gameRepositoryControllerFindAllByIdsV1(gamesDto),
  });
};

export const getServerSideProps = async (context: NextPageContext) => {
  const value = exploreUrlQueryToValue(context.query);
  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery(gamesResourceOptions("genres")),
    // only what is above the fold: the genre shelves load on the client
    value.criteria
      ? prefetchRanking(queryClient, value)
      : prefetchTrendingShelf(queryClient, value.period),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const experience = useAppExperience();
  const [scroll, scrollTo] = useWindowScroll();
  // the URL is the state, so selections can be shared and "back" undoes them
  const value = exploreUrlQueryToValue(router.query);

  const onChange = (next: ExploreViewValue) => {
    // changing only the period doesn't deserve its own history entry
    const sameSelection =
      JSON.stringify(next.criteria) === JSON.stringify(value.criteria);
    void router[sameSelection ? "replace" : "push"](
      { pathname: router.pathname, query: exploreValueToUrlQuery(next) },
      undefined,
      { shallow: true },
    );
  };

  return (
    <Stack
      className={"w-full mt-3 mb-8"}
      data-xbox-focus-color={experience === "console" ? "true" : undefined}
    >
      <OpenGraph
        title={t("explore.metaTitle")}
        description={t("seo.explore.description")}
      />
      <ExploreView
        value={value}
        onChange={onChange}
        extraFilters={
          <ExploreScreenFilters
            criteria={value.criteria}
            onApply={(criteria) => onChange({ ...value, criteria })}
          />
        }
      />
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
