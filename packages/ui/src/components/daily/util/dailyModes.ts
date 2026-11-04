import {
  type Icon,
  IconAdjustments,
  IconCheck,
  IconMinus,
  IconPalette,
  IconPhoto,
  IconTag,
  IconTilde,
  IconX,
} from "@tabler/icons-react";
import { DailyPuzzleDto } from "@repo/wrapper/server";

/** Plain union, since each Daily DTO declares its own `mode` enum. */
export type DailyMode = `${DailyPuzzleDto.mode}`;

export const DAILY_MODES: DailyMode[] = Object.values(DailyPuzzleDto.mode);

export const isDailyMode = (value: unknown): value is DailyMode =>
  DAILY_MODES.includes(value as DailyMode);

export const DAILY_MODE_ICONS: Record<DailyMode, typeof IconPhoto> = {
  cover: IconPhoto,
  artwork: IconPalette,
  keywords: IconTag,
  specs: IconAdjustments,
};

export type DailyDifficulty = "easy" | "medium" | "hard";

/** Fixed per mode by design, not computed from the day's results. */
export const DAILY_MODE_DIFFICULTY: Record<DailyMode, DailyDifficulty> = {
  cover: "easy",
  artwork: "medium",
  keywords: "medium",
  specs: "hard",
};

export const DAILY_DIFFICULTY_COLORS: Record<DailyDifficulty, string> = {
  easy: "teal",
  medium: "yellow",
  hard: "red",
};

/** The one color/icon/label source for guess results, spec matches and puzzle statuses. */
export type DailyResultKind = "correct" | "franchise" | "wrong" | "skipped";

export const DAILY_RESULT_STYLES: Record<
  DailyResultKind,
  { color: string; icon: Icon; labelKey: `daily.results.${DailyResultKind}` }
> = {
  correct: {
    color: "teal",
    icon: IconCheck,
    labelKey: "daily.results.correct",
  },
  franchise: {
    color: "yellow",
    icon: IconTilde,
    labelKey: "daily.results.franchise",
  },
  wrong: { color: "red", icon: IconX, labelKey: "daily.results.wrong" },
  skipped: {
    color: "gray",
    icon: IconMinus,
    labelKey: "daily.results.skipped",
  },
};

/** Specs column matches reuse the guess result styles. */
export const DAILY_MATCH_KIND: Record<
  "match" | "partial" | "none",
  DailyResultKind
> = { match: "correct", partial: "franchise", none: "wrong" };

/** Puzzle statuses reuse the guess result styles; no result means not played. */
export const DAILY_STATUS_KIND: Record<string, DailyResultKind> = {
  won: "correct",
  in_progress: "franchise",
  lost: "wrong",
};
