import type {
  AwardsBallotCategoryDto,
  AwardsBallotDto,
  AwardsBallotNomineeDto,
  AwardsEventDto,
  CurrentAwardsEventDto,
} from "@repo/wrapper/server";

/**
 * Trusted Awards shapes for the 2026 screens.
 *
 * The generated wrapper emits several contract unions as `Record<string, any>`
 * (`phase`, nominee `status`, `nominations/me`, the scoreboard). The hooks
 * narrow those values at runtime and expose the shapes below, so screens never
 * cast and never infer a phase from dates.
 */

export const AWARDS_PHASES = [
  "upcoming",
  "nominations",
  "nominations_closed",
  "voting",
  "voting_closed",
  "results",
] as const;

export type AwardsPhase = (typeof AWARDS_PHASES)[number];

export function isAwardsPhase(value: unknown): value is AwardsPhase {
  return (
    typeof value === "string" &&
    (AWARDS_PHASES as readonly string[]).includes(value)
  );
}

export type AwardsEvent = Omit<AwardsEventDto, "phase"> & {
  phase: AwardsPhase;
};

export type CurrentAwardsEvent = Omit<CurrentAwardsEventDto, "phase"> & {
  phase: AwardsPhase;
};

export const AWARDS_NOMINEE_STATUSES = [
  "played",
  "planned",
  "not_played",
] as const;

export type AwardsNomineeStatus = (typeof AWARDS_NOMINEE_STATUSES)[number];

export function isAwardsNomineeStatus(
  value: unknown,
): value is AwardsNomineeStatus {
  return (
    typeof value === "string" &&
    (AWARDS_NOMINEE_STATUSES as readonly string[]).includes(value)
  );
}

export type AwardsBallotNominee = Omit<AwardsBallotNomineeDto, "status"> & {
  status: AwardsNomineeStatus;
};

export type AwardsBallotCategory = Omit<AwardsBallotCategoryDto, "nominees"> & {
  nominees: AwardsBallotNominee[];
};

export type AwardsBallot = Omit<AwardsBallotDto, "phase" | "categories"> & {
  phase: AwardsPhase;
  categories: AwardsBallotCategory[];
};

/** One row of `GET /v1/awards/:eventId/nominations/me`. */
export interface AwardsMyNominations {
  categoryId: number;
  gameIds: number[];
}

export type AwardsScoreboardOutcome = "hit" | "miss" | "not_voted";

export interface AwardsScoreboardTotals {
  hits: number;
  voted: number;
  scorable: number;
}

export interface AwardsScoreboardCategory {
  categoryId: number;
  votedGameId: number | null;
  winningGameId: number | null;
  outcome: AwardsScoreboardOutcome;
}

export interface AwardsScoreboardPersonalGOTY {
  gameId: number;
  otherUsersCount: number;
}

export interface AwardsScoreboard {
  totals: AwardsScoreboardTotals;
  categories: AwardsScoreboardCategory[];
  personalGOTY: AwardsScoreboardPersonalGOTY | null;
}

export interface AwardsVoteVariables {
  categoryId: number;
  gameId: number;
}

export interface AwardsNominationsVariables {
  categoryId: number;
  /** 0 to 3 distinct game ids; an empty array clears the category. */
  gameIds: number[];
}

function malformed(field: string, value: unknown): Error {
  return new Error(
    `Unexpected Awards contract value for "${field}": ${String(value)}`,
  );
}

function narrowAwardsPhase(value: unknown, field: string): AwardsPhase {
  if (!isAwardsPhase(value)) throw malformed(field, value);
  return value;
}

function narrowNomineeStatus(value: unknown): AwardsNomineeStatus {
  if (!isAwardsNomineeStatus(value)) throw malformed("nominee.status", value);
  return value;
}

export function toAwardsEvent(raw: AwardsEventDto): AwardsEvent {
  return { ...raw, phase: narrowAwardsPhase(raw.phase, "phase") };
}

export function toCurrentAwardsEvent(
  raw: CurrentAwardsEventDto,
): CurrentAwardsEvent {
  return { ...raw, phase: narrowAwardsPhase(raw.phase, "phase") };
}

function toAwardsBallotNominee(
  raw: AwardsBallotNomineeDto,
): AwardsBallotNominee {
  return { ...raw, status: narrowNomineeStatus(raw.status) };
}

export function toAwardsBallot(raw: AwardsBallotDto): AwardsBallot {
  return {
    ...raw,
    phase: narrowAwardsPhase(raw.phase, "phase"),
    categories: (raw.categories ?? []).map((category) => ({
      ...category,
      nominees: (category.nominees ?? []).map(toAwardsBallotNominee),
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/** `nominations/me` is generated as `Array<Record<string, any>>`. */
export function toAwardsMyNominations(
  raw: Array<Record<string, unknown>>,
): AwardsMyNominations[] {
  return (raw ?? []).map((row) => ({
    categoryId: Number(row.categoryId),
    gameIds: Array.isArray(row.gameIds)
      ? row.gameIds.map((gameId) => Number(gameId))
      : [],
  }));
}

function narrowScoreboardOutcome(value: unknown): AwardsScoreboardOutcome {
  if (value === "hit" || value === "miss" || value === "not_voted") {
    return value;
  }
  throw malformed("scoreboard.categories[].outcome", value);
}

function narrowNullableGameId(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

/** The scoreboard endpoint is generated as `Record<string, any>`. */
export function toAwardsScoreboard(
  raw: Record<string, unknown>,
): AwardsScoreboard {
  const totals = raw.totals;
  if (
    !isRecord(totals) ||
    typeof totals.hits !== "number" ||
    typeof totals.voted !== "number" ||
    typeof totals.scorable !== "number"
  ) {
    throw malformed("scoreboard.totals", totals);
  }

  const rawCategories = raw.categories;
  if (!Array.isArray(rawCategories)) {
    throw malformed("scoreboard.categories", rawCategories);
  }

  const categories: AwardsScoreboardCategory[] = rawCategories.map((entry) => {
    if (!isRecord(entry)) {
      throw malformed("scoreboard.categories[]", entry);
    }

    return {
      categoryId: Number(entry.categoryId),
      votedGameId: narrowNullableGameId(entry.votedGameId),
      winningGameId: narrowNullableGameId(entry.winningGameId),
      outcome: narrowScoreboardOutcome(entry.outcome),
    };
  });

  const rawPersonalGOTY = raw.personalGOTY;
  let personalGOTY: AwardsScoreboardPersonalGOTY | null = null;

  if (rawPersonalGOTY != null) {
    if (!isRecord(rawPersonalGOTY)) {
      throw malformed("scoreboard.personalGOTY", rawPersonalGOTY);
    }

    personalGOTY = {
      gameId: Number(rawPersonalGOTY.gameId),
      otherUsersCount: Number(rawPersonalGOTY.otherUsersCount),
    };
  }

  return {
    totals: {
      hits: totals.hits,
      voted: totals.voted,
      scorable: totals.scorable,
    },
    categories,
    personalGOTY,
  };
}
