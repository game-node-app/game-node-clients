import { expect, it } from "vitest";
import {
  exploreScreenDtoToSearchParams,
  exploreScreenUrlQueryToDto,
} from "../../../../web/src/components/explore/utils";

it("normalizes supported URL criteria and round-trips the request", () => {
  const dto = exploreScreenUrlQueryToDto({
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
  expect(dto).toEqual({
    limit: 20,
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
  expect(
    exploreScreenUrlQueryToDto(
      Object.fromEntries(exploreScreenDtoToSearchParams(dto)),
    ),
  ).toEqual(dto);
});

it("omits malformed IDs and defaults invalid periods", () => {
  expect(
    exploreScreenUrlQueryToDto({
      period: "bogus",
      genres: "0,-1,2.5,NaN,9007199254740992,7",
      themes: ["4", "5"],
      arbitrary: "42",
    }),
  ).toEqual({ limit: 20, period: "month", criteria: { genres: [7] } });
});
