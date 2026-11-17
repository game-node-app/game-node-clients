import {
  type InfiniteData,
  type QueryKey,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ApiError,
  type DailyRankingResponseDto,
  DailyService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import type { ExtendedUseInfiniteQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export type DailyRankingPeriod = "today" | "week" | "month" | "all";
export type DailyRankingScope = "all" | "following";

export const DAILY_RANKING_PERIODS: DailyRankingPeriod[] = [
  "today",
  "week",
  "month",
  "all",
];

export interface DailyRankingQuery {
  period: DailyRankingPeriod;
  /** null = overall. */
  mode: DailyMode | null;
  scope: DailyRankingScope;
}

export const DAILY_RANKING_PAGE_SIZE = 20;

export const getInfiniteDailyRankingKey = (
  filters: DailyRankingQuery,
  userId: string | undefined,
) =>
  [
    "daily",
    "ranking",
    "list",
    { period: filters.period, mode: filters.mode, scope: filters.scope },
    userId ?? null,
  ] as const;

/**
 * The ranking for one period/mode/scope, 20 rows per page; the next offset is
 * the number of rows already loaded.
 */
export function useInfiniteDailyRanking(
  filters: DailyRankingQuery,
): ExtendedUseInfiniteQueryResult<DailyRankingResponseDto> {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const queryKey = getInfiniteDailyRankingKey(filters, userId);

  return {
    queryKey: [...queryKey],
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: ["daily", "ranking", "list"],
      });
    },
    ...useInfiniteQuery<
      DailyRankingResponseDto,
      ApiError,
      InfiniteData<DailyRankingResponseDto>,
      QueryKey,
      number
    >({
      queryKey,
      queryFn: ({ pageParam }) =>
        DailyService.dailyControllerFindRankingV1(
          filters.period,
          filters.mode ?? undefined,
          filters.scope,
          pageParam,
          DAILY_RANKING_PAGE_SIZE,
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.pagination.hasNextPage
          ? pages.reduce((count, page) => count + page.data.length, 0)
          : undefined,
      // "following" needs a session; the server answers 401 without one.
      enabled: filters.scope !== "following" || !!userId,
      staleTime: 30_000,
      refetchOnMount: true,
    }),
  };
}
