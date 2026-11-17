import type { ProfileMetricsTypeDistributionItem } from "@repo/wrapper/server";
import type { RecapTopGameDto } from "@repo/wrapper/server";
import type { YearRecap } from "#@/components/recap/types";
import { formatUtcDate } from "#@/components/events/util/format";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isLeapYear from "dayjs/plugin/isLeapYear";

/**
 * Derivations of the 2026 Recap page (design §10).
 *
 * Everything that maps a day is done with `dayjs.utc`: the server sends
 * `dailyPlaytimeSeconds` as one entry per UTC day of the year, so a viewer in
 * another time zone must still see the square of index N as the N-th UTC day.
 */

dayjs.extend(utc);
dayjs.extend(isLeapYear);

/** Public origin used by the share link; the mobile WebView origin is not public. */
export const RECAP_PUBLIC_ORIGIN = "https://gamenode.app";

export function getRecapShareUrl(year: number, userId: string): string {
  return `${RECAP_PUBLIC_ORIGIN}/recap/${year}/${userId}`;
}

export function getRecapStoriesHref(year: number, userId: string): string {
  return `/recap/${year}/${userId}/stories`;
}

export interface RecapCalendarDay {
  /** Zero-based position in `dailyPlaytimeSeconds`. */
  index: number;
  /** UTC date, `YYYY-MM-DD`. */
  date: string;
  /** UTC weekday, 0 = Sunday. */
  weekday: number;
  /** Zero-based week column of the heatmap. */
  week: number;
  seconds: number;
}

export interface RecapCalendarGrid {
  days: RecapCalendarDay[];
  /** Columns needed by the year; 53 for every 2026-like calendar. */
  weeks: number;
  /** Empty cells before January 1st, to align the weekday rows. */
  offset: number;
}

export function getYearDayCount(year: number): number {
  return dayjs.utc().year(year).isLeapYear() ? 366 : 365;
}

export function buildCalendarGrid(
  year: number,
  dailyPlaytimeSeconds: readonly number[] | null | undefined,
): RecapCalendarGrid {
  const totalDays = getYearDayCount(year);
  const start = dayjs.utc().year(year).startOf("year");
  const offset = start.day();

  const days: RecapCalendarDay[] = Array.from(
    { length: totalDays },
    (_, index) => {
      const date = start.add(index, "day");

      return {
        index,
        date: date.format("YYYY-MM-DD"),
        weekday: date.day(),
        week: Math.floor((offset + index) / 7),
        seconds: dailyPlaytimeSeconds?.[index] ?? 0,
      };
    },
  );

  return {
    days,
    weeks: Math.max(53, Math.ceil((offset + totalDays) / 7)),
    offset,
  };
}

/** Heat levels 0–4, proportional to the busiest day of the year. */
export function getCalendarDayLevel(seconds: number, maxSeconds: number) {
  if (seconds <= 0 || maxSeconds <= 0) return 0;

  return Math.min(4, Math.max(1, Math.ceil((seconds / maxSeconds) * 4)));
}

export function formatUtcMonth(
  year: number,
  month: number,
  locale: string,
): string | null {
  return formatUtcDate(new Date(Date.UTC(year, month - 1, 1)), locale, {
    month: "long",
  });
}

/** Weekday label from the server's 0 = Sunday index, always in UTC. */
export function formatUtcWeekday(
  weekday: number,
  locale: string,
): string | null {
  // 2024-01-07 is a Sunday: adding the index yields the same weekday in UTC.
  return formatUtcDate(new Date(Date.UTC(2024, 0, 7 + weekday)), locale, {
    weekday: "long",
  });
}

export interface RecapPlatformInfo {
  name: string;
  abbreviation: string;
}

/**
 * Platform names by id. `topGames` and `playtimeByPlatform` only carry ids, so
 * the page resolves them from the platform rows of `playedGames`.
 */
