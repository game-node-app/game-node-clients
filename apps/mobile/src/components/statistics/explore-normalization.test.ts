import { expect, it } from "vitest";
import {
  exploreUrlQueryToValue,
  exploreValueToUrlQuery,
} from "../../../../web/src/components/explore/utils";
import {
  getExploreRankingDto,
  selectExploreGenre,
} from "../../../../../packages/ui/src/components/explore/util/exploreValue";

it("normalizes supported URL criteria and round-trips the selection", () => {
  const value = exploreUrlQueryToValue({
    period: "week",
    ids: "1,2",
    genres: "4,5",
    themes: "8",
    platforms: "9",
    gameModes: "3",
    status: "0,2,1",
    category: "0,14,15",
    ignored: "yes",
  });
  expect(value).toEqual({
    period: "week",
    criteria: {
      ids: [1, 2],
      status: [0, 2],
      category: [0, 14],
      themes: [8],
      gameModes: [3],
      platforms: [9],
      genres: [4, 5],
    },
  });
  expect(exploreUrlQueryToValue(exploreValueToUrlQuery(value))).toEqual(value);
});

it("omits malformed IDs and defaults invalid periods", () => {
  expect(
    exploreUrlQueryToValue({
      period: "bogus",
      genres: "0,-1,2.5,NaN,9007199254740992,7",
      themes: ["4", "5"],
      arbitrary: "42",
    }),
  ).toEqual({ period: "month", criteria: { genres: [7] } });
});

it("tells the shelves apart from the unfiltered overall ranking", () => {
  const shelves = exploreUrlQueryToValue({});
  expect(shelves).toEqual({ period: "month" });
  expect(exploreValueToUrlQuery(shelves)).toEqual({});

  const ranking = exploreUrlQueryToValue({ view: "ranking", period: "all" });
  expect(ranking).toEqual({ period: "all", criteria: {} });
  expect(exploreValueToUrlQuery(ranking)).toEqual({
    period: "all",
    view: "ranking",
  });
  // an empty `criteria` would break SSR dehydration if it reached the key
  expect(getExploreRankingDto(ranking)).toStrictEqual({
    period: "all",
    limit: 96,
  });
});

it("swaps the genre and keeps the other filters", () => {
  const filtered = exploreUrlQueryToValue({ genres: "4,5", platforms: "9" });
  expect(selectExploreGenre(filtered, 12).criteria).toEqual({
    genres: [12],
    platforms: [9],
  });
  expect(selectExploreGenre(filtered, undefined).criteria).toEqual({
    platforms: [9],
  });
  expect(
    selectExploreGenre(exploreUrlQueryToValue({ genres: "4" }), undefined),
  ).toStrictEqual({ period: "month" });
});
