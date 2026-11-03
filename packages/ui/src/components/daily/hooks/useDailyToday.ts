import { useQuery } from "@tanstack/react-query";
import { DailyService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

/**
 * Today's puzzles; `result` is only filled for signed-in users.
 */
export function useDailyToday() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["daily", "today", userId],
    queryFn: () => DailyService.dailyControllerFindTodayV1(),
  });
}
