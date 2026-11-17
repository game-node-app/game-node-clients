import { useQuery } from "@tanstack/react-query";
import { DailyService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

/**
 * The weekly challenge among the viewer and the people they follow; array
 * order is the ranking. Session only.
 */
export function useDailyWeeklyRanking() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["daily", "weekly", "ranking", userId ?? null],
    queryFn: () => DailyService.dailyControllerFindWeeklyRankingV1(),
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnMount: true,
  });
}
