/* global process */
import type {
  RecapCalendarDto,
  RecapTopGameDto,
  YearRecapDto,
} from "@repo/wrapper/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(utc);
dayjs.extend(isLeapYear);

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

function getYearDays(year: number) {
  return dayjs.utc().year(year).isLeapYear() ? 366 : 365;
}

/** One fake playtime value per UTC day; weekdays and the weekend are heavier. */
function buildMockDailyPlaytime(year: number): number[] {
  const start = dayjs.utc().year(year).startOf("year");
  const days = getYearDays(year);

  return Array.from({ length: days }, (_, index) => {
    const weekday = start.add(index, "day").day();
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.6 : 1;
    const base = Math.random() < 0.42 ? 0 : rand(1, 4) * 1800;

    return Math.round(base * weekendBoost);
  });
}

function buildMockCalendar(
  year: number,
  dailyPlaytimeSeconds: number[],
): RecapCalendarDto {
  const start = dayjs.utc().year(year).startOf("year");
  const monthlyPlaytimeSeconds = Array.from({ length: 12 }, () => 0);
  const weekdaySeconds = Array.from({ length: 7 }, () => 0);
  let totalSeconds = 0;
  let currentStreakDays = 0;
  let currentStreakStart = 0;
  let longestStreakDays = 0;
  let longestStreakStart = 0;

  dailyPlaytimeSeconds.forEach((seconds, index) => {
    const date = start.add(index, "day");
    monthlyPlaytimeSeconds[date.month()]! += seconds;
    weekdaySeconds[date.day()]! += seconds;
    totalSeconds += seconds;

    if (seconds > 0) {
      if (currentStreakDays === 0) currentStreakStart = index;
      currentStreakDays++;

      if (currentStreakDays > longestStreakDays) {
        longestStreakDays = currentStreakDays;
        longestStreakStart = currentStreakStart;
      }
    } else {
      currentStreakDays = 0;
    }
  });

  const topMonthIndex = monthlyPlaytimeSeconds.reduce(
    (best, seconds, index) =>
      seconds > monthlyPlaytimeSeconds[best]! ? index : best,
    0,
  );

  let topWeekdayIndex = 0;
  weekdaySeconds.forEach((seconds, index) => {
    if (seconds > weekdaySeconds[topWeekdayIndex]!) topWeekdayIndex = index;
  });

  const streakEnd = start
    .add(Math.max(0, longestStreakStart + longestStreakDays - 1), "day")
    .format("YYYY-MM-DD");

  return {
    monthlyPlaytimeSeconds,
    topMonth:
      monthlyPlaytimeSeconds[topMonthIndex]! > 0
        ? {
            month: topMonthIndex + 1,
            playtimeSeconds: monthlyPlaytimeSeconds[topMonthIndex]!,
          }
        : null,
    longestStreak:
      longestStreakDays > 0
        ? {
            start: start.add(longestStreakStart, "day").format("YYYY-MM-DD"),
            end: streakEnd,
            days: longestStreakDays,
          }
        : null,
    topWeekday:
      totalSeconds > 0
        ? {
            weekday: topWeekdayIndex,
            share: weekdaySeconds[topWeekdayIndex]! / totalSeconds,
          }
        : null,
    weekendShare:
      totalSeconds > 0
        ? (weekdaySeconds[0]! + weekdaySeconds[6]!) / totalSeconds
        : 0,
  };
}

/** A random UTC day of the year as `YYYY-MM-DD`. */
function randomDayOfYear(year: number, from = 0): string {
  const days = getYearDays(year);
  const index = rand(from, days - 1);

  return dayjs
    .utc()
    .year(year)
    .startOf("year")
    .add(index, "day")
    .format("YYYY-MM-DD");
}

function buildMockTopGames(
  year: number,
  games: { gameId: number; seconds: number }[],
  playedGames: {
    gameId: number;
    platformId: number;
    firstPlayedAt: string;
    finishedAt: string | null;
    rating: number | null;
  }[],
  totalPlaytimeSeconds: number,
): RecapTopGameDto[] {
  return games.map((game) => {
    const rows = playedGames.filter((row) => row.gameId === game.gameId);
    const finishedRows = rows
      .map((row) => row.finishedAt)
      .filter((value): value is string => value != null)
      .sort();
    const firstPlayedRows = rows
      .map((row) => row.firstPlayedAt)
      .filter((value): value is string => value != null)
      .sort();
    const ratingRow = rows.find((row) => row.rating != null);

    return {
      gameId: game.gameId,
      platformIds: Array.from(new Set(rows.map((row) => row.platformId))),
      totalPlaytimeSeconds: game.seconds,
      share:
        totalPlaytimeSeconds > 0
          ? Math.round((game.seconds / totalPlaytimeSeconds) * 10_000) / 10_000
          : 0,
      firstPlayedAt: firstPlayedRows[0] ?? randomDayOfYear(year),
      finishedAt: finishedRows[0] ?? null,
      rating: ratingRow?.rating ?? null,
    };
  });
}

