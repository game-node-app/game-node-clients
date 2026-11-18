export const DAILY_WIDGET_SNAPSHOT_VERSION = 1;

export type DailyWidgetPuzzleStatus = "won" | "lost" | "in_progress" | "none";

/**
 * What the Android GameNode Daily widget renders. Already translated and
 * formatted; the native side only draws it (plus the countdown, which has to
 * tick on its own). Keep in sync with `DailyWidgetSnapshot.java`.
 */
export interface DailyWidgetSnapshot {
  version: typeof DAILY_WIDGET_SNAPSHOT_VERSION;
  updatedAt: number;
  /** `pending` while the player has not started any of today's puzzles. */
  state: "played" | "pending";
  /** Epoch milliseconds of the next puzzle reset. */
  nextResetAt: number;
  /** One entry per mode, in the order the puzzles came in. */
  puzzles: { status: DailyWidgetPuzzleStatus }[];
  strings: {
    eyebrow: string;
    title: string;
    subtitle: string | null;
    streakChip: string | null;
    cta: string;
    /** `%s` is replaced by the countdown. */
    countdownFormat: string;
    emptyTitle: string;
    emptyBody: string;
  };
}

/** Translated copy; callers resolve it with type-checked `t` keys. */
export interface DailyWidgetLabels {
  eyebrow: string;
  titlePending: string;
  cta: string;
  countdownFormat: string;
  emptyTitle: string;
  emptyBody: string;
  titlePlayed: (won: number, total: number) => string;
  /** "7 days in a row". */
  streak: (days: number) => string;
  /** "7 days", for the short chip. */
  streakChip: (days: number) => string;
}

export interface BuildDailyWidgetSnapshotInput {
  /** Today's puzzles with the player's result for each (account or device). */
  entries: { result?: { status: string } | undefined }[];
  /** Days in a row with at least one puzzle finished; 0 when unknown. */
  streak: number;
  /** ISO instant of the next reset. */
  nextResetAt: string;
  labels: DailyWidgetLabels;
  now?: number;
}

const toStatus = (status: string | undefined): DailyWidgetPuzzleStatus =>
  status === "won" || status === "lost" || status === "in_progress"
    ? status
    : "none";

/**
 * Builds the Daily widget payload, or `null` when there are no puzzles today
 * or the reset instant is unusable (the widget then shows its empty state).
 */
export function buildDailyWidgetSnapshot({
  entries,
  streak,
  nextResetAt,
  labels,
  now = Date.now(),
}: BuildDailyWidgetSnapshotInput): DailyWidgetSnapshot | null {
  const resetAt = Date.parse(nextResetAt);
  if (entries.length === 0 || Number.isNaN(resetAt)) return null;

  const puzzles = entries.map((entry) => ({
    status: toStatus(entry.result?.status),
  }));
  const pending = puzzles.every((puzzle) => puzzle.status === "none");
  const won = puzzles.filter((puzzle) => puzzle.status === "won").length;
  const hasStreak = streak > 0;

  return {
    version: DAILY_WIDGET_SNAPSHOT_VERSION,
    updatedAt: now,
    state: pending ? "pending" : "played",
    nextResetAt: resetAt,
    puzzles,
    strings: {
      eyebrow: labels.eyebrow,
      title: pending
        ? labels.titlePending
        : labels.titlePlayed(won, puzzles.length),
      subtitle: hasStreak ? labels.streak(streak) : null,
      streakChip: hasStreak ? labels.streakChip(streak) : null,
      cta: labels.cta,
      countdownFormat: labels.countdownFormat,
      emptyTitle: labels.emptyTitle,
      emptyBody: labels.emptyBody,
    },
  };
}
