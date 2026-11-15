import { RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";
import type { ProfileMetricsSummaryResponseDto } from "@repo/wrapper/server";

/** Accent colors the user can pick; `brand` is the GameNode orange. */
export const RECAP_ACCENTS = {
  brand: RECAP_COLORS.brand,
  teal: "#2DD4A4",
  violet: "#8B7CF6",
  blue: "#4C9AF5",
  gold: "#F2B83B",
  pink: "#F0629A",
} as const;

export type RecapAccent = keyof typeof RECAP_ACCENTS;

/** Figures the user can show in the card's free stat slot. */
export type RecapExtraStat = "finished" | "reviewed" | "started";

export interface RecapCustomization {
  /** Game whose art fills the backdrop; `null` keeps the most played one. */
  backdropGameId: number | null;
  /**
   * How visible the art is over the card's color, from 0 to 1. `null` keeps
   * each template's own default.
   */
  backdropOpacity: number | null;
  accent: RecapAccent;
  extraStat: RecapExtraStat;
  /** Whether the change against the previous period is drawn. Off by default. */
  showComparison: boolean;
}

export const DEFAULT_RECAP_CUSTOMIZATION: RecapCustomization = {
  backdropGameId: null,
  backdropOpacity: null,
  accent: "brand",
  extraStat: "finished",
  showComparison: false,
};

export function getRecapAccent(custom?: RecapCustomization): string {
  return RECAP_ACCENTS[custom?.accent ?? "brand"] ?? RECAP_ACCENTS.brand;
}

/**
 * The game whose art is drawn as the backdrop: the one the user picked when
 * it is still in the ranking, otherwise the most played game.
 */
export function pickBackdropGame<T extends { game?: { id: number } }>(
  ranked: T[],
  custom?: RecapCustomization,
): T["game"] {
  const chosen = custom?.backdropGameId;
  const picked =
    chosen == null
      ? undefined
      : ranked.find((entry) => entry.game?.id === chosen)?.game;

  return picked ?? ranked[0]?.game;
}

/** The art opacity to use: the user's value, or the template's default. */
export function getBackdropOpacity(
  fallback: number,
  custom?: RecapCustomization,
): number {
  const value = custom?.backdropOpacity;
  if (value == null || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

const EXTRA_STAT_LABELS = {
  finished: "mobile.wrapped.card.finished",
  reviewed: "mobile.wrapped.card.reviewed",
  started: "mobile.wrapped.card.started",
} as const;

/** Label key and value of the free stat slot. */
export function getRecapExtraStat(
  summary: Pick<
    ProfileMetricsSummaryResponseDto,
    "finishedInPeriod" | "reviewedInPeriod" | "playedInPeriod"
  >,
  custom?: RecapCustomization,
) {
  const kind = custom?.extraStat ?? DEFAULT_RECAP_CUSTOMIZATION.extraStat;
  const value = {
    finished: summary.finishedInPeriod,
    reviewed: summary.reviewedInPeriod,
    started: summary.playedInPeriod,
  }[kind];

  return { labelKey: EXTRA_STAT_LABELS[kind], value: `${value ?? 0}` };
}
