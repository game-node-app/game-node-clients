// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StatisticsService,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { useItemStatistics } from "../../../../../packages/ui/src/components/statistics/hooks/useItemStatistics";

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

it("uses native IDs, zero counters and actor-specific status without requesting unresolved games", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const summary = vi
    .spyOn(StatisticsService, "statisticsControllerFindSummaryV1")
    .mockResolvedValue({
      viewsCount: 0,
      likesCount: 0,
      projectionLagSeconds: 4,
    } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
  const status = vi
    .spyOn(StatisticsService, "statisticsControllerGetStatusV1")
    .mockImplementation((async () => ({
      isLiked: !!session.id,
      isViewed: false,
    })) as unknown as typeof StatisticsService.statisticsControllerGetStatusV1);
  const hook = renderHook(({ id, type }) => useItemStatistics(id, type), {
    initialProps: {
      id: undefined as string | undefined,
      type: StatisticsSourceRequestDto.sourceType.GAME,
    },
    wrapper,
  });
  expect(summary).not.toHaveBeenCalled();
  hook.rerender({
    id: "0042",
    type: StatisticsSourceRequestDto.sourceType.GAME,
  });
  await waitFor(() => expect(hook.result.current.data?.likesCount).toBe(0));
  expect(summary).toHaveBeenCalledWith({ sourceType: "game", sourceId: 42 });
  expect(status).toHaveBeenCalledWith("game", 42);
  expect(hook.result.current.data?.projectionLagSeconds).toBe(4);
  session.id = "actor";
  hook.rerender({ id: "42", type: StatisticsSourceRequestDto.sourceType.GAME });
  await waitFor(() => expect(hook.result.current.data?.isLiked).toBe(true));
  const id = "123e4567-e89b-12d3-a456-426614174000";
  hook.rerender({
    id,
    type: StatisticsSourceRequestDto.sourceType.REVIEW_COMMENT,
  });
  await waitFor(() =>
    expect(status).toHaveBeenCalledWith("review_comment", id),
  );
  hook.rerender({
    id: "1.2",
    type: StatisticsSourceRequestDto.sourceType.GAME,
  });
  expect(hook.result.current.fetchStatus).toBe("idle");
});

it("reports failed reads instead of inventing statistics", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  vi.spyOn(
    StatisticsService,
    "statisticsControllerFindSummaryV1",
  ).mockRejectedValue(new Error("missing"));
  vi.spyOn(
    StatisticsService,
    "statisticsControllerGetStatusV1",
  ).mockResolvedValue({
    isLiked: false,
    isViewed: false,
  } as unknown as import("@repo/wrapper/server").StatisticsStatusDto);
  const hook = renderHook(
    () => useItemStatistics(42, StatisticsSourceRequestDto.sourceType.GAME),
    { wrapper },
  );
  await waitFor(() => expect(hook.result.current.isError).toBe(true));
  expect(hook.result.current.data).toBeUndefined();
});

it("seeds empty activity cache without initial requests on web or mobile defaults and does not invent summary fields", () => {
  session.id = "user-1";
  const activityId = "123e4567-e89b-12d3-a456-426614174010";
  const summary = vi.spyOn(
    StatisticsService,
    "statisticsControllerFindSummaryV1",
  );
  const status = vi.spyOn(StatisticsService, "statisticsControllerGetStatusV1");

  const webClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, refetchOnMount: false },
    },
  });
  const webHook = renderHook(
    () =>
      useItemStatistics(
        activityId,
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        { likesCount: 0, isLiked: false },
      ),
    {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={webClient}>{children}</QueryClientProvider>
      ),
    },
  );
  expect(webHook.result.current.data).toEqual({
    likesCount: 0,
    isLiked: false,
  });
  expect(summary).not.toHaveBeenCalled();
  expect(status).not.toHaveBeenCalled();

  const mobileClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        gcTime: Infinity,
      },
    },
  });
  const mobileHook = renderHook(
    () =>
      useItemStatistics(
        activityId,
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        { likesCount: 3, isLiked: true },
      ),
    {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={mobileClient}>
          {children}
        </QueryClientProvider>
      ),
    },
  );
  expect(mobileHook.result.current.data).toEqual({
    likesCount: 3,
    isLiked: true,
  });
  const cached = mobileClient.getQueryData([
    "statistics",
    StatisticsSourceRequestDto.sourceType.ACTIVITY,
    activityId,
    "user-1",
  ]);
  expect(cached).toEqual({ likesCount: 3, isLiked: true });
  expect(cached).not.toHaveProperty("viewsCount");
  expect(cached).not.toHaveProperty("projectionLagSeconds");
  expect(summary).not.toHaveBeenCalled();
  expect(status).not.toHaveBeenCalled();
});

