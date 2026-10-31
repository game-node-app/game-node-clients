// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  StatisticsService,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { useUserView } from "../../../../../packages/ui/src/components/statistics/hooks/useUserView";
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => undefined }),
);
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("deduplicates pending views and retries the original source after a lost acknowledgement", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  vi.spyOn(
    StatisticsService,
    "statisticsControllerFindSummaryV1",
  ).mockResolvedValue({
    viewsCount: 3,
    likesCount: 0,
  } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
  vi.spyOn(
    StatisticsService,
    "statisticsControllerGetStatusV1",
  ).mockResolvedValue({
    isLiked: false,
    isViewed: true,
  } as unknown as import("@repo/wrapper/server").StatisticsStatusDto);
  let reject!: (error: Error) => void;
  const view = vi
    .spyOn(StatisticsService, "statisticsControllerRecordViewV1")
    .mockImplementationOnce(
      (() =>
        new Promise((_, r) => {
          reject = r;
        })) as unknown as typeof StatisticsService.statisticsControllerRecordViewV1,
    )
    .mockResolvedValueOnce({
      accepted: true,
      viewId: "visit-a",
    } as unknown as import("@repo/wrapper/server").StatisticsViewResponseDto);
  const invalidate = vi.spyOn(client, "invalidateQueries");
  const hook = renderHook(
    ({ id }) => useUserView(id, StatisticsSourceRequestDto.sourceType.GAME),
    { initialProps: { id: 1 }, wrapper },
  );
  await waitFor(() => expect(hook.result.current[0]).toBe(3));
  act(() => {
    hook.result.current[2]("visit-a");
    hook.result.current[2]("visit-a");
  });
  await waitFor(() => expect(view).toHaveBeenCalledTimes(1));
  hook.rerender({ id: 2 });
  act(() => reject(new Error("lost acknowledgement")));
  await waitFor(() =>
    expect(client.getMutationCache().getAll()[0].state.status).toBe("error"),
  );
  act(() => hook.result.current[2]("visit-a"));
  await waitFor(() => expect(view).toHaveBeenCalledTimes(2));
  expect(view.mock.calls[0][0]).toEqual({
    sourceType: "game",
    sourceId: 1,
    viewId: "visit-a",
  });
  expect(view.mock.calls[1][0]).toEqual(view.mock.calls[0][0]);
  await waitFor(() =>
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["statistics", "game", 1],
    }),
  );
  act(() => hook.result.current[2]("visit-a"));
  expect(view).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(hook.result.current[0]).toBe(3));
});

it("does not accept a mismatched acknowledgement and allows the same view to retry", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  vi.spyOn(
    StatisticsService,
    "statisticsControllerFindSummaryV1",
  ).mockResolvedValue({
    viewsCount: 0,
  } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
  vi.spyOn(
    StatisticsService,
    "statisticsControllerGetStatusV1",
  ).mockResolvedValue({
    isViewed: false,
  } as unknown as import("@repo/wrapper/server").StatisticsStatusDto);
  const view = vi
    .spyOn(StatisticsService, "statisticsControllerRecordViewV1")
    .mockResolvedValueOnce({
      accepted: true,
      viewId: "wrong",
    } as unknown as import("@repo/wrapper/server").StatisticsViewResponseDto)
    .mockResolvedValueOnce({
      accepted: true,
      viewId: "visit",
    } as unknown as import("@repo/wrapper/server").StatisticsViewResponseDto);
  const hook = renderHook(
    () => useUserView(1, StatisticsSourceRequestDto.sourceType.GAME),
    { wrapper },
  );
  act(() => hook.result.current[2]("visit"));
  await waitFor(() =>
    expect(client.getMutationCache().getAll()[0].state.status).toBe("error"),
  );
  act(() => hook.result.current[2]("visit"));
  await waitFor(() => expect(view).toHaveBeenCalledTimes(2));
});
