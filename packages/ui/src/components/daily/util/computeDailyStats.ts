export interface DailyStatsResult {
  /** Puzzle day, "YYYY-MM-DD" in America/Sao_Paulo. */
  date: string;
  status: string;
  attempts: number;
  finishedAt?: string | null;
}

export interface DailyStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = wins with i + 1 attempts. */
  distribution: number[];
}

const DAY_MS = 86_400_000;

export const toSaoPauloDate = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    date,
  );

const previousDay = (date: string) =>
  new Date(Date.parse(`${date}T00:00:00Z`) - DAY_MS).toISOString().slice(0, 10);

/**
 * Stats for one mode. Only puzzles finished on their own day count for streaks,
 * so playing the archive can't repair a broken streak.
 */
export function computeDailyStats(
  results: DailyStatsResult[],
  maxAttempts: number,
  today: string,
): DailyStats {
  const finished = results.filter((r) => r.status !== "in_progress");
  const distribution = Array<number>(maxAttempts).fill(0);
  const streakDays = new Map<string, boolean>();

  for (const result of finished) {
    const won = result.status === "won";
    if (won) distribution[result.attempts - 1]++;
    const onTime =
      result.finishedAt != undefined &&
      toSaoPauloDate(new Date(result.finishedAt)) === result.date;
    if (onTime) streakDays.set(result.date, won);
  }

  let maxStreak = 0;
  let run = 0;
  let lastDay: string | undefined;
  for (const day of [...streakDays.keys()].sort()) {
    const won = streakDays.get(day)!;
    run = won ? (lastDay === previousDay(day) ? run + 1 : 1) : 0;
    lastDay = won ? day : undefined;
    maxStreak = Math.max(maxStreak, run);
  }

  // Today still open doesn't break the streak yet.
  let day = streakDays.has(today) ? today : previousDay(today);
  let currentStreak = 0;
  while (streakDays.get(day) === true) {
    currentStreak++;
    day = previousDay(day);
  }

  return {
    played: finished.length,
    wins: finished.filter((r) => r.status === "won").length,
    currentStreak,
    maxStreak,
    distribution,
  };
}

/**
 * Days in a row with at least one mode finished on its day, won or lost.
 * Reuses the per-mode streak by counting each such day as one win.
 */
export function computeDailyPlayStreak(
  results: DailyStatsResult[],
  today: string,
) {
  const playedDays = results
    .filter((r) => r.status !== "in_progress")
    .map((r) => ({ ...r, status: "won", attempts: 1 }));
  return computeDailyStats(playedDays, 1, today).currentStreak;
}
