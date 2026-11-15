import type { YearRecapDto } from "@repo/wrapper/server";

/**
 * Dev-only fake recap, so the recap screens can be validated without real data.
 * Open `/recap/<year>/mock` (web) while running `next dev`. Never active in production builds.
 */
export const MOCK_RECAP_USER_ID = "mock";

export const isMockRecap = (userId: string | undefined) =>
  process.env.NODE_ENV === "development" && userId === MOCK_RECAP_USER_ID;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Real IGDB ids, so the game cards can load covers/artworks from the API.
const GAME_IDS = [1942, 119133, 14593, 26226, 113112, 1020, 7346, 11208];
const PLATFORMS = [
  { id: 6, name: "PC (Microsoft Windows)", iconName: "pc" },
  { id: 167, name: "PlayStation 5", iconName: "ps5" },
  { id: 130, name: "Nintendo Switch", iconName: "switch" },
  { id: 169, name: "Xbox Series X|S", iconName: "xbox" },
];
const GENRES = ["Adventure", "RPG", "Indie", "Platform", "Shooter", "Puzzle"];
const MODES = ["Single player", "Multiplayer", "Co-operative"];
const THEMES = ["Fantasy", "Action", "Science fiction", "Horror", "Open world"];

const distribution = (names: string[]) =>
  names.map((criteriaName, index) => {
    const count = rand(3, 25);
    return {
      criteriaId: index + 1,
      criteriaName,
      count,
      finishedCount: rand(0, count),
    };
  });

export function buildMockRecap(userId: string, year: number): YearRecapDto {
  const games = GAME_IDS.slice(0, rand(4, GAME_IDS.length)).map((gameId) => ({
    gameId,
    seconds: rand(3, 220) * 3600,
  }));
  games.sort((a, b) => b.seconds - a.seconds);
  const totalPlaytimeSeconds = games.reduce((sum, g) => sum + g.seconds, 0);
  const now = new Date().toISOString();

  const playedGames = games.map((g, index) => {
    const platform = PLATFORMS[rand(0, PLATFORMS.length - 1)]!;
    return {
      id: index + 1,
      recapId: 1,
      gameId: g.gameId,
      platformId: platform.id,
      platform,
      totalPlaytimeSeconds: g.seconds,
      percentOfTotalPlaytime: g.seconds / totalPlaytimeSeconds,
      percentOfTotalPlaytimeFormatted: (
        (g.seconds / totalPlaytimeSeconds) *
        100
      ).toFixed(1),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  });

  return {
    id: 1,
    year,
    profileUserId: userId,
    playedGames,
    playedGamesByPlatform: PLATFORMS.map((platform) => ({
      ...platform,
      count: rand(1, 12),
    })),
    distributionByGenre: distribution(GENRES),
    distributionByMode: distribution(MODES),
    distributionByTheme: distribution(THEMES),
    distributionByPlatform: distribution(PLATFORMS.map((p) => p.name)),
    totalPlayedGames: playedGames.length,
    totalPlaytimeSeconds,
    totalAddedGames: rand(10, 120),
    totalReviewsCreated: rand(0, 30),
    totalCollectionsCreated: rand(0, 8),
    totalFollowersGained: rand(0, 60),
    totalLikesPerformed: rand(0, 300),
    likesHistoryComplete: true,
    likesCompleteSince: null,
    genres: [],
    themes: [],
    modes: [],
    platforms: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  } as unknown as YearRecapDto;
}

const PERIOD_DAYS = { week: 7, month: 30, year: 365 } as const;

/** Fake `profileMetricsControllerGetPeriodSummaryV1` response for the Wrapped card. */
export function buildMockRecapSummary(period: keyof typeof PERIOD_DAYS) {
  const days = PERIOD_DAYS[period];
  const games = GAME_IDS.slice(0, 5).map((gameId) => ({
    gameId,
    totalPlaytimeSeconds: rand(1, days * 2) * 1800,
  }));
  games.sort((a, b) => b.totalPlaytimeSeconds - a.totalPlaytimeSeconds);
  const total = games.reduce((sum, g) => sum + g.totalPlaytimeSeconds, 0);
  const genre = GENRES[rand(0, GENRES.length - 1)]!;
  const platform = PLATFORMS[rand(0, PLATFORMS.length - 1)]!;

  return {
    period: {},
    current: { totalPlaytimeSeconds: total, totalGames: games.length },
    previous: {
      totalPlaytimeSeconds: Math.round(total * (0.4 + Math.random())),
      totalGames: rand(1, 6),
    },
    topGames: games,
    topGenre: { id: 1, name: genre, totalPlaytimeSeconds: total * 0.6 },
    topPlatform: {
      id: platform.id,
      name: platform.name,
      totalPlaytimeSeconds: total * 0.7,
    },
    playedInPeriod: games.length,
    finishedInPeriod: rand(0, 3),
    reviewedInPeriod: rand(0, 3),
  };
}
