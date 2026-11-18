import { describe, expect, it } from "vitest";
import {
  Game,
  type ProfileMetricsSummaryResponseDto,
} from "@repo/wrapper/server";
import {
  buildWrappedWidgetSnapshot,
  type WrappedWidgetLabels,
} from "../../../../../packages/ui/src/components/wrapped/util/wrappedWidgetSnapshot";

const labels: WrappedWidgetLabels = {
  eyebrow: "WRAPPED 2026",
  hoursCaption: "hours played",
  topGameBadge: "#1 GAME",
  top3Title: "TOP 3 GAMES",
  posterSubtitle: "Your Wrapped",
  posterTagline: "played in the last 12 months",
  yearChip: "2026",
  viewRecap: "View recap",
  emptyTitle: "Your Wrapped",
  emptyBody: "Open GameNode",
  personalityEyebrow: "YOUR PROFILE 2026",
  personality: (id) => ({ title: `title:${id}`, subtitle: `subtitle:${id}` }),
  personalityChip: (percent, genre) => `${percent}% ${genre}`,
  change: (change) => `${change} vs. previous`,
  detail: (hours, percent) => `${hours} · ${percent}% of your time`,
};

const hours = (value: number) => value * 3600;

const summary = (
  current: number,
  previous: number,
  topGames: { gameId: number; seconds: number }[],
  extra: {
    genre?: string | null;
    genreHours?: number;
    played?: number;
    finished?: number;
  } = {},
) =>
  ({
    period: "year",
    current: { totalPlaytimeSeconds: hours(current), totalGames: topGames.length },
    previous: { totalPlaytimeSeconds: hours(previous), totalGames: 1 },
    topGames: topGames.map((game) => ({
      gameId: game.gameId,
      totalPlaytimeSeconds: hours(game.seconds),
    })),
    topGenre:
      extra.genre === null
        ? null
        : {
            id: 1,
            name: extra.genre ?? "Role-playing (RPG)",
            totalPlaytimeSeconds: hours(extra.genreHours ?? current),
          },
    topPlatform: {
      id: 6,
      name: "PC (Microsoft Windows)",
      totalPlaytimeSeconds: hours(current),
    },
    playedInPeriod: extra.played ?? topGames.length,
    finishedInPeriod: extra.finished ?? 0,
    reviewedInPeriod: 0,
  }) as unknown as ProfileMetricsSummaryResponseDto;

const game = (id: number, name: string) =>
  ({
    id,
    name,
    source: Game.source.MYSQL,
    cover: { url: `//images.igdb.com/igdb/image/upload/t_thumb/co${id}.jpg` },
  }) as unknown as Game;

describe("buildWrappedWidgetSnapshot", () => {
  it("returns null when nothing was played", () => {
    expect(
      buildWrappedWidgetSnapshot({
        summary: summary(0, 0, []),
        games: [],
        username: "ThePrado",
        language: "en",
        labels,
      }),
    ).toBeNull();
  });

  it("formats the figures, covers and chips for the widgets", () => {
    const snapshot = buildWrappedWidgetSnapshot({
      summary: summary(1248, 1000, [
        { gameId: 1, seconds: 312 },
        { gameId: 2, seconds: 200 },
        { gameId: 3, seconds: 100 },
        { gameId: 4, seconds: 50 },
      ]),
      games: [game(1, "Elden Ring"), game(2, "God of War"), game(3, "Hades")],
      username: "ThePrado",
      avatarUrl: "https://cdn/avatar.png",
      language: "en",
      labels,
      now: 123,
    })!;

    expect(snapshot.updatedAt).toBe(123);
    expect(snapshot.strings.hoursValue).toBe("1,248");
    expect(snapshot.strings.changeChip).toBe("+25% vs. previous");
    expect(snapshot.strings.posterTagline).toBe(
      "played in the last 12 months · +25% vs. previous",
    );
    expect(snapshot.topGames).toHaveLength(3);
    expect(snapshot.topGames[0]).toEqual({
      name: "Elden Ring",
      hoursText: "312 h",
      detail: "312 h · 25% of your time",
      coverUrl:
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg",
    });
    expect(snapshot.chips).toEqual(["Role-playing (RPG)", "PC", "#1 Elden Ring"]);
  });

  it("drops the change chip without a previous period and keeps decimals for small totals", () => {
    const snapshot = buildWrappedWidgetSnapshot({
      summary: summary(4.5, 0, [{ gameId: 1, seconds: 4.5 }]),
      games: [],
      username: "ThePrado",
      language: "pt-BR",
      labels,
    })!;

    expect(snapshot.strings.changeChip).toBeNull();
    expect(snapshot.strings.hoursValue).toBe("4,5");
    expect(snapshot.strings.posterTagline).toBe("played in the last 12 months");
    expect(snapshot.topGames[0]!.coverUrl).toBeNull();
    expect(snapshot.avatarUrl).toBeNull();
  });

  it("derives the personality from the top genre and its share of the time", () => {
    const snapshot = buildWrappedWidgetSnapshot({
      summary: summary(100, 50, [{ gameId: 1, seconds: 100 }], {
        genre: "Role-playing (RPG)",
        genreHours: 78,
      }),
      games: [game(1, "Elden Ring")],
      username: "ThePrado",
      language: "en",
      labels,
    })!;

    expect(snapshot.strings.personalityEyebrow).toBe("YOUR PROFILE 2026");
    expect(snapshot.personality).toEqual({
      title: "title:adventurer",
      subtitle: "subtitle:adventurer",
      chip: "78% RPG",
    });
  });

  it("calls a player who finishes most of what they play a completionist", () => {
    const snapshot = buildWrappedWidgetSnapshot({
      summary: summary(100, 50, [{ gameId: 1, seconds: 100 }], {
        genre: "Shooter",
        played: 5,
        finished: 4,
      }),
      games: [],
      username: "ThePrado",
      language: "en",
      labels,
    })!;

    expect(snapshot.personality?.title).toBe("title:completionist");
  });

  it("falls back to an all-rounder without a genre, and drops the chip", () => {
    const snapshot = buildWrappedWidgetSnapshot({
      summary: summary(100, 50, [{ gameId: 1, seconds: 100 }], { genre: null }),
      games: [],
      username: "ThePrado",
      language: "en",
      labels,
    })!;

    expect(snapshot.personality).toEqual({
      title: "title:allrounder",
      subtitle: "subtitle:allrounder",
      chip: null,
    });
  });
});
