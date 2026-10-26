import {
  StatisticsRankingsRequestDto,
  StatisticsRankingResponseDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseInfiniteQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export type InfiniteQueryTrendingGamesDto = Omit<
  StatisticsRankingsRequestDto,
  "sourceType" | "mode" | "offset"
>;

export const getInfiniteTrendingGamesRequest = (
  dto: InfiniteQueryTrendingGamesDto,
): StatisticsRankingsRequestDto => ({
  ...dto,
  limit: dto.limit ?? 20,
  period: dto.period ?? StatisticsRankingsRequestDto.period.MONTH,
  sourceType: StatisticsRankingsRequestDto.sourceType.GAME,
  mode: StatisticsRankingsRequestDto.mode.POPULAR,
});
export const getInfiniteTrendingGamesKey = (
  dto: InfiniteQueryTrendingGamesDto,
) => [
  "statistics",
  "trending",
  "game",
  "infinite",
  getInfiniteTrendingGamesRequest(dto),
];

export function useInfiniteTrendingGames(
  dto: InfiniteQueryTrendingGamesDto,
  enabled = true,
): ExtendedUseInfiniteQueryResult<StatisticsRankingResponseDto> {
  const queryClient = useQueryClient();
  const request = getInfiniteTrendingGamesRequest(dto);
  const queryKey = getInfiniteTrendingGamesKey(dto);
  const invalidate = () => {
    void queryClient.resetQueries({ queryKey });
  };
  return {
    ...useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) =>
        StatisticsService.statisticsControllerFindRankingsV1({
          ...request,
          offset: pageParam,
        }),
      getNextPageParam: (page) => {
        const next = page.pagination.offset + page.pagination.limit;
        return page.pagination.hasNextPage && next <= 10000 ? next : undefined;
      },
      initialPageParam: 0,
      enabled,
    }),
    queryKey,
    invalidate,
  };
}
