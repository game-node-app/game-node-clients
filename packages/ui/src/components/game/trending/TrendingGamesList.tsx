import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { useGames } from "#@/components/game/hooks/useGames";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { SimpleGrid, Skeleton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";
import { StatisticsRankingsRequestDto } from "../../../../../wrapper/src/server";
import period = StatisticsRankingsRequestDto.period;

export const DEFAULT_SEARCH_TRENDING_GAMES_DTO = {
  offset: 0,
  limit: 6,
  criteria: {},
  period: period.MONTH,
};

const TrendingGamesList = () => {
  const { t } = useTranslation();
  const trendingGames = useTrendingGames(DEFAULT_SEARCH_TRENDING_GAMES_DTO);

  const gamesIds = trendingGames.data?.items
    .map((item) => item.sourceId)
    .filter((id): id is number => typeof id === "number");
  const gamesQuery = useGames({
    gameIds: gamesIds || [],
    relations: {
      cover: true,
    },
  });

  const isLoading = trendingGames.isLoading || gamesQuery.isLoading;

  const isEmpty =
    !isLoading &&
    (gamesQuery.data == undefined || gamesQuery.data.length === 0);

  const elementsSkeletons = useMemo(() => {
    return Array(DEFAULT_SEARCH_TRENDING_GAMES_DTO.limit)
      .fill(0)
      .map((v, i) => {
        return <Skeleton className={"h-36 lg:h-60"} key={i} />;
      });
  }, []);

  return (
    <DetailsBox
      enabled={!isEmpty}
      title={t("home.trendingGames")}
      stackProps={{
        className: "",
      }}
    >
      <SimpleGrid cols={{ base: 3, lg: 6 }} h={"100%"} w={"100%"}>
        {isLoading && elementsSkeletons}
        {gamesIds
          ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
          .filter((game) => game !== undefined)
          .map((game) => {
            return <GameGridItem key={game.id} game={game} />;
          })}
      </SimpleGrid>
    </DetailsBox>
  );
};

export { TrendingGamesList };