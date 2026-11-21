import { RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";
import type { ProfileMetricsSummaryResponseDto } from "@repo/wrapper/server";

/** Accent colors the user can pick; `brand` is the GameNode orange. */
export const RECAP_ACCENTS = {
  brand: RECAP_COLORS.brand,
  teal: "#2DD4A4", // theme-exempt: recap card accent artwork
  violet: "#8B7CF6", // theme-exempt: recap card accent artwork
  blue: "#4C9AF5", // theme-exempt: recap card accent artwork
  gold: "#F2B83B", // theme-exempt: recap card accent artwork
  pink: "#F0629A", // theme-exempt: recap card accent artwork
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
  /**
   * Official image of the backdrop game to draw (one of
   * `getRecapBackdropImages`); `null` keeps the automatic one.
   */
  backdropImageUrl: string | null;
  /**
   * Blur of the art, in pixels from 0 to 100. `null` keeps each template's
   * own default.
   */
  backdropBlur: number | null;
  accent: RecapAccent;
  extraStat: RecapExtraStat;
  /** Whether the change against the previous period is drawn. Off by default. */
  showComparison: boolean;
}

/** Art opacity each template uses until the user moves the slider. */
export const RECAP_BACKDROP_OPACITY = {
  poster: 0.9,
  dash: 0.9,
  bento: 0.85,
  aura: 0.4,
  summary: 0.8,
} as const;

/** Blur of the art, in pixels, each template uses until the user moves the slider. */
export const RECAP_BACKDROP_BLUR = {
  poster: 35,
  dash: 35,
  bento: 50,
  aura: 60,
  summary: 80,
} as const;

/** Largest blur the user can pick, in pixels. */
export const RECAP_BACKDROP_BLUR_MAX = 100;

/** The blur to use, in pixels: the user's value, or the template's default. */
export function getBackdropBlur(
  fallback: number,
  custom?: RecapCustomization,
): number {
  const value = custom?.backdropBlur;
  if (value == null || !Number.isFinite(value)) return fallback;
  return Math.min(RECAP_BACKDROP_BLUR_MAX, Math.max(0, Math.round(value)));
}

/**
 * How dark the overlay over a photo or clip is until the user moves the
 * slider, from 0 to 1. It keeps the text readable on any media.
 */
export const RECAP_OVERLAY_DEFAULT_OPACITY = 0.5;

export const DEFAULT_RECAP_CUSTOMIZATION: RecapCustomization = {
  backdropGameId: null,
  backdropOpacity: null,
  backdropImageUrl: null,
  backdropBlur: null,
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
