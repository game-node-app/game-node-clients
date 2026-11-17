import type { DailyPlayResponseDto } from "@repo/wrapper/server";
import type { DailyMode } from "#@/components/daily/util/dailyModes";

/** The play fields the board reads; daily, weekly and practice responses all fit. */
export type DailyBoardState = Pick<
  DailyPlayResponseDto,
  | "maxAttempts"
  | "attempts"
  | "feedback"
  | "hints"
  | "hintAvailable"
  | "hintAt"
  | "answer"
> & {
  mode: DailyMode;
  status: "in_progress" | "won" | "lost";
};
