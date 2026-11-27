import {
  Game,
  GameRepositoryFindAllDto,
  GameRepositoryService,
  StatisticsRankingsRequestDto,
} from "@repo/wrapper/server";
import type { QueryClient } from "@tanstack/react-query";
import { trendingGamesOptions } from "#@/components/statistics/hooks/useTrendingGames";

export const TRENDING_SHELF_LIMIT = 10;

export const TRENDING_SHELF_RELATIONS: GameRepositoryFindAllDto["relations"] = {
  cover: true,
  genres: true,
  artworks: true,
};

export const getTrendingShelfRequest = (
  period: StatisticsRankingsRequestDto.period,
  genreId?: number,
) => ({
  period,
  limit: TRENDING_SHELF_LIMIT,
  offset: 0,
  criteria: genreId === undefined ? {} : { genres: [genreId] },
});

/** SSR prefetch of one shelf: its ranking and the games it draws. */
export const prefetchTrendingShelf = async (
  queryClient: QueryClient,
  period: StatisticsRankingsRequestDto.period,
  genreId?: number,
) => {
  const options = trendingGamesOptions(
    getTrendingShelfRequest(period, genreId),
  );
  await queryClient.prefetchQuery(options);
  const gameIds = queryClient
    .getQueryData(options.queryKey)
    ?.items.flatMap(({ sourceId }) =>
      typeof sourceId === "number" ? [sourceId] : [],
    );
  if (!gameIds?.length) return;

  // same key `useGames` builds for signed-out readers
  await queryClient.prefetchQuery<Game[]>({
    queryKey: ["game", "all", gameIds, TRENDING_SHELF_RELATIONS],
    queryFn: () =>
      GameRepositoryService.gameRepositoryControllerFindAllByIdsV1({
        gameIds,
        relations: TRENDING_SHELF_RELATIONS,
      }),
  });
};
