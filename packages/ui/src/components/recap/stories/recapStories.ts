import type { AwardsBallot } from "#@/components/awards/types";
import { findGlobalGOTYCategoryItem } from "#@/components/awards/util/goty";
import type { YearRecap } from "#@/components/recap/types";
import type { VotableAwardsCategoryDto } from "@repo/wrapper/server";

/**
 * The five Recap stories (design §11, `specs/year-recap-stories`).
 *
 * Everything in this file is pure: the order, the data requirement of each
 * story, the `?story=N` resolution and the calendar/date helpers. The screen
 * filters the stories *before* numbering them, so the count always reflects
 * the stories that have data.
 */

/** Story order from the Figma cover index: opening, top game, calendar, community, final card. */
export const RECAP_STORY_IDS = [
  "opening",
  "topGame",
  "calendar",
  "community",
  "final",
] as const;

export type RecapStoryId = (typeof RECAP_STORY_IDS)[number];

/** Number of stories the Home card advertises ("5 stories"); the server has no story list. */
export const RECAP_STORIES_COUNT = RECAP_STORY_IDS.length;

function hasCalendarStoryData(recap: YearRecap): boolean {
  const month = recap.calendar?.topMonth?.month;
  return (
    recap.calendar != null &&
    month != null &&
    month >= 1 &&
    month <= 12 &&
    (recap.dailyPlaytimeSeconds?.length ?? 0) > 0
  );
}

/**
 * Whether a story has the data it requires. A story without them is skipped
 * (spec: "Um story cujos dados obrigatórios faltem SHALL ser pulado").
 *
 * - Opening: playtime and at least one top game.
 * - Top game: a first top game with playtime.
 * - Calendar: the calendar block and the daily array the month grid is drawn from.
 * - Community: the minority highlight, which titles the story.
 * - Final: any playtime; it is the export card and the Home "Baixar card" target.
 */
export function hasRecapStoryData(recap: YearRecap, id: RecapStoryId): boolean {
  switch (id) {
    case "opening":
      return recap.totalPlaytimeSeconds > 0 && recap.topGames.length > 0;
    case "topGame":
      return (
        recap.topGames.length > 0 &&
        (recap.topGames[0]?.totalPlaytimeSeconds ?? 0) > 0
      );
    case "calendar":
      return hasCalendarStoryData(recap);
    case "community":
      return recap.communityHighlights?.minority != null;
    case "final":
      return recap.totalPlaytimeSeconds > 0;
  }
}

/** Stories that can be shown, in design order, before numbering. */
export function getAvailableRecapStoryIds(
  recap: YearRecap | null | undefined,
): RecapStoryId[] {
  if (!recap) return [];

  return RECAP_STORY_IDS.filter((id) => hasRecapStoryData(recap, id));
}

/**
 * Zero-based index of `?story=N`. `N` is one-based and refers to the filtered
 * list; an out-of-range value (the Home "Baixar card" always asks for 5) opens
 * the last story, and anything unparsable opens the first one.
 */
export function resolveRecapStoryIndex(
  storyIds: readonly RecapStoryId[],
  requested: string | number | null | undefined,
): number {
  if (storyIds.length === 0) return 0;

  const parsed =
    typeof requested === "number"
      ? requested
      : Number.parseInt(requested ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;

  return Math.min(Math.floor(parsed), storyIds.length) - 1;
}

export interface RecapGotyProgress {
  /** Nominees of the global GOTY category the user played. */
  played: number;
  /** Nominees of the global GOTY category. */
  total: number;
}

/**
 * "Você jogou {X} dos {Y} indicados a GOTY." for the Awards action of the last
 * story. The global GOTY category is identified by `isGOTY` and joined with
 * the ballot by id; a missing category yields `null` so the action is omitted
 * instead of showing invented numbers.
 */
export function getRecapGotyProgress(
  ballot: AwardsBallot | undefined,
  categories: readonly VotableAwardsCategoryDto[] | undefined,
): RecapGotyProgress | null {
  const ballotCategory = findGlobalGOTYCategoryItem(
    ballot?.categories,
    categories,
    (category) => category.id,
  );
  if (!ballotCategory) return null;

  return {
    played: ballotCategory.playedNomineesCount,
    total: ballotCategory.nominees.length,
  };
}

export interface RecapMonthCell {
  /** Day of the month, 1-based. */
  day: number;
  seconds: number;
  /** Heat level from 0 (no playtime) to 4 (the month's busiest day). */
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RecapMonthGrid {
  /** UTC weekday of the first day, 0 (Sunday) to 6 (Saturday). */
  firstWeekday: number;
  cells: RecapMonthCell[];
  maxSeconds: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getPlaytimeLevel(
  seconds: number,
  maxSeconds: number,
): 0 | 1 | 2 | 3 | 4 {
  if (seconds <= 0 || maxSeconds <= 0) return 0;

  const ratio = seconds / maxSeconds;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

/**
 * One month of the UTC daily array as the story's grid: `firstWeekday` leading
 * blanks and one cell per day. The array is indexed by day of the UTC year
 * (365/366 entries), so the month slice is derived from the year, never from
 * the viewer's time zone.
 */
export function getRecapMonthGrid(
  year: number,
  month: number,
  dailyPlaytimeSeconds: readonly number[] | null | undefined,
): RecapMonthGrid | null {
  if (
    !Number.isFinite(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const yearStart = Date.UTC(year, 0, 1);

  const cells: RecapMonthCell[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayOfYear = Math.round(
      (Date.UTC(year, month - 1, day) - yearStart) / MS_PER_DAY,
    );
    cells.push({
      day,
      seconds: dailyPlaytimeSeconds?.[dayOfYear] ?? 0,
      level: 0,
    });
  }

  const maxSeconds = cells.reduce(
    (max, cell) => Math.max(max, cell.seconds),
    0,
  );
  for (const cell of cells) {
    cell.level = getPlaytimeLevel(cell.seconds, maxSeconds);
  }

  return { firstWeekday, cells, maxSeconds };
}

/** Sunday-based reference used to name a UTC weekday without picking a date in the Recap year. */
const WEEKDAY_REFERENCE_SUNDAY = Date.UTC(2023, 0, 1);

export function capitalizeFirst(value: string): string {
  return value.length > 0
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : value;
}

/** Localized month name of a 1-based month, in UTC ("Março" in pt-BR). */
export function getUtcMonthName(
  year: number,
  month: number,
  locale: string,
  style: "long" | "short" = "long",
): string | null {
  if (
    !Number.isFinite(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  const name = new Intl.DateTimeFormat(locale || "en", {
    month: style,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return capitalizeFirst(name);
}

/** Localized UTC weekday name, 0 (Sunday) to 6 (Saturday). */
export function getUtcWeekdayName(
  weekday: number,
  locale: string,
  style: "long" | "short" = "long",
): string | null {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return null;
  }

  const name = new Intl.DateTimeFormat(locale || "en", {
    weekday: style,
    timeZone: "UTC",
  }).format(new Date(WEEKDAY_REFERENCE_SUNDAY + weekday * MS_PER_DAY));

  return capitalizeFirst(name);
}
