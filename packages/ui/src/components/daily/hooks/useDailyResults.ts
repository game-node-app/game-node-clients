import { useQuery } from "@tanstack/react-query";
import { DailyService } from "@repo/wrapper/server";
import type { DailyMode } from "#@/components/daily/util/dailyModes";
import { useUserId } from "#@/components/auth/hooks/useUserId";

/**
 * The signed-in user's results, for the stats. Guests use `useDailyLocalResults`.
 */
export function useDailyResults(mode?: DailyMode) {
  const userId = useUserId();
  return useQuery({
    queryKey: ["daily", "results", mode, userId],
    queryFn: () => DailyService.dailyControllerFindResultsV1(mode),
    enabled: !!userId,
  });
}
