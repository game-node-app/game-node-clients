import {
  FindStatisticsTrendingGamesDto,
  GameStatisticsPaginatedResponseDto,
  StatisticsService,
} from "@repo/wrapper/server";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ExtendedUseInfiniteQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export type InfiniteQueryTrendingGamesDto = Omit<
  FindStatisticsTrendingGamesDto,
  "offset" | "search"
>;

export function useInfiniteTrendingGames(
  dto: InfiniteQueryTrendingGamesDto,
  enabled = true,
): ExtendedUseInfiniteQueryResult<GameStatisticsPaginatedResponseDto> {
  const limitToUse = dto.limit || 20;
  const queryClient = useQueryClient();
  const queryKey = [
    "statistics",
    "trending",
    "game",
    "infinite",
    limitToUse,
    dto.period,
    dto.criteria,
  ];
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey,
    });
    queryClient.resetQueries({
      queryKey,
    });
  };

  return {
    ...useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam = 0 }) => {
        return StatisticsService.statisticsControllerFindTrendingGamesV1({
          ...dto,
          offset: pageParam,
        });
      },
      getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
        if (
          lastPage.pagination != undefined &&
          lastPage.pagination.hasNextPage
        ) {
          return lastPageParam + limitToUse;
        }
        return undefined;
      },
      placeholderData: keepPreviousData,
      initialPageParam: 0,
      staleTime: Infinity,
      enabled,
    }),
    queryKey,
    invalidate,
  };
}
