import type {
  AwardsBallot,
  AwardsEvent,
  AwardsPhase,
} from "#@/components/awards/types";
import type { RecapCurrent, RecapStatus } from "#@/components/recap/types";

/**
 * Season rules of `specs/season-event-entries` (design §3).
 *
 * Every entry is derived from the server-computed `phase` plus the event dates;
 * nothing here looks at the current month. The season end is the only date
 * arithmetic left on the client, and it is applied to instants the server
 * stores in UTC.
 */

/**
 * The Awards season runs through the 31st day after `resultsDate`: with the
 * 2026 calendar (results on 27 Dec) the last day is 27 Jan and 28 Jan is
 * already outside the season (appendix period table).
 */
export const AWARDS_SEASON_DAYS_AFTER_RESULTS = 31;

/**
 * A closed Recap stays in season for 27 days after `closesAt`: 31 Dec + 27
 * days is the same 27 Jan boundary as the Awards season.
 */
export const RECAP_SEASON_DAYS_AFTER_CLOSE = 27;

export type AwardsEntryKind = "nominations" | "voting" | "results";

/** Dock badge of an Awards entry; the Recap "Nova" badge is client-local. */
export type SeasonEventDockBadge = "live" | "new";

export interface AwardsEntry {
  kind: AwardsEntryKind;
  /** Whether the Home section shows a card for this phase. */
  showHomeCard: boolean;
  dockBadge: SeasonEventDockBadge | null;
  /** Screen of the phase; the `/awards/:year` redirect uses the same rule. */
  href: string;
}

export interface RecapEntry {
  kind: "live" | "closed";
  year: number;
}

/** The fields of an Awards event the season rules need. */
export type SeasonAwardsEvent = Pick<
  AwardsEvent,
  "year" | "phase" | "resultsDate"
>;

/** The ballot fields used to hide the card once the ballot is complete. */
export type SeasonAwardsBallot = Pick<
  AwardsBallot,
  "categoriesVoted" | "categoriesTotal"
>;

/** The Recap window fields the season rules need. */
export type SeasonRecapWindow = Pick<
  RecapCurrent,
  "year" | "phase" | "closesAt"
>;

/** `null` means "no session" (visitor); `undefined` means "not loaded yet". */
export type SeasonRecapStatus = Pick<RecapStatus, "isRecapCreated">;

const AWARDS_SCREEN_BY_PHASE: Record<AwardsPhase, string> = {
  upcoming: "nominations",
  nominations: "nominations",
  nominations_closed: "nominations",
  voting: "vote",
  voting_closed: "vote",
  results: "result",
};

/**
 * Screen of an Awards phase (spec: Destino por fase do Awards).
 *
 * `nominations_closed` opens the nominations screen, which lists the
 * categories read-only outside the nomination phase.
 */
export function getAwardsScreenHref(year: number, phase: AwardsPhase): string {
  return `/awards/${year}/${AWARDS_SCREEN_BY_PHASE[phase]}`;
}

function toUtcDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function addUtcDays(value: Date, days: number): Date {
  const next = new Date(value.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function endOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

/**
 * Last instant of the Awards season. The 31st day after `resultsDate` is
 * included in full, so the 2026 event (results on 27 Dec) is in season through
 * 27 Jan and out on 28 Jan.
 */
export function getAwardsSeasonEnd(resultsDate: string | Date): Date {
  return endOfUtcDay(
    addUtcDays(toUtcDate(resultsDate), AWARDS_SEASON_DAYS_AFTER_RESULTS),
  );
}

/**
 * Last instant of a closed Recap season. The 27th day after `closesAt` is
 * included in full (31 Dec + 27 days = through 27 Jan).
 */
export function getRecapSeasonEnd(closesAt: string | Date): Date {
  return endOfUtcDay(
    addUtcDays(toUtcDate(closesAt), RECAP_SEASON_DAYS_AFTER_CLOSE),
  );
}

function isWithinSeason(seasonEnd: Date, now: Date): boolean {
  return now.getTime() <= seasonEnd.getTime();
}

/**
 * Awards entry for the current phase, or `null` when the event has no entry.
 *
 * - `upcoming`: no entry (`events/current` never returns it).
 * - `nominations`: card and "Ao vivo" badge.
 * - `nominations_closed`: dead period; Dock entry without badge, no card.
 * - `voting`: card until the ballot is complete; "Ao vivo" badge.
 * - `voting_closed`: dead period; Dock entry without badge, no card.
 * - `results`: card and "Novo" badge until the end of the season, then `null`.
 *
 * `ballot` is `undefined` for visitors and while it loads: a visitor always
 * sees the voting card (spec: Entradas para visitantes) and a signed-in user
 * sees it until the ballot read reports every category voted. `categories` is
 * only a fallback for events whose ballot does not report `categoriesTotal`.
 */
export function getAwardsEntry(
  event: SeasonAwardsEvent | null | undefined,
  ballot: SeasonAwardsBallot | null | undefined,
  categories: readonly unknown[] | null | undefined,
  now: Date,
): AwardsEntry | null {
  if (!event) {
    return null;
  }

  const year = event.year;

  switch (event.phase) {
    case "upcoming":
      return null;
    case "nominations":
      return {
        kind: "nominations",
        showHomeCard: true,
        dockBadge: "live",
        href: getAwardsScreenHref(year, event.phase),
      };
    case "nominations_closed":
      return {
        kind: "nominations",
        showHomeCard: false,
        dockBadge: null,
        href: getAwardsScreenHref(year, event.phase),
      };
    case "voting": {
      const categoriesTotal =
        ballot?.categoriesTotal || categories?.length || 0;
      const isBallotComplete =
        ballot != null &&
        categoriesTotal > 0 &&
        ballot.categoriesVoted >= categoriesTotal;

      return {
        kind: "voting",
        showHomeCard: !isBallotComplete,
        dockBadge: "live",
        href: getAwardsScreenHref(year, event.phase),
      };
    }
    case "voting_closed":
      return {
        kind: "voting",
        showHomeCard: false,
        dockBadge: null,
        href: getAwardsScreenHref(year, event.phase),
      };
    case "results": {
      if (!isWithinSeason(getAwardsSeasonEnd(event.resultsDate), now)) {
        return null;
      }

      return {
        kind: "results",
        showHomeCard: true,
        dockBadge: "new",
        href: getAwardsScreenHref(year, event.phase),
      };
    }
  }
}

/**
 * Recap entry for the current window, or `null` when there is nothing to show.
 *
 * - `upcoming`: never returned by `recap/current`; no entry.
 * - `live`: a visitor gets the teaser entry, a signed-in user gets it only
 *   after the status reports `isRecapCreated` (no Recap read without it).
 * - `closed`: only a signed-in user with a created Recap, until the end of the
 *   season (27 days after `closesAt`).
 *
 * `status` is `null` for visitors and `undefined` while the status read is in
 * flight; a visitor sees the teaser only in the `live` phase.
 */
export function getRecapEntry(
  window: SeasonRecapWindow | null | undefined,
  status: SeasonRecapStatus | null | undefined,
  now: Date,
): RecapEntry | null {
  if (!window || window.phase === "upcoming") {
    return null;
  }

  if (window.phase === "live") {
    if (status === undefined) {
      return null;
    }

    if (status === null) {
      return { kind: "live", year: window.year };
    }

    return status.isRecapCreated ? { kind: "live", year: window.year } : null;
  }

  if (!status || !status.isRecapCreated) {
    return null;
  }

  if (!isWithinSeason(getRecapSeasonEnd(window.closesAt), now)) {
    return null;
  }

  return { kind: "closed", year: window.year };
}
