import {
    FindStatisticsTrendingGamesDto,
    GameStatisticsPaginatedResponseDto,
    StatisticsService,
} from "@/wrapper/server";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseInfiniteQueryResult } from "@/util/types/ExtendedUseQueryResult";

export type InfiniteQueryTrendingGamesDto = Omit<FindStatisticsTrendingGamesDto, "offset" | "search">;

export function useInfiniteTrendingGames(
    dto: InfiniteQueryTrendingGamesDto,
    enabled = true,
): ExtendedUseInfiniteQueryResult<GameStatisticsPaginatedResponseDto> {
    const limitToUse = dto.limit || 12;
    const queryClient = useQueryClient();
    const queryKey = ["statistics", "trending", "game", "infinite", limitToUse, dto.period, dto.criteria];
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
            getNextPageParam: (previousData, allData, lastPageParam) => {
                if (previousData.pagination != undefined && previousData.pagination.hasNextPage) {
                    return lastPageParam + limitToUse;
                }

                return undefined;
            },
            initialPageParam: 0,
            staleTime: Infinity,
            enabled,
        }),
        queryKey,
        invalidate,
    };
}
