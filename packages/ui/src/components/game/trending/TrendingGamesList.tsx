import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { useGames } from "#@/components/game/hooks/useGames";
import {
  TRENDING_HERO_MAX_GAMES,
  TrendingGamesHero,
} from "#@/components/game/trending/TrendingGamesHero";
import { TrendingGamesError } from "#@/components/game/trending/TrendingGamesError";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { useTrendingGames } from "#@/components/statistics/hooks/useTrendingGames";
import { SimpleGrid, Skeleton, type SimpleGridProps } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { StatisticsRankingsRequestDto } from "../../../../../wrapper/src/server";
import period = StatisticsRankingsRequestDto.period;

export const DEFAULT_SEARCH_TRENDING_GAMES_DTO = {
  offset: 0,
  limit: 6,
  criteria: {},
  period: period.MONTH,
};

const RESPONSIVE_HERO_MAX_GAMES = 15;

const TrendingGamesList = ({
  cols,
  responsiveHero,
}: {
  cols?: SimpleGridProps["cols"];
  responsiveHero?: boolean;
}) => {
  const { t } = useTranslation();
  const expandHero = responsiveHero && !cols;
  const trendingGames = useTrendingGames(
    expandHero
      ? {
          ...DEFAULT_SEARCH_TRENDING_GAMES_DTO,
          limit: RESPONSIVE_HERO_MAX_GAMES,
        }
      : DEFAULT_SEARCH_TRENDING_GAMES_DTO,
  );

  const gamesIds = trendingGames.data?.items
    .map((item) => item.sourceId)
    .filter((id): id is number => typeof id === "number");
  const gamesQuery = useGames({
    gameIds: gamesIds || [],
    relations: {
      cover: true,
      genres: true,
      artworks: true,
      screenshots: true,
    },
  });

  const isLoading = trendingGames.isLoading || gamesQuery.isLoading;

  const hasError = trendingGames.isError || gamesQuery.isError;
  const isEmpty =
    !isLoading &&
    !hasError &&
    (gamesQuery.data == undefined || gamesQuery.data.length === 0);

  const games = (gamesIds ?? [])
    .map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game) => game !== undefined)
    .slice(0, expandHero ? RESPONSIVE_HERO_MAX_GAMES : TRENDING_HERO_MAX_GAMES);

  return (
    <DetailsBox
      enabled={!isEmpty}
      title={t("home.trendingGames")}
      stackProps={{
        className: "",
      }}
    >
      {hasError ? (
        <TrendingGamesError
          retrying={trendingGames.isFetching || gamesQuery.isFetching}
          onRetry={() =>
            trendingGames.isError
              ? trendingGames.refetch()
              : gamesQuery.refetch()
          }
        />
      ) : isLoading ? (
        cols ? (
          <SimpleGrid cols={cols} h={"100%"} w={"100%"}>
            {Array.from(
              { length: DEFAULT_SEARCH_TRENDING_GAMES_DTO.limit },
              (_, index) => (
                <Skeleton key={index} className={"h-36 lg:h-60"} />
              ),
            )}
          </SimpleGrid>
        ) : (
          <Skeleton className={"h-[350px] w-full"} radius={20} />
        )
      ) : cols ? (
        <SimpleGrid cols={cols} h={"100%"} w={"100%"}>
          {games.map((game) => (
            <GameGridItem key={game.id} game={game} />
          ))}
        </SimpleGrid>
      ) : (
        <TrendingGamesHero games={games} responsive={expandHero} />
      )}
    </DetailsBox>
  );
};

export { TrendingGamesList };
