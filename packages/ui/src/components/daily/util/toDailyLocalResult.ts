import type { DailyPlayResponseDto } from "@repo/wrapper/server";

export type DailyPuzzleKind = "daily" | "weekly";

/** A guest's play, kept on the device since the server saves nothing for guests. */
export interface DailyLocalResult {
  puzzleId: number;
  mode: DailyPlayResponseDto.mode;
  number: number;
  date: string;
  guesses: (number | null)[];
  hintAt: number | null;
  status: DailyPlayResponseDto.status;
  attempts: number;
  finishedAt: string | null;
  /** Feedback results, for the share text. */
  results: string[];
  /** Missing on entries saved before weekly challenges existed: those are daily. */
  kind?: DailyPuzzleKind;
}

/** Weekly plays never count in daily stats, streaks or the archive. */
export const isDailyLocalResult = (result: DailyLocalResult | undefined) =>
  result != undefined && result.kind !== "weekly";

/** The device's daily-only results. */
export const dailyLocalResults = (results: Record<number, DailyLocalResult>) =>
  Object.values(results).filter(isDailyLocalResult);

export function toDailyLocalResult(
  response: DailyPlayResponseDto,
  previous?: DailyLocalResult,
  kind: DailyPuzzleKind = "daily",
): DailyLocalResult {
  const finished = response.status !== "in_progress";
  return {
    puzzleId: response.puzzleId,
    mode: response.mode,
    number: response.number,
    date: response.date,
    guesses: response.feedback.map((feedback) => feedback.gameId),
    hintAt: response.hintAt,
    status: response.status,
    attempts: response.attempts,
    // Replaying a finished puzzle keeps its first finish time, which drives the streaks.
    finishedAt: finished
      ? (previous?.finishedAt ?? new Date().toISOString())
      : null,
    results: response.feedback.map((feedback) => feedback.result),
    kind,
  };
}