it("preserves populated cache over stale embedded activity statistics", () => {
  session.id = "user-1";
  const activityId = "123e4567-e89b-12d3-a456-426614174011";
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnMount: true },
    },
  });
  const existing = {
    likesCount: 9,
    isLiked: true,
    viewsCount: 30,
    isViewed: true,
    projectionLagSeconds: 5,
  };
  client.setQueryData(
    [
      "statistics",
      StatisticsSourceRequestDto.sourceType.ACTIVITY,
      activityId,
      "user-1",
    ],
    existing,
  );
  const summary = vi.spyOn(
    StatisticsService,
    "statisticsControllerFindSummaryV1",
  );
  const status = vi.spyOn(StatisticsService, "statisticsControllerGetStatusV1");

  const hook = renderHook(
    () =>
      useItemStatistics(
        activityId,
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        { likesCount: 2, isLiked: false },
      ),
    {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    },
  );

  expect(hook.result.current.data).toEqual(existing);
  expect(summary).not.toHaveBeenCalled();
  expect(status).not.toHaveBeenCalled();
});

it("never leaks seeded activity statistics across actor changes", async () => {
  session.id = "user-1";
  const activityId = "123e4567-e89b-12d3-a456-426614174012";
  const embeddedStats = { likesCount: 5, isLiked: true };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const summary = vi
    .spyOn(StatisticsService, "statisticsControllerFindSummaryV1")
    .mockResolvedValue({
      viewsCount: 10,
      likesCount: 5,
      projectionLagSeconds: 1,
    } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
  const status = vi
    .spyOn(StatisticsService, "statisticsControllerGetStatusV1")
    .mockImplementation((async () => ({
      isLiked: false,
      isViewed: false,
    })) as unknown as typeof StatisticsService.statisticsControllerGetStatusV1);

  const hook = renderHook(
    () =>
      useItemStatistics(
        activityId,
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        embeddedStats,
      ),
    { wrapper },
  );

  expect(hook.result.current.data).toEqual({ likesCount: 5, isLiked: true });
  expect(summary).not.toHaveBeenCalled();

  session.id = "user-2";
  hook.rerender();

  await waitFor(() => expect(summary).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(hook.result.current.data?.isLiked).toBe(false));
  expect(
    client.getQueryData([
      "statistics",
      StatisticsSourceRequestDto.sourceType.ACTIVITY,
      activityId,
      "user-1",
    ]),
  ).toEqual({ likesCount: 5, isLiked: true });

  hook.unmount();

  session.id = undefined;
  renderHook(
    () =>
      useItemStatistics(
        activityId,
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        embeddedStats,
      ),
    { wrapper },
  );
  await waitFor(() => expect(summary).toHaveBeenCalledTimes(2));
  expect(status).toHaveBeenCalledTimes(2);
});

it("falls back to fetching when initialStatistics is missing and leaves non-activity sources unaffected", async () => {
  session.id = "user-1";
  const activityId = "123e4567-e89b-12d3-a456-426614174013";
  const reviewId = "123e4567-e89b-12d3-a456-426614174014";
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  const summary = vi
    .spyOn(StatisticsService, "statisticsControllerFindSummaryV1")
    .mockResolvedValue({
      viewsCount: 2,
      likesCount: 7,
      projectionLagSeconds: 1,
    } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
  const status = vi
    .spyOn(StatisticsService, "statisticsControllerGetStatusV1")
    .mockResolvedValue({
      isLiked: false,
      isViewed: false,
    } as unknown as import("@repo/wrapper/server").StatisticsStatusDto);

  const fallbackHook = renderHook(
    () =>
      useItemStatistics(
        activityId,
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        undefined,
      ),
    { wrapper },
  );
  expect(fallbackHook.result.current.data).toBeUndefined();
  await waitFor(() =>
    expect(fallbackHook.result.current.data?.likesCount).toBe(7),
  );
  expect(summary).toHaveBeenCalledTimes(1);
  expect(status).toHaveBeenCalledTimes(1);

  const nonActivityHook = renderHook(
    () =>
      useItemStatistics(
        reviewId,
        StatisticsSourceRequestDto.sourceType.REVIEW,
        { likesCount: 99, isLiked: true },
      ),
    { wrapper },
  );
  expect(nonActivityHook.result.current.data).toBeUndefined();
  await waitFor(() =>
    expect(nonActivityHook.result.current.data?.likesCount).toBe(7),
  );
  expect(summary).toHaveBeenCalledTimes(2);
  expect(status).toHaveBeenCalledTimes(2);
});
