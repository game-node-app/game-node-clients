import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import {
  formatRecapChange,
  getRecapFigures,
} from "#@/components/wrapped/util/recapFigures";
import { getPlatformShortName } from "#@/components/wrapped/util/recapPlatform";
import {
  getWrappedPersonality,
  type WrappedPersonalityId,
} from "#@/components/wrapped/util/wrappedPersonality";
import type { RecapPeriod } from "#@/components/wrapped/hooks/useRecapSummary";
import type {
  Game,
  ProfileMetricsSummaryResponseDto,
} from "@repo/wrapper/server";

export const WRAPPED_WIDGET_SNAPSHOT_VERSION = 1;
/** The widgets show at most this many games (Top 3). */
export const WRAPPED_WIDGET_MAX_GAMES = 3;

/**
 * What the Android home screen widgets render. Everything user facing is
 * already formatted and translated here, so the native side never formats
 * anything. Keep in sync with `WidgetSnapshot.java`.
 */
export interface WrappedWidgetSnapshot {
  version: typeof WRAPPED_WIDGET_SNAPSHOT_VERSION;
  updatedAt: number;
  /** Period the widgets cover; a tap opens the Wrapped screen on it. */
  period: RecapPeriod;
  username: string;
  avatarUrl: string | null;
  strings: {
    eyebrow: string;
    hoursValue: string;
    hoursCaption: string;
    changeChip: string | null;
    topGameBadge: string;
    top3Title: string;
    /** Flag naming the period the widget covers ("WEEKLY", "MONTHLY", "YEARLY"). */
    periodChip: string;
    posterSubtitle: string;
    yearChip: string;
    posterTagline: string;
    viewRecap: string;
    emptyTitle: string;
    emptyBody: string;
    personalityEyebrow: string;
  };
  /** `null` when the summary has no usable genre or finish data. */
  personality: {
    title: string;
    subtitle: string;
    chip: string | null;
  } | null;
  chips: string[];
  topGames: {
    name: string;
    hoursText: string;
    detail: string;
    coverUrl: string | null;
  }[];
}

/** Translated copy; the callers resolve it with type-checked `t` keys. */
export interface WrappedWidgetLabels {
  eyebrow: string;
  hoursCaption: string;
  topGameBadge: string;
  top3Title: string;
  /** Optional flag naming the period the widget covers. */
  periodChip?: string;
  posterSubtitle: string;
  posterTagline: string;
  yearChip: string;
  viewRecap: string;
  emptyTitle: string;
  emptyBody: string;
  personalityEyebrow: string;
  /** Title and subtitle of a personality, e.g. "Explorer" / "of open worlds". */
  personality: (id: WrappedPersonalityId) => { title: string; subtitle: string };
  /** "78% RPG", from the share of time in the top genre. */
  personalityChip: (percent: number, genre: string) => string;
  /** "+18% vs. previous", from a formatted change such as "+18%". */
  change: (change: string) => string;
  /** "312 h · 25% of your time". */
  detail: (hoursText: string, percent: number) => string;
}

export interface BuildWrappedWidgetSnapshotInput {
  summary: ProfileMetricsSummaryResponseDto;
  /** Period `summary` covers (week, month or year). */
  period: RecapPeriod;
  /** Loaded games for `summary.topGames` (with their cover), in any order. */
  games: Game[];
  username: string;
  avatarUrl?: string | null;
  /** BCP 47 tag used to group thousands ("1.248" in pt-BR, "1,248" in en). */
  language: string;
  labels: WrappedWidgetLabels;
  now?: number;
}

function formatHoursValue(hours: number, language: string) {
  // Small totals keep a decimal ("4.5"); big ones read better as whole hours.
  const digits = hours < 100 ? 1 : 0;
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: digits,
  }).format(digits === 0 ? Math.round(hours) : hours);
}

/**
 * Builds the widget payload, or `null` when nothing was played in the period
 * (the widgets then fall back to their "open the app" state).
 */
export function buildWrappedWidgetSnapshot({
  summary,
  period,
  games,
  username,
  avatarUrl = null,
  language,
  labels,
  now = Date.now(),
}: BuildWrappedWidgetSnapshotInput): WrappedWidgetSnapshot | null {
  const figures = getRecapFigures(summary);
  if (!figures.hasActivity) return null;

  const totalSeconds = summary.current.totalPlaytimeSeconds;
  const topGames = summary.topGames
    .slice(0, WRAPPED_WIDGET_MAX_GAMES)
    .map((top) => {
      const game = games.find((item) => item.id === top.gameId);
      const hoursText = `${formatHoursValue(top.totalPlaytimeSeconds / 3600, language)} h`;
      const percent =
        totalSeconds > 0
          ? Math.min(100, Math.round((top.totalPlaytimeSeconds / totalSeconds) * 100))
          : 0;
      return {
        name: game?.name ?? "",
        hoursText,
        detail: labels.detail(hoursText, percent),
        coverUrl: getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG) ?? null,
      };
    });

  const change =
    figures.changePercent != null
      ? formatRecapChange(figures.changePercent)
      : null;
  const changeChip = change ? labels.change(change) : null;
  const topName = topGames[0]?.name;

  const archetype = getWrappedPersonality(summary);
  const personalityCopy = labels.personality(archetype.id);
  const personality = {
    title: personalityCopy.title,
    subtitle: personalityCopy.subtitle,
    chip:
      archetype.genre != null && archetype.genreSharePercent != null
        ? labels.personalityChip(archetype.genreSharePercent, archetype.genre)
        : null,
  };

  const chips = [
    summary.topGenre?.name,
    getPlatformShortName(summary.topPlatform?.name),
    topName ? `#1 ${topName}` : undefined,
  ].filter((chip): chip is string => !!chip);

  return {
    version: WRAPPED_WIDGET_SNAPSHOT_VERSION,
    updatedAt: now,
    period,
    username,
    avatarUrl,
    strings: {
      eyebrow: labels.eyebrow,
      hoursValue: formatHoursValue(figures.hours, language),
      hoursCaption: labels.hoursCaption,
      changeChip,
      topGameBadge: labels.topGameBadge,
      top3Title: labels.top3Title,
      periodChip: labels.periodChip ?? "",
      posterSubtitle: labels.posterSubtitle,
      yearChip: labels.yearChip,
      posterTagline: changeChip
        ? `${labels.posterTagline} · ${changeChip}`
        : labels.posterTagline,
      viewRecap: labels.viewRecap,
      emptyTitle: labels.emptyTitle,
      emptyBody: labels.emptyBody,
      personalityEyebrow: labels.personalityEyebrow,
    },
    personality,
    chips: chips.slice(0, 3),
    topGames,
  };
}
