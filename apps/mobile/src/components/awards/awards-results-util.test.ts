import { describe, expect, it } from "vitest";
import type {
  AwardsCategoryResult,
  AwardsCategoryResultWinner,
} from "@repo/wrapper/server";
import {
  findCategoryWinner,
  getAwardsResultsShareUrl,
  getPlayedDispute,
  getWinnerPercentage,
  hasPlayedVotes,
  sortResultsByCategoryOrder,
  sortWinnersByMode,
} from "../../../../../packages/ui/src/components/awards/results/awardsResults";

function winner(
  id: number,
  position: number,
  votesPercentage: number,
  playedVotesPercentage: number,
): AwardsCategoryResultWinner {
  return {
    id,
    gameId: id,
    position,
    votesPercentage,
    playedVotesPercentage,
  } as unknown as AwardsCategoryResultWinner;
}

function result(
  id: number,
  order: number,
  totalPlayedVotesCount = 10,
): AwardsCategoryResult {
  return {
    id,
    categoryId: id,
    totalVotesCount: 100,
    totalPlayedVotesCount,
    category: { id, order },
    winners: [],
  } as unknown as AwardsCategoryResult;
}

describe("awardsResults", () => {
  it("builds the public scoreboard link", () => {
    expect(getAwardsResultsShareUrl(2026, "abc")).toBe(
      "https://gamenode.app/awards/2026/result?user=abc",
    );
  });

  it("orders the results by category.order, not by id", () => {
    const ordered = sortResultsByCategoryOrder([
      result(10, 2),
      result(11, 0),
      result(12, 1),
    ]);

    expect(ordered.map((entry) => entry.id)).toEqual([11, 12, 10]);
  });

  it("omits the played mode when the event has no played votes", () => {
    expect(hasPlayedVotes(result(1, 0, 0))).toBe(false);
    expect(hasPlayedVotes({ totalPlayedVotesCount: null } as never)).toBe(false);
    expect(hasPlayedVotes(result(1, 0, 3))).toBe(true);
  });

  it("sorts the winners by the selected share", () => {
    const winners = [
      winner(1, 1, 0.31, 0.29),
      winner(2, 2, 0.22, 0.33),
      winner(3, 3, 0.14, 0.2),
    ];

    expect(sortWinnersByMode(winners, "all").map((row) => row.id)).toEqual([
      1, 2, 3,
    ]);
    expect(sortWinnersByMode(winners, "played").map((row) => row.id)).toEqual([
      2, 1, 3,
    ]);
    expect(getWinnerPercentage(winners[1], "played")).toBe(0.33);
    expect(getWinnerPercentage(winners[1], "all")).toBe(0.22);
  });

  it("compares the top two played shares and ignores empty data", () => {
    const dispute = getPlayedDispute([
      winner(1, 1, 0.31, 0.29),
      winner(2, 2, 0.22, 0.27),
      winner(3, 3, 0.14, 0.2),
    ]);

    expect(dispute?.map((row) => row.id)).toEqual([1, 2]);
    expect(getPlayedDispute([winner(1, 1, 0.31, 0)])).toBeNull();
    expect(getPlayedDispute([])).toBeNull();
  });

  it("finds the position-1 winner", () => {
    const positionOne = winner(1, 1, 0.4, 0.4);

    expect(
      findCategoryWinner({
        winners: [winner(2, 2, 0.2, 0.2), positionOne],
      }),
    ).toBe(positionOne);
    expect(findCategoryWinner({ winners: [] })).toBeNull();
  });
});
