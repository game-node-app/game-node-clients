import { describe, expect, it } from "vitest";
import type { Game } from "@repo/wrapper/server";
import {
  type GameShareData,
  formatShareRating,
  getAvailableBlocks,
  getGameCredit,
  getPlaytimeHours,
  getRatingStars,
  getTitleScale,
  getVisibleBlocks,
  pickAchievementProgress,
  roundRatingToHalf,
} from "../../../../../packages/ui/src/components/game/share/gameShareModel";

const emptyData: GameShareData = {
  game: undefined,
  name: "Dishonored 2",
  credit: null,
  handle: null,
  rating: null,
  playtimeHours: null,
  achievements: null,
  platformIcons: [],
  statusLabel: null,
};

const achievement = (isObtained: boolean) => ({ isObtained }) as never;

describe("game share rating", () => {
  it("rounds to the nearest half star and clamps to 0–5", () => {
    expect(roundRatingToHalf(4.3)).toBe(4.5);
    expect(roundRatingToHalf(4.2)).toBe(4);
    expect(roundRatingToHalf(9)).toBe(5);
    expect(roundRatingToHalf(-1)).toBe(0);
    expect(roundRatingToHalf(Number.NaN)).toBe(0);
  });

  it("splits a rating into full, half and empty stars", () => {
    expect(getRatingStars(4.5)).toEqual({ full: 4, half: true, empty: 0 });
    expect(getRatingStars(3)).toEqual({ full: 3, half: false, empty: 2 });
    expect(getRatingStars(0.5)).toEqual({ full: 0, half: true, empty: 4 });
  });

  it("formats with the decimal separator of the language", () => {
    expect(formatShareRating(4.5, "pt-BR")).toBe("4,5");
    expect(formatShareRating(4.5, "en")).toBe("4.5");
    expect(formatShareRating(4, "pt-BR")).toBe("4,0");
  });
});

describe("game share data from partial sources", () => {
  it("has no personal block for a signed-out viewer", () => {
    const blocks = getAvailableBlocks(emptyData);

    expect(blocks).toEqual({
      rating: false,
      playtime: false,
      achievements: false,
      platforms: false,
    });
  });

  it("draws only blocks that are switched on and have data", () => {
    const data: GameShareData = {
      ...emptyData,
      rating: 4.5,
      playtimeHours: 20,
    };

    expect(
      getVisibleBlocks(data, {
        rating: true,
        playtime: false,
        achievements: true,
        platforms: true,
      }),
    ).toEqual({
      rating: true,
      playtime: false,
      achievements: false,
      platforms: false,
    });
  });

  it("sums playtime across sources and hides it when nothing was played", () => {
    expect(getPlaytimeHours(undefined)).toBeNull();
    expect(getPlaytimeHours([])).toBeNull();
    expect(getPlaytimeHours([{ totalPlaytimeSeconds: 0 }])).toBeNull();
    expect(
      getPlaytimeHours([
        { totalPlaytimeSeconds: 3600 * 12 },
        { totalPlaytimeSeconds: 3600 * 7 + 60 },
      ]),
    ).toBe(20);
  });

  it("picks the achievement source with the most progress", () => {
    expect(pickAchievementProgress(undefined)).toBeNull();
    expect(
      pickAchievementProgress([
        { achievements: [achievement(false), achievement(false)] },
      ]),
    ).toBeNull();
    expect(
      pickAchievementProgress([
        {
          achievements: [
            achievement(true),
            achievement(false),
            achievement(false),
          ],
        },
        {
          achievements: [
            achievement(true),
            achievement(true),
            achievement(false),
          ],
        },
      ]),
    ).toEqual({ obtained: 2, total: 3 });
  });
});

describe("game share credit", () => {
  const game = (overrides: Partial<Game>) => overrides as Game;

  it("joins the developer and the release year", () => {
    expect(
      getGameCredit(
        game({
          firstReleaseDate: "2016-11-11T00:00:00.000Z",
          involvedCompanies: [
            { developer: false, company: { name: "Bethesda" } },
            { developer: true, company: { name: "Arkane Studios" } },
          ] as never,
        }),
      ),
    ).toBe("Arkane Studios, 2016");
  });

  it("keeps whichever part exists and is null for none", () => {
    expect(
      getGameCredit(game({ firstReleaseDate: "2016-11-11T00:00:00.000Z" })),
    ).toBe("2016");
    expect(getGameCredit(game({ firstReleaseDate: "not a date" }))).toBeNull();
    expect(getGameCredit(undefined)).toBeNull();
  });

  it("shrinks long titles in steps", () => {
    expect(getTitleScale("Dishonored 2")).toBe(1);
    expect(getTitleScale("The Legend of Zelda: Breath of the Wild")).toBe(0.8);
    expect(getTitleScale("x".repeat(60))).toBe(0.62);
  });
});
