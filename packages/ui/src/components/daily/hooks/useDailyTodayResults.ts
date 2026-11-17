import { useDailyLocalResults } from "#@/components/daily/hooks/useDailyLocalResults";
import { useDailyToday } from "#@/components/daily/hooks/useDailyToday";
import { startedDailyResult } from "#@/components/daily/util/startedDailyResult";
import { isDailyLocalResult } from "#@/components/daily/util/toDailyLocalResult";

/**
 * Today's puzzles with the player's result for each: the account's when signed in, else the device's.
 */
export function useDailyTodayResults() {
  const todayQuery = useDailyToday();
  const [local] = useDailyLocalResults();
  const entries = (todayQuery.data?.puzzles ?? []).map((puzzle) => ({
    puzzle,
    result: startedDailyResult(
      puzzle.result ??
        (isDailyLocalResult(local[puzzle.id]) ? local[puzzle.id] : undefined),
    ),
  }));

  return { todayQuery, entries };
}
