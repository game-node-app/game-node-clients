import { describe, expect, it } from "vitest";
import {
  filterAwardsEligibleGames,
  isAwardsGameEligible,
} from "../../../../../packages/ui/src/components/awards/search/eligibleGames";

const event = {
  year: 2026,
  eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
};

const games = [
  { id: 1, firstReleaseDate: "2026-03-14T00:00:00.000Z" },
  { id: 2, firstReleaseDate: "2026-12-05T00:00:00.000Z" },
  { id: 3, firstReleaseDate: "2026-11-30T23:59:59.000Z" },
  { id: 4, firstReleaseDate: "2025-12-01T00:00:00.000Z" },
  { id: 5, firstReleaseDate: undefined },
  { id: 6, firstReleaseDate: null },
  { id: 7, firstReleaseDate: "2027-01-01T00:00:00.000Z" },
];

describe("filterAwardsEligibleGames", () => {
  it("keeps only games released in the event year", () => {
    const eligible = filterAwardsEligibleGames(games, { year: 2026 });

    expect(eligible.map((game) => game.id)).toEqual([1, 2, 3, 5, 6]);
  });

  it("drops games released after the cutoff day", () => {
    const eligible = filterAwardsEligibleGames(games, event);

    expect(eligible.map((game) => game.id)).toEqual([1, 3, 5, 6]);
  });

  it("keeps a game released on the cutoff day and accepts games without a date", () => {
    expect(isAwardsGameEligible(games[2], event)).toBe(true);
    expect(isAwardsGameEligible(games[4], event)).toBe(true);
    expect(isAwardsGameEligible(games[5], event)).toBe(true);
    expect(isAwardsGameEligible(null, event)).toBe(true);
  });

  it("compares the cutoff by UTC day, like the server", () => {
    // 2026-11-30T23:00-03:00 is already 1 Dec in UTC, after the cutoff.
    expect(
      isAwardsGameEligible(
        { firstReleaseDate: "2026-11-30T23:00:00.000-03:00" },
        event,
      ),
    ).toBe(false);
    // 2026-12-01T00:00+14:00 is still 30 Nov in UTC, on the cutoff day.
    expect(
      isAwardsGameEligible(
        { firstReleaseDate: "2026-12-01T00:00:00.000+14:00" },
        event,
      ),
    ).toBe(true);
  });

  it("accepts a date-only cutoff and rejects malformed dates", () => {
    expect(
      filterAwardsEligibleGames(games, {
        year: 2026,
        eligibilityCutoffDate: "2026-11-30",
      }).map((game) => game.id),
    ).toEqual([1, 3, 5, 6]);

    expect(
      isAwardsGameEligible({ firstReleaseDate: "not-a-date" }, { year: 2026 }),
    ).toBe(false);
  });

  it("returns an empty list without search results", () => {
    expect(filterAwardsEligibleGames(null, event)).toEqual([]);
    expect(filterAwardsEligibleGames(undefined, event)).toEqual([]);
  });
});
