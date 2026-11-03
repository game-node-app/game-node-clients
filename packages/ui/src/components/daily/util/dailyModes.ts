import { DailyPuzzleDto } from "@repo/wrapper/server";

/** Plain union, since each Daily DTO declares its own `mode` enum. */
export type DailyMode = `${DailyPuzzleDto.mode}`;

export const DAILY_MODES: DailyMode[] = Object.values(DailyPuzzleDto.mode);

export const isDailyMode = (value: unknown): value is DailyMode =>
  DAILY_MODES.includes(value as DailyMode);
