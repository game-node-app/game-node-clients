import { useGames } from "#@/components/game/hooks/useGames";
import {
  TRENDING_HERO_MAX_GAMES,
  TrendingGamesHero,
} from "#@/components/game/trending/TrendingGamesHero";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { Skeleton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
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
      genres: true,
      videos: true,
      artworks: true,
    },
  });

  const isLoading = trendingGames.isLoading || gamesQuery.isLoading;

  const isEmpty =
    !isLoading &&
    (gamesQuery.data == undefined || gamesQuery.data.length === 0);

  const games = (gamesIds ?? [])
    .map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game) => game !== undefined)
    .slice(0, TRENDING_HERO_MAX_GAMES);

  return (
    <DetailsBox
      enabled={!isEmpty}
      title={t("home.trendingGames")}
      stackProps={{
        className: "",
      }}
    >
      {isLoading ? (
        <Skeleton className={"h-[347px] w-full"} radius={20} />
      ) : (
        <TrendingGamesHero games={games} />
      )}
    </DetailsBox>
  );
};

export { TrendingGamesList };
