// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ProfileMetricsService,
  ProfileMetricsSummaryResponseDto,
} from "@repo/wrapper/server";
import { useRecapSummary } from "../../../../../packages/ui/src/components/wrapped/hooks/useRecapSummary";
import { getRecapFigures } from "../../../../../packages/ui/src/components/wrapped/util/recapFigures";

const session = vi.hoisted(() => ({ id: undefined as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.id }),
);

const window = (totalPlaytimeSeconds: number, totalGames: number) => ({
  totalPlaytimeSeconds,
  totalGames,
});

const summary = (
  current: ReturnType<typeof window>,
  previous: ReturnType<typeof window>,
) =>
  ({
    period: "week",
    current,
    previous,
    topGames: [],
    topGenre: null,
    topPlatform: null,
    playedInPeriod: 0,
    finishedInPeriod: 0,
    reviewedInPeriod: 0,
  }) as unknown as ProfileMetricsSummaryResponseDto;

function wrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "RecapSummaryQueryClientWrapper";
  return Wrapper;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.id = undefined;
});

describe("useRecapSummary", () => {
  it("does not request anything while signed out", () => {
    const spy = vi.spyOn(
      ProfileMetricsService,
      "profileMetricsControllerGetPeriodSummaryV1",
    );

    const { result } = renderHook(() => useRecapSummary("week"), {
      wrapper: wrapper(),
    });

    expect(spy).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("loads the summary of the signed-in user for the period", async () => {
    session.id = "user-1";
    const data = summary(window(7200, 2), window(3600, 1));
    const spy = vi
      .spyOn(
        ProfileMetricsService,
        "profileMetricsControllerGetPeriodSummaryV1",
      )
      .mockResolvedValue(data as never);

    const { result } = renderHook(() => useRecapSummary("month"), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.data).toBe(data));
    expect(spy).toHaveBeenCalledWith("user-1", "month");
  });

  it("keeps the periods in separate cache entries", async () => {
    session.id = "user-1";
    const spy = vi
      .spyOn(
        ProfileMetricsService,
        "profileMetricsControllerGetPeriodSummaryV1",
      )
      .mockResolvedValue(summary(window(0, 0), window(0, 0)) as never);

    const { result, rerender } = renderHook(
      ({ period }: { period: "week" | "year" }) => useRecapSummary(period),
      {
        wrapper: wrapper(),
        initialProps: { period: "week" } as { period: "week" | "year" },
      },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ period: "year" });
    await waitFor(() => expect(spy).toHaveBeenCalledWith("user-1", "year"));
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe("getRecapFigures", () => {
  it("rounds hours to one decimal and counts games", () => {
    expect(
      getRecapFigures(summary(window(5400, 3), window(0, 0))),
    ).toMatchObject({ hours: 1.5, games: 3, hasActivity: true });
  });

  it("reports growth against the previous period", () => {
    expect(
      getRecapFigures(summary(window(7200, 1), window(3600, 1))).changePercent,
    ).toBe(100);
  });

  it("reports a decline as a negative percentage", () => {
    expect(
      getRecapFigures(summary(window(1800, 1), window(3600, 1))).changePercent,
    ).toBe(-50);
  });

  it("has no percentage when the previous period is empty", () => {
    expect(
      getRecapFigures(summary(window(3600, 1), window(0, 0))).changePercent,
    ).toBeNull();
  });

  it("flags a period without playtime", () => {
    expect(
      getRecapFigures(summary(window(0, 0), window(3600, 2))),
    ).toMatchObject({ hours: 0, changePercent: -100, hasActivity: false });
  });
});
