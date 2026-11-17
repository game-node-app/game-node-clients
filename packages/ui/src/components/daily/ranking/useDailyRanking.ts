import { useQuery } from "@tanstack/react-query";
import { DailyService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type { DailyRankingPeriod } from "#@/components/daily/ranking/useInfiniteDailyRanking";

interface Options {
  period?: DailyRankingPeriod;
  limit?: number;
}

/**
 * The first rows of the overall ranking, for the hub panel.
 */
export function useDailyRanking({ period = "week", limit = 3 }: Options = {}) {
  const userId = useUserId();
  return useQuery({
    queryKey: ["daily", "ranking", "panel", userId ?? null, period, limit],
    queryFn: () =>
      DailyService.dailyControllerFindRankingV1(
        period,
        undefined,
        "all",
        0,
        limit,
      ),
    staleTime: 30_000,
    refetchOnMount: true,
  });
}
