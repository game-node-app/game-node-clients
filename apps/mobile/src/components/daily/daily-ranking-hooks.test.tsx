// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  DailyService,
  type DailyRankingResponseDto,
} from "@repo/wrapper/server";
import { useInfiniteDailyRanking } from "../../../../../packages/ui/src/components/daily/ranking/useInfiniteDailyRanking";
import { useDailyRanking } from "../../../../../packages/ui/src/components/daily/ranking/useDailyRanking";
import { createTestQueryClient } from "./dailyTestUtils";

const mocks = vi.hoisted(() => ({ userId: undefined as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.userId }),
);

const row = (position: number) => ({
  position,
  positionChange: null,
  avatar: null,
  userId: `user-${position}`,
  username: `player${position}`,
  supporterBadge: false,
  points: 100 - position,
  winRate: 50,
});

const page = (
  from: number,
  count: number,
  hasNextPage: boolean,
): DailyRankingResponseDto => ({
  pointsToTop100: null,
  period: "week" as never,
  mode: null,
  scope: "all" as never,
  endsAt: null,
  totalPlayers: 40,
  viewer: null,
  data: Array.from({ length: count }, (_, index) => row(from + index)),
  pagination: {
    hasNextPage,
    totalItems: 40,
    limit: 20,
    offset: from - 1,
  } as never,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

afterEach(() => {
  cleanup();
  mocks.userId = undefined;
  vi.restoreAllMocks();
});

describe("useInfiniteDailyRanking", () => {
  it("sends the filters and pages by loaded rows until hasNextPage is false", async () => {
    const spy = vi
      .spyOn(DailyService, "dailyControllerFindRankingV1")
      .mockResolvedValueOnce(page(1, 20, true) as never)
      .mockResolvedValueOnce(page(21, 18, false) as never);
    const { result } = renderHook(
      () =>
        useInfiniteDailyRanking({
          period: "month",
          mode: "cover",
          scope: "all",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenLastCalledWith("month", "cover", "all", 0, 20);
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());
    expect(spy).toHaveBeenLastCalledWith("month", "cover", "all", 20, 20);
    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
    expect(result.current.data?.pages.flatMap((p) => p.data)).toHaveLength(38);
  });

  it("sends no mode for the overall ranking", async () => {
    const spy = vi
      .spyOn(DailyService, "dailyControllerFindRankingV1")
      .mockResolvedValue(page(1, 3, false) as never);
    const { result } = renderHook(
      () =>
        useInfiniteDailyRanking({ period: "week", mode: null, scope: "all" }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("week", undefined, "all", 0, 20);
    expect(result.current.queryKey.slice(0, 3)).toEqual([
      "daily",
      "ranking",
      "list",
    ]);
  });

  it("does not request the following scope while signed out", async () => {
    const spy = vi.spyOn(DailyService, "dailyControllerFindRankingV1");
    const { result } = renderHook(
      () =>
        useInfiniteDailyRanking({
          period: "week",
          mode: null,
          scope: "following",
        }),
      { wrapper },
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("requests the following scope when signed in", async () => {
    mocks.userId = "user-1";
    const spy = vi
      .spyOn(DailyService, "dailyControllerFindRankingV1")
      .mockResolvedValue(page(1, 2, false) as never);
    const { result } = renderHook(
      () =>
        useInfiniteDailyRanking({
          period: "week",
          mode: null,
          scope: "following",
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("week", undefined, "following", 0, 20);
  });
});

describe("useDailyRanking", () => {
  it("reads the week's top three by default", async () => {
    const spy = vi
      .spyOn(DailyService, "dailyControllerFindRankingV1")
      .mockResolvedValue(page(1, 3, true) as never);
    const { result } = renderHook(() => useDailyRanking(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith("week", undefined, "all", 0, 3);
  });
});
