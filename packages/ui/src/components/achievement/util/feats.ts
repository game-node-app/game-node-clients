import type { useTranslation } from "@repo/locales";
import type {
  AchievementEventDto,
  AchievementTierV2Dto,
  AchievementV2Dto,
} from "@repo/wrapper/server";

/** An obtained tier with the date it was obtained. Optional while older servers are still deployed. */
export interface FeatObtainedTier {
  level: number;
  obtainedAt: string;
}

/** Progress fields the Feats page reads. `obtainedTiers` is optional for older server responses. */
export interface FeatProgress {
  achievementId: string;
  value: number;
  tier: number;
  nextThreshold: number | null;
  obtainedTiers?: FeatObtainedTier[];
}

export type FeatState = "obtained" | "complete" | "locked" | "secret";

export interface FeatItem {
  achievement: AchievementV2Dto;
  progress?: FeatProgress;
  state: FeatState;
  /** Highest obtained tier, or 1 when the user holds none. */
  displayTier: number;
  /** Next tier to obtain, undefined when every tier is obtained. */
  nextTier?: AchievementTierV2Dto;
  /** Threshold of the next tier, null when every tier is obtained. */
  nextThreshold: number | null;
  /** XP earned from every obtained tier. */
  earnedXp: number;
  isPastEvent: boolean;
}

export interface FeatsSummary {
  /** Feats the user holds at least one tier of. */
  obtainedCount: number;
  /** Visible catalog size: excludes upcoming events and ended-event feats the user missed. */
  total: number;
  /** Sum of the highest obtained tier levels. */
  tiersCount: number;
  /** XP earned from every obtained tier. */
  featXp: number;
}

export interface FeatsEventGroup {
  id: string;
  event: AchievementEventDto;
  /** Every feat of the event. Ended events keep feats the user missed so they can be listed as unavailable. */
  items: FeatItem[];
  isPast: boolean;
  obtainedCount: number;
  /** XP earned from every obtained tier of the event. */
  earnedXp: number;
}

export interface FeatsModel {
  /** Feats shown in the grid. */
  items: FeatItem[];
  summary: FeatsSummary;
  almostThere: FeatItem[];
  /** Rows of the events section: active events and ended events the user obtained a feat from. */
  events: FeatsEventGroup[];
  /** Every ended event, including the ones the user obtained nothing from. */
  pastEvents: FeatsEventGroup[];
}

export interface BuildFeatsModelArgs {
  achievements: readonly AchievementV2Dto[];
  progress: readonly FeatProgress[];
  /** Current timestamp, used to decide whether an event is upcoming, active or past. */
  now: number;
}

type FeatsEventPhase = "active" | "past" | "upcoming";

const getEventPhase = (
  event: AchievementEventDto,
  now: number,
): FeatsEventPhase => {
  const endsAt = Date.parse(event.endsAt);
  if (Number.isFinite(endsAt) && endsAt <= now) return "past";

  const startsAt = Date.parse(event.startsAt);
  if (Number.isFinite(startsAt) && startsAt > now) return "upcoming";

  return "active";
};

const buildFeatItem = (
  achievement: AchievementV2Dto,
  progress: FeatProgress | undefined,
  now: number,
): FeatItem => {
  const tier = progress?.tier ?? 0;
  const nextTier = achievement.tiers.find((it) => it.level === tier + 1);
  const isPastEvent =
    achievement.event != null &&
    getEventPhase(achievement.event, now) === "past";

  let state: FeatState;
  if (achievement.isHidden && tier <= 0) {
    state = "secret";
  } else if (tier <= 0) {
    state = "locked";
  } else if (progress?.nextThreshold == null) {
    state = "complete";
  } else {
    state = "obtained";
  }

  return {
    achievement,
    progress,
    state,
    displayTier: tier > 0 ? tier : 1,
    nextTier,
    nextThreshold:
      state === "complete"
        ? null
        : (progress?.nextThreshold ?? nextTier?.threshold ?? null),
    earnedXp: achievement.tiers
      .filter((it) => it.level <= tier)
      .reduce((sum, it) => sum + it.expReward, 0),
    isPastEvent,
  };
};

/**
 * Derives everything the Feats page renders from the catalog and the user's progress.
 * Upcoming-event feats are excluded everywhere; ended-event feats the user did not obtain
 * are excluded from the grid (and from the total) but kept in `pastEvents`.
 */
