// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StatisticsRankingsRequestDto as Ranking,
  StatisticsService,
} from "@repo/wrapper/server";
import {
  getInfiniteTrendingGamesKey,
  useInfiniteTrendingGames,
} from "../../../../../packages/ui/src/components/statistics/hooks/useInfiniteTrendingGames";
import { useTrendingReviews } from "../../../../../packages/ui/src/components/statistics/hooks/useTrendingReviews";
const session = vi.hoisted(() => ({ id: undefined as string | undefined }));
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.id }),
);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.id = undefined;
});

it("keys periods separately and advances from returned offsets only within the API boundary", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const api = vi
    .spyOn(StatisticsService, "statisticsControllerFindRankingsV1")
    .mockImplementation(((dto: Ranking) =>
      Promise.resolve({
        items: [],
        pagination: {
          limit: 20,
          offset: dto.offset === 20 ? 9990 : dto.offset,
          total: 20000,
          hasNextPage: true,
        },
      })) as any);
  const hook = renderHook(
    ({ period }) => useInfiniteTrendingGames({ period }),
    { initialProps: { period: Ranking.period.MONTH }, wrapper },
  );
  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
  expect(hook.result.current.queryKey).toEqual(
    getInfiniteTrendingGamesKey({ period: Ranking.period.MONTH }),
  );
  await act(async () => {
    await hook.result.current.fetchNextPage();
  });
  expect(api.mock.calls[1][0].offset).toBe(20);
  await waitFor(() => expect(hook.result.current.hasNextPage).toBe(false));
  hook.rerender({ period: Ranking.period.ALL });
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith(
      expect.objectContaining({
        period: "all",
        offset: 0,
        mode: "popular",
        sourceType: "game",
      }),
    ),
  );
  expect(hook.result.current.queryKey).not.toEqual(
    getInfiniteTrendingGamesKey({ period: Ranking.period.MONTH }),
  );
});

it("separates review rankings by actor and forwards review selectors", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const api = vi
    .spyOn(StatisticsService, "statisticsControllerFindRankingsV1")
    .mockResolvedValue({
      items: [],
      pagination: { total: 0, offset: 0, limit: 7, hasNextPage: false },
    } as any);
  const hook = renderHook(
    () =>
      useTrendingReviews({
        gameId: 7,
        excludeOwn: true,
        authorId: "author",
        reviewId: "review",
      }),
    { wrapper },
  );
  await waitFor(() => expect(api).toHaveBeenCalledTimes(1));
  session.id = "actor";
  hook.rerender();
  await waitFor(() => expect(api).toHaveBeenCalledTimes(2));
  expect(api).toHaveBeenLastCalledWith(
    expect.objectContaining({
      sourceType: "review",
      mode: "popular",
      gameId: 7,
      excludeOwn: true,
      authorId: "author",
      reviewId: "review",
    }),
  );
});
