import { afterEach, expect, it, vi } from "vitest";
import {
  StatisticsService,
  StatisticsRankingsRequestDto,
  StatisticsViewRequestDto,
  ReactionRequestDto,
} from "@repo/wrapper/server";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("serializes source status, numeric ranking pages, durable views and reactions", async () => {
  const fetch = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(
        new Response("{}", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
  vi.stubGlobal("fetch", fetch);
  await StatisticsService.statisticsControllerGetStatusV1("game", 42);
  await StatisticsService.statisticsControllerFindRankingsV1({
    sourceType: StatisticsRankingsRequestDto.sourceType.GAME,
    limit: 20,
    offset: 40,
  });
  await StatisticsService.statisticsControllerRecordViewV1({
    sourceType: StatisticsViewRequestDto.sourceType.GAME,
    sourceId: 42,
    viewId: "123e4567-e89b-12d3-a456-426614174000",
  });
  await StatisticsService.statisticsControllerAddLikeV1({
    sourceType: ReactionRequestDto.sourceType.GAME,
    sourceId: 42,
  });
  await StatisticsService.statisticsControllerRemoveLikeV1({
    sourceType: ReactionRequestDto.sourceType.GAME,
    sourceId: 42,
  });
  expect(fetch.mock.calls[0][0]).toContain(
    "/v1/statistics/status?sourceType=game&sourceId=42",
  );
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    sourceType: "game",
    limit: 20,
    offset: 40,
  });
  expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({
    sourceType: "game",
    sourceId: 42,
    viewId: "123e4567-e89b-12d3-a456-426614174000",
  });
  for (const call of fetch.mock.calls.slice(3)) {
    expect(call[0]).toContain("/v1/statistics/like");
    expect(JSON.parse(call[1].body)).toEqual({
      sourceType: "game",
      sourceId: 42,
    });
  }
  expect(fetch.mock.calls.slice(3).map((call) => call[1].method)).toEqual([
    "PUT",
    "DELETE",
  ]);
});
