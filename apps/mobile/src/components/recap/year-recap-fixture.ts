import type {
  Game,
  GamePlatformDto,
  Profile,
  RecapTopGameDto,
  YearRecap as YearRecapDtoRow,
  YearRecapPlayedGameDto,
} from "@repo/wrapper/server";
import type { YearRecap } from "../../../../../packages/ui/src/components/recap/types";

/**
 * Recap fixtures for the Recap page tests. The components only read the
 * contract fields, so the profile/platform/game relations are minimal casts.
 */

export const RECAP_YEAR = 2026;

const PROFILE = {
  userId: "user-1",
  username: "marina",
} as unknown as Profile;

const CREATED_AT = "2026-11-15T04:00:00.000Z";

export function buildGame(id: number, name: string): Game {
  return { id, name } as unknown as Game;
}

export function buildPlatform(
  id: number,
  name: string,
  abbreviation: string,
): GamePlatformDto {
  return {
    id,
    name,
    abbreviation,
    alternative_name: null,
    category: null,
    generation: null,
    checksum: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  } as unknown as GamePlatformDto;
}

export function buildTopGame(
  overrides: Partial<RecapTopGameDto> = {},
): RecapTopGameDto {
  return {
    gameId: 1,
    platformIds: [],
    totalPlaytimeSeconds: 86 * 3_600,
    share: 0.21,
    firstPlayedAt: "2026-03-14",
    finishedAt: null,
    rating: null,
    ...overrides,
  };
}

export function buildPlayedGame({
  gameId,
  platformId,
  platform,
  firstPlayedAt = "2026-03-14",
  finishedAt = null,
  rating = null,
}: {
  gameId: number;
  platformId: number;
  platform: GamePlatformDto;
  firstPlayedAt?: string | null;
  finishedAt?: string | null;
  rating?: number | null;
}): YearRecapPlayedGameDto {
  return {
    id: gameId,
    recapId: 1,
    recap: {} as unknown as YearRecapDtoRow,
    gameId,
    platformId,
    platform,
    game: buildGame(gameId, `Game ${gameId}`),
    totalPlaytimeSeconds: 86 * 3_600,
    percentOfTotalPlaytime: 0.21,
    percentOfTotalPlaytimeFormatted: "21.0",
    firstPlayedAt,
    finishedAt,
    rating,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    deletedAt: null,
  };
}

export function buildYearRecap(overrides: Partial<YearRecap> = {}): YearRecap {
  const base: YearRecap = {
    id: 1,
    year: RECAP_YEAR,
    profile: PROFILE,
    profileUserId: "user-1",
    totalPlayedGames: 12,
    totalPlaytimeSeconds: 412 * 3_600,
    totalAddedGames: 52,
    totalFinishedGames: 14,
    totalDroppedGames: 6,
    isFinal: false,
    dailyPlaytimeSeconds: null,
    communityHighlights: null,
    totalReviewsCreated: 0,
    totalCollectionsCreated: 0,
    totalFollowersGained: 0,
    totalLikesPerformed: 0,
    likesHistoryComplete: true,
    likesCompleteSince: null,
    playedGames: [],
    playedGamesByPlatform: [],
    distributionByGenre: [],
    distributionByMode: [],
    distributionByTheme: [],
    distributionByPlatform: [],
    backlogGrowth: 0,
    calendar: null,
    topGames: [],
    playtimeByPlatform: [],
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    deletedAt: null,
    genres: [],
    themes: [],
    modes: [],
    platforms: [],
  };

  return { ...base, ...overrides };
}

/** One entry per UTC day of the year, with the given indexes filled. */
export function buildDailyPlaytime(
  year: number,
  values: Record<number, number> = {},
): number[] {
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const days = isLeapYear ? 366 : 365;

  return Array.from({ length: days }, (_, index) => values[index] ?? 0);
}
