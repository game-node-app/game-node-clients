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

export interface RecapNodeLayout {
  index: number;
  gameId: number;
  /** Horizontal position in the 100-wide chart viewBox. */
  x: number;
  /** Vertical position in the 60-high chart viewBox. */
  y: number;
  /** Node radius; proportional to the square root of the hours. */
  radius: number;
}

const CHART_WIDTH = 100;
const CHART_HEIGHT = 60;
const CHART_PADDING = 4;
const MIN_RADIUS = 2.2;
const MAX_RADIUS = 6.6;

/**
 * Hero node per top game: x from `firstPlayedAt` (falling back to the middle
 * of the year), y spread so the labels do not collide, radius ∝ √hours.
 */
export function getRecapNodeLayout(
  topGames: readonly RecapTopGameDto[],
  year: number,
): RecapNodeLayout[] {
  const maxSeconds = Math.max(
    1,
    ...topGames.map((topGame) => topGame.totalPlaytimeSeconds),
  );
  const startOfYear = dayjs.utc().year(year).startOf("year");
  const totalDays = getYearDayCount(year);
  const usableWidth = CHART_WIDTH - CHART_PADDING * 2;

  const nodes = topGames.map((topGame, index) => {
    const firstPlayedAt = topGame.firstPlayedAt
      ? dayjs.utc(topGame.firstPlayedAt)
      : null;
    const dayOffset =
      firstPlayedAt && firstPlayedAt.isValid()
        ? firstPlayedAt.diff(startOfYear, "day")
        : Math.floor(totalDays / 2);
    const fraction = Math.min(1, Math.max(0, dayOffset / totalDays));

    return {
      index,
      gameId: topGame.gameId,
      x: CHART_PADDING + fraction * usableWidth,
      // Deterministic scatter inside the plot; overlaps are relaxed below.
      y: CHART_HEIGHT / 2 + Math.sin((index + 1) * 1.7) * 14,
      radius:
        MIN_RADIUS +
        (MAX_RADIUS - MIN_RADIUS) *
          Math.sqrt(topGame.totalPlaytimeSeconds / maxSeconds),
    };
  });

  return relaxRecapNodes(nodes);
}

/** Extra room kept around the nodes that carry a label above them. */
const LABEL_ROOM = 5;
const NODE_GAP = 0.8;
const LABELLED_NODES = 4;

/**
 * Nudges overlapping nodes apart (mostly vertically, so the x axis keeps its
 * month meaning) and keeps them, and the labels of the largest ones, inside
 * the plot. Deterministic: same input, same layout.
 */
function relaxRecapNodes(nodes: RecapNodeLayout[]): RecapNodeLayout[] {
  const result = nodes.map((node) => ({ ...node }));
  const room = (node: RecapNodeLayout) =>
    node.radius + (node.index < LABELLED_NODES ? LABEL_ROOM : NODE_GAP);

  for (let pass = 0; pass < 60; pass++) {
    let moved = false;

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i];
        const b = result[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx * 0.5, dy);
        const minimum = room(a) + room(b);

        if (distance >= minimum) continue;

        moved = true;
        const push = (minimum - distance) / 2 + 0.01;
        const direction =
          distance === 0 ? (j % 2 === 0 ? 1 : -1) : dy / distance;
        a.y -= push * direction;
        b.y += push * direction;
      }
    }

    for (const node of result) {
      node.x = Math.min(
        CHART_WIDTH - CHART_PADDING - node.radius,
        Math.max(CHART_PADDING + node.radius, node.x),
      );
      node.y = Math.min(
        CHART_HEIGHT - CHART_PADDING / 2 - node.radius,
        Math.max(
          node.radius + (node.index < LABELLED_NODES ? LABEL_ROOM : 1),
          node.y,
        ),
      );
    }

    if (!moved) break;
  }

  return result;
}
