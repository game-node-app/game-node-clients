import type { GameAchievementExtendedGroup } from "#@/components/game/achievement/hooks/useGameAchievementsV2";
import type { Game, UserPlaytime } from "@repo/wrapper/server";

/** What fills the card behind its content. `transparent` exports a PNG with no backdrop. */
export const GAME_SHARE_BACKGROUNDS = ["art", "plain", "transparent"] as const;
export type GameShareBackground = (typeof GAME_SHARE_BACKGROUNDS)[number];

/** Optional blocks the person can switch on or off ("No card"). */
export const GAME_SHARE_BLOCKS = [
  "rating",
  "playtime",
  "achievements",
  "platforms",
] as const;
export type GameShareBlock = (typeof GAME_SHARE_BLOCKS)[number];

export type GameShareBlocks = Record<GameShareBlock, boolean>;

export const DEFAULT_GAME_SHARE_BLOCKS: GameShareBlocks = {
  rating: true,
  playtime: true,
  achievements: true,
  platforms: true,
};

export interface GameShareAchievementProgress {
  obtained: number;
  total: number;
}

/**
 * Everything the card can show. Only the game itself is required: the viewer
 * may be signed out, may not own the game and may not have reviewed it, so
 * every personal field is `null` (or empty) when there is nothing to show.
 */
export interface GameShareData {
  game: Game | undefined;
  name: string;
  /** "Arkane Studios, 2016": developer and release year, whichever exist. */
  credit: string | null;
  /** "@username" of the signed-in viewer. */
  handle: string | null;
  /** 0–5, in steps of 0.5. */
  rating: number | null;
  playtimeHours: number | null;
  achievements: GameShareAchievementProgress | null;
  platformIcons: string[];
  /** Localized library status of the viewer's own entry. */
  statusLabel: string | null;
}

/** Which blocks have data, regardless of whether they are switched on. */
export function getAvailableBlocks(data: GameShareData): GameShareBlocks {
  return {
    rating: data.rating != null,
    playtime: data.playtimeHours != null,
    achievements: data.achievements != null,
    platforms: data.platformIcons.length > 0,
  };
}

/** Blocks that are both switched on and have data; these are what the card draws. */
export function getVisibleBlocks(
  data: GameShareData,
  enabled: GameShareBlocks,
): GameShareBlocks {
  const available = getAvailableBlocks(data);

  return {
    rating: enabled.rating && available.rating,
    playtime: enabled.playtime && available.playtime,
    achievements: enabled.achievements && available.achievements,
    platforms: enabled.platforms && available.platforms,
  };
}

export function roundRatingToHalf(rating: number): number {
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, Math.round(rating * 2) / 2));
}

export interface RatingStars {
  full: number;
  half: boolean;
  empty: number;
}

/** Splits a rating into five star slots: full, one optional half, and empty. */
export function getRatingStars(rating: number): RatingStars {
  const rounded = roundRatingToHalf(rating);
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5;

  return { full, half, empty: 5 - full - (half ? 1 : 0) };
}

/** "4,5" in Portuguese, "4.5" in English. */
export function formatShareRating(rating: number, locale: string): string {
  const rounded = roundRatingToHalf(rating);

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(rounded);
  } catch {
    return rounded.toFixed(1);
  }
}

/** Whole hours across every playtime source; `null` when there is nothing played. */
export function getPlaytimeHours(
  entries:
    | readonly Pick<UserPlaytime, "totalPlaytimeSeconds">[]
    | null
    | undefined,
): number | null {
  if (!entries || entries.length === 0) return null;

  const totalSeconds = entries.reduce(
    (sum, entry) => sum + (entry.totalPlaytimeSeconds ?? 0),
    0,
  );

  return totalSeconds > 0 ? Math.ceil(totalSeconds / 3600) : null;
}

/**
 * Progress of the achievement source the person got furthest in. Sources with
 * nothing obtained are ignored; `null` when there is no such source.
 */
export function pickAchievementProgress(
  groups:
    | readonly Pick<GameAchievementExtendedGroup, "achievements">[]
    | null
    | undefined,
): GameShareAchievementProgress | null {
  let best: GameShareAchievementProgress | null = null;

  for (const group of groups ?? []) {
    const total = group.achievements.length;
    const obtained = group.achievements.filter(
      (achievement) => achievement.isObtained,
    ).length;
    if (total === 0 || obtained === 0) continue;

    const ratio = obtained / total;
    const bestRatio = best ? best.obtained / best.total : -1;
    if (ratio > bestRatio || (ratio === bestRatio && total > best!.total)) {
      best = { obtained, total };
    }
  }

  return best;
}

/** "Arkane Studios, 2016": the developer and the release year, whichever exist. */
export function getGameCredit(game: Game | undefined | null): string | null {
  if (!game) return null;

  const developer = game.involvedCompanies?.find(
    (involved) => involved.developer,
  )?.company?.name;

  const releaseDate = game.firstReleaseDate
    ? new Date(game.firstReleaseDate)
    : undefined;
  const year =
    releaseDate && !Number.isNaN(releaseDate.getTime())
      ? String(releaseDate.getUTCFullYear())
      : undefined;

  const parts = [developer, year].filter((part): part is string => !!part);
  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Long names shrink in steps so they stay inside the card instead of pushing
 * the other blocks out of it.
 */
export function getTitleScale(name: string): number {
  if (name.length > 48) return 0.62;
  if (name.length > 30) return 0.8;
  return 1;
}