export function buildFeatsModel({
  achievements,
  progress,
  now,
}: BuildFeatsModelArgs): FeatsModel {
  const progressById = new Map(progress.map((it) => [it.achievementId, it]));
  const items: FeatItem[] = [];
  const groups = new Map<
    string,
    { event: AchievementEventDto; phase: FeatsEventPhase; items: FeatItem[] }
  >();

  for (const achievement of achievements) {
    const item = buildFeatItem(
      achievement,
      progressById.get(achievement.id),
      now,
    );
    const event = achievement.event;

    if (!event) {
      items.push(item);
      continue;
    }

    const phase = getEventPhase(event, now);
    if (phase === "upcoming") continue;

    const group = groups.get(event.id) ?? {
      event,
      phase,
      items: [],
    };
    group.items.push(item);
    groups.set(event.id, group);

    if (phase === "active" || (item.progress?.tier ?? 0) > 0) {
      items.push(item);
    }
  }

  const allEventGroups: FeatsEventGroup[] = [...groups.values()].map(
    (group) => ({
      id: group.event.id,
      event: group.event,
      items: group.items,
      isPast: group.phase === "past",
      obtainedCount: group.items.filter(
        (item) => (item.progress?.tier ?? 0) > 0,
      ).length,
      earnedXp: group.items.reduce((sum, item) => sum + item.earnedXp, 0),
    }),
  );
  const activeEvents = allEventGroups.filter((group) => !group.isPast);
  const pastEvents = allEventGroups.filter((group) => group.isPast);

  const almostThere = items
    .flatMap((item, index) => {
      if (item.state === "secret" || item.state === "complete") return [];
      if (item.isPastEvent || item.nextTier == null) return [];

      const value = item.progress?.value ?? 0;
      if (value <= 0 || item.nextThreshold == null || item.nextThreshold <= 0)
        return [];

      return [{ item, index, ratio: value / item.nextThreshold }];
    })
    .sort((a, b) => b.ratio - a.ratio || a.index - b.index)
    .slice(0, 3)
    .map((candidate) => candidate.item);

  return {
    items,
    summary: {
      obtainedCount: items.filter((item) => (item.progress?.tier ?? 0) > 0)
        .length,
      total: items.length,
      tiersCount: items.reduce(
        (sum, item) => sum + (item.progress?.tier ?? 0),
        0,
      ),
      featXp: items.reduce((sum, item) => sum + item.earnedXp, 0),
    },
    almostThere,
    events: [
      ...activeEvents,
      ...pastEvents.filter((group) => group.obtainedCount > 0),
    ],
    pastEvents,
  };
}

export type FeatsCategoryFilter = "all" | AchievementV2Dto.category;
export type FeatsStatusFilter = "all" | "obtained" | "locked";

export interface FeatsFilterCriteria {
  /** Category to keep, or "all". */
  category?: FeatsCategoryFilter;
  /** Text matched against name and description, ignoring case and accents. */
  query?: string;
  status?: FeatsStatusFilter;
}

const normalizeSearchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Applies the category, text and status filters together, preserving the model order. */
export function filterFeats(
  items: readonly FeatItem[],
  { category = "all", query = "", status = "all" }: FeatsFilterCriteria = {},
): FeatItem[] {
  const normalizedQuery = normalizeSearchText(query.trim());

  return items.filter((item) => {
    if (category !== "all" && item.achievement.category !== category) {
      return false;
    }

    const tier = item.progress?.tier ?? 0;
    if (status === "obtained" && tier <= 0) return false;
    if (status === "locked" && tier > 0) return false;

    if (!normalizedQuery) return true;

    // Masked secrets have no name or description to search, and must stay hidden.
    if (item.state === "secret") return false;

    return (
      normalizeSearchText(item.achievement.name ?? "").includes(
        normalizedQuery,
      ) ||
      normalizeSearchText(item.achievement.description ?? "").includes(
        normalizedQuery,
      )
    );
  });
}

/** Metric key → i18n key of its unit. Metrics absent from the map are displayed as plain numbers. */
export const FEAT_METRIC_UNIT_KEYS: Readonly<Record<string, string>> = {
  library_games: "achievements.units.games",
  games_finished: "achievements.units.games",
  reviews_written: "achievements.units.reviews",
  followers: "achievements.units.followers",
  comments_written: "achievements.units.comments",
};

export function getFeatMetricUnitKey(
  metric: string | null | undefined,
): string | undefined {
  if (!metric) return undefined;
  return FEAT_METRIC_UNIT_KEYS[metric];
}

export type FeatsTranslator = ReturnType<typeof useTranslation>["t"];

export function formatFeatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale || "en").format(value);
}

export function formatFeatDate(value: string | Date, locale?: string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale || "en", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/** Long date for less dense spots, e.g. "2 de nov. de 2025". */
export function formatFeatLongDate(
  value: string | Date,
  locale?: string,
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale || "en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export interface FormatFeatAmountOptions {
  locale?: string;
  metric?: string | null;
  t: FeatsTranslator;
}

/** Formats a metric amount with its localized number and unit, e.g. "1.000 jogos". */
export function formatFeatAmount(
  value: number,
  { locale, metric, t }: FormatFeatAmountOptions,
): string {
  const formatted = formatFeatNumber(value, locale);
  const unitKey = getFeatMetricUnitKey(metric);
  if (!unitKey) return formatted;

  // The key is resolved from the metric map, so it is not a literal known to i18next's types.
  const translate = t as unknown as (
    key: string,
    options?: { count?: number },
  ) => string;
  return `${formatted} ${translate(unitKey, { count: value })}`;
}