export function buildMockRecap(userId: string, year: number): YearRecapDto {
  const games = GAME_IDS.slice(0, rand(4, GAME_IDS.length)).map((gameId) => ({
    gameId,
    seconds: rand(3, 220) * 3600,
  }));
  games.sort((a, b) => b.seconds - a.seconds);
  const totalPlaytimeSeconds = games.reduce((sum, g) => sum + g.seconds, 0);
  const now = new Date().toISOString();
  const dailyPlaytimeSeconds = buildMockDailyPlaytime(year);
  const calendar = buildMockCalendar(year, dailyPlaytimeSeconds);

  const playedGames = games.map((g, index) => {
    const platform = PLATFORMS[rand(0, PLATFORMS.length - 1)]!;
    const firstPlayedAt = randomDayOfYear(year);
    const firstPlayedIndex = dayjs
      .utc(firstPlayedAt)
      .diff(dayjs.utc().year(year).startOf("year"), "day");
    const isFinished = Math.random() < 0.6;
    const finishedAt = isFinished
      ? dayjs
          .utc()
          .year(year)
          .startOf("year")
          .add(rand(firstPlayedIndex, getYearDays(year) - 1), "day")
          .toISOString()
      : null;

    return {
      id: index + 1,
      recapId: 1,
      gameId: g.gameId,
      platformId: platform.id,
      platform,
      game: {
        id: g.gameId,
      } as unknown as YearRecapDto["playedGames"][number]["game"],
      totalPlaytimeSeconds: g.seconds,
      percentOfTotalPlaytime: g.seconds / totalPlaytimeSeconds,
      percentOfTotalPlaytimeFormatted: (
        (g.seconds / totalPlaytimeSeconds) *
        100
      ).toFixed(1),
      firstPlayedAt,
      finishedAt,
      rating: Math.random() < 0.7 ? rand(30, 50) / 10 : null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  });

  const topGames = buildMockTopGames(
    year,
    games,
    playedGames,
    totalPlaytimeSeconds,
  );
  const finishedGames = playedGames.filter((game) => game.finishedAt != null);
  const totalDroppedGames = rand(0, 8);
  const totalAddedGames =
    finishedGames.length + totalDroppedGames + rand(4, 40);

  const secondsByPlatform = new Map<number, number>();
  playedGames.forEach((game) => {
    secondsByPlatform.set(
      game.platformId,
      (secondsByPlatform.get(game.platformId) ?? 0) + game.totalPlaytimeSeconds,
    );
  });

  const ratedTopGames = topGames.filter((game) => game.rating != null);
  const minorityGame = ratedTopGames[0];
  const inTuneGame = ratedTopGames[1];

  return {
    id: 1,
    year,
    profileUserId: userId,
    playedGames,
    playedGamesByPlatform: PLATFORMS.map((platform) => ({
      ...platform,
      abbreviation: platform.name,
      count: rand(1, 12),
    })),
    distributionByGenre: distribution(GENRES),
    distributionByMode: distribution(MODES),
    distributionByTheme: distribution(THEMES),
    distributionByPlatform: distribution(PLATFORMS.map((p) => p.name)),
    backlogGrowth: Math.max(
      0,
      totalAddedGames - (finishedGames.length + totalDroppedGames),
    ),
    calendar,
    topGames,
    playtimeByPlatform: Array.from(secondsByPlatform.entries())
      .map(([platform, seconds]) => ({
        platform,
        totalPlaytimeSeconds: seconds,
        share: totalPlaytimeSeconds > 0 ? seconds / totalPlaytimeSeconds : 0,
      }))
      .sort((a, b) => b.totalPlaytimeSeconds - a.totalPlaytimeSeconds),
    dailyPlaytimeSeconds,
    communityHighlights: {
      minority: minorityGame
        ? {
            gameId: minorityGame.gameId,
            userRating: minorityGame.rating!,
            communityAverage: Math.max(0, minorityGame.rating! - 1.4),
            reviewCount: rand(40, 900),
            beyondShare: rand(4, 20) / 100,
            sameRangeCount: rand(20, 400),
          }
        : null,
      inTune: inTuneGame
        ? {
            gameId: inTuneGame.gameId,
            userRating: inTuneGame.rating!,
            communityAverage: Math.max(0, inTuneGame.rating! - 0.1),
            reviewCount: rand(40, 900),
            beyondShare: rand(30, 60) / 100,
            sameRangeCount: rand(400, 3_000),
          }
        : null,
    },
    totalPlayedGames: playedGames.length,
    totalPlaytimeSeconds,
    totalAddedGames,
    totalFinishedGames: finishedGames.length,
    totalDroppedGames,
    isFinal: false,
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