export function getRecapPlatformMap(
  recap: YearRecap,
): Map<number, RecapPlatformInfo> {
  const map = new Map<number, RecapPlatformInfo>();

  for (const playedGame of recap.playedGames) {
    const platform = playedGame.platform;
    if (!platform) continue;

    map.set(playedGame.platformId, {
      name: platform.name,
      abbreviation: platform.abbreviation || platform.name,
    });
  }

  return map;
}

export interface RecapDistributionShare {
  name: string;
  count: number;
  /** 0–1 share of the distribution counts. */
  share: number;
}

/**
 * Genre percentages are derived from the library counts: the server returns
 * `count`, not a share (design §10).
 */
export function getRecapDistributionShares(
  items: readonly ProfileMetricsTypeDistributionItem[],
): RecapDistributionShare[] {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total <= 0) return [];

  return items
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.criteriaName,
      count: item.count,
      share: item.count / total,
    }))
    .sort((a, b) => b.count - a.count);
}

export type RecapNodeTier = "primary" | "secondary" | "muted";

export interface RecapNodeLayout {
  /** Position in the playtime order (0 = the most played game). */
  index: number;
  gameId: number;
  /** Horizontal centre, in px of the chart (0 = Jan 1st, `width` = Dec 31st). */
  x: number;
  /** Vertical centre, in px of the chart; more played games sit higher. */
  y: number;
  /** Node radius in px; proportional to the square root of the hours. */
  radius: number;
  /** Visual weight: the top 5 are solid brand, the next 6 lighter, the rest outlined. */
  tier: RecapNodeTier;
}

/** The year-chart geometry of the design (frame `5415:955`, 1200px wide). */
export const RECAP_CHART = {
  designWidth: 1200,
  height: 300,
  plotTop: 44,
  plotBottom: 270,
  monthLabelTop: 282,
  /** Centre of the smallest / largest node. */
  nodeBottom: 241.8,
  nodeTop: 74.3,
  minRadius: 5.5,
  maxRadius: 18.35,
  primaryNodes: 5,
  secondaryNodes: 6,
} as const;

/** Day-of-year fraction (0–1) of an instant, in UTC. */
export function getRecapYearFraction(
  value: string | null | undefined,
  year: number,
): number | null {
  if (!value) return null;
  const date = dayjs.utc(value);
  if (!date.isValid()) return null;
  const start = dayjs.utc().year(year).startOf("year");
  const fraction = date.diff(start, "day", true) / getYearDayCount(year);
  return Math.min(1, Math.max(0, fraction));
}

/**
 * Hero node per top game (design §10): x from `firstPlayedAt` (the middle of
 * the year without it), radius ∝ √hours, and y from the same ratio, so the
 * most played games float to the top and the long tail sits on the baseline.
 * `width` is the rendered chart width; node sizes shrink below the design's
 * 1200px so a phone is not left with a few giant circles.
 */
export function getRecapNodeLayout(
  topGames: readonly RecapTopGameDto[],
  year: number,
  width: number = RECAP_CHART.designWidth,
): RecapNodeLayout[] {
  const maxSeconds = Math.max(
    1,
    ...topGames.map((topGame) => topGame.totalPlaytimeSeconds),
  );
  const scale = Math.min(1, Math.max(0.7, width / RECAP_CHART.designWidth));
  const yRange = RECAP_CHART.nodeBottom - RECAP_CHART.nodeTop;

  return topGames.map((topGame, index) => {
    const ratio = Math.sqrt(
      Math.max(0, topGame.totalPlaytimeSeconds) / maxSeconds,
    );
    const radius =
      (RECAP_CHART.minRadius +
        (RECAP_CHART.maxRadius - RECAP_CHART.minRadius) * ratio) *
      scale;
    const fraction = getRecapYearFraction(topGame.firstPlayedAt, year) ?? 0.5;

    return {
      index,
      gameId: topGame.gameId,
      x: Math.min(width - radius, Math.max(radius, fraction * width)),
      y: RECAP_CHART.nodeBottom - ratio * yRange,
      radius,
      tier:
        index < RECAP_CHART.primaryNodes
          ? "primary"
          : index < RECAP_CHART.primaryNodes + RECAP_CHART.secondaryNodes
            ? "secondary"
            : "muted",
    };
  });
}
