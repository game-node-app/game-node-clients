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
