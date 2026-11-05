import type { DailyPlayResponseDto } from "@repo/wrapper/server";

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
}

export function toDailyLocalResult(
  response: DailyPlayResponseDto,
  previous?: DailyLocalResult,
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
  };
}
