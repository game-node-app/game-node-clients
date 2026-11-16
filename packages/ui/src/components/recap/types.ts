import type {
  RecapCurrentDto,
  RecapStatusDto,
  YearRecapDto,
} from "@repo/wrapper/server";

/**
 * Trusted Recap shapes for the 2026 page and stories.
 *
 * The generated wrapper emits `phase` and `YearRecapDto.communityHighlights`
 * as `Record<string, any>`. The hooks narrow those values at runtime and expose
 * the shapes below; screens never cast and never infer a phase from dates.
 */

export const RECAP_PHASES = ["upcoming", "live", "closed"] as const;

export type RecapPhase = (typeof RECAP_PHASES)[number];

export function isRecapPhase(value: unknown): value is RecapPhase {
  return (
    typeof value === "string" &&
    (RECAP_PHASES as readonly string[]).includes(value)
  );
}

export type RecapCurrent = Omit<RecapCurrentDto, "phase"> & {
  phase: RecapPhase;
};

export type RecapStatus = Omit<RecapStatusDto, "phase"> & {
  phase: RecapPhase;
};

export interface RecapCommunityHighlight {
  gameId: number;
  /** The user's rating, 0–5. */
  userRating: number;
  /** Community average, 0–5. */
  communityAverage: number;
  reviewCount: number;
  /** 0–1 share of other reviewers at or beyond the user's rating. */
  beyondShare: number;
  sameRangeCount: number;
}

export interface RecapCommunityHighlights {
  minority: RecapCommunityHighlight | null;
  inTune: RecapCommunityHighlight | null;
}

export type YearRecap = Omit<YearRecapDto, "communityHighlights"> & {
  communityHighlights: RecapCommunityHighlights | null;
};

export interface RecapGoalVariables {
  /** Integer from 1 to 999. */
  target: number;
}

function toRecapPhase(value: unknown): RecapPhase {
  if (!isRecapPhase(value)) {
    throw new Error(`Unexpected Recap contract phase: ${String(value)}`);
  }
  return value;
}

export function toRecapCurrent(raw: RecapCurrentDto): RecapCurrent {
  return { ...raw, phase: toRecapPhase(raw.phase) };
}

export function toRecapStatus(
  raw: Pick<RecapStatusDto, "isRecapCreated" | "isRecapEligible"> & {
    phase: unknown;
  },
): RecapStatus {
  return {
    isRecapCreated: raw.isRecapCreated,
    isRecapEligible: raw.isRecapEligible,
    phase: toRecapPhase(raw.phase),
  };
}

function toRecapCommunityHighlight(
  raw: unknown,
): RecapCommunityHighlight | null {
  if (!raw || typeof raw !== "object") return null;

  const value = raw as Record<string, unknown>;
  if (
    typeof value.gameId !== "number" ||
    typeof value.userRating !== "number" ||
    typeof value.communityAverage !== "number" ||
    typeof value.reviewCount !== "number" ||
    typeof value.beyondShare !== "number" ||
    typeof value.sameRangeCount !== "number"
  ) {
    return null;
  }

  return {
    gameId: value.gameId,
    userRating: value.userRating,
    communityAverage: value.communityAverage,
    reviewCount: value.reviewCount,
    beyondShare: value.beyondShare,
    sameRangeCount: value.sameRangeCount,
  };
}

export function toRecapCommunityHighlights(
  raw: unknown,
): RecapCommunityHighlights | null {
  if (!raw || typeof raw !== "object") return null;

  const value = raw as Record<string, unknown>;

  return {
    minority: toRecapCommunityHighlight(value.minority),
    inTune: toRecapCommunityHighlight(value.inTune),
  };
}

export function toYearRecap(raw: YearRecapDto): YearRecap {
  return {
    ...raw,
    communityHighlights: toRecapCommunityHighlights(raw.communityHighlights),
  };
}
