// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DailyPlayResponseDto, DailyService } from "@repo/wrapper/server";
import {
  dailyLocalResults,
  type DailyLocalResult,
  isDailyLocalResult,
  toDailyLocalResult,
} from "../../../../../packages/ui/src/components/daily/util/toDailyLocalResult";
import {
  computeDailyPlayStreak,
  computeDailyStats,
} from "../../../../../packages/ui/src/components/daily/util/computeDailyStats";
import { useDailyImportOnLogin } from "../../../../../packages/ui/src/components/daily/hooks/useDailyImportOnLogin";
import { shouldRefreshAfterDailyPlay } from "../../../../../packages/ui/src/components/daily/hooks/useDailyPlay";

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-1" }),
);

const TODAY = "2026-11-17";

const result = (
  puzzleId: number,
  overrides: Partial<DailyLocalResult> = {},
): DailyLocalResult => ({
  puzzleId,
  mode: DailyPlayResponseDto.mode.SPECS,
  number: puzzleId,
  date: TODAY,
  guesses: [1, 2],
  hintAt: null,
  status: DailyPlayResponseDto.status.WON,
  attempts: 2,
  finishedAt: `${TODAY}T15:00:00.000Z`,
  results: ["wrong", "correct"],
  ...overrides,
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("guest result kind", () => {
  it("treats legacy entries without kind as daily", () => {
    const legacy = result(1);
    delete legacy.kind;
    expect(isDailyLocalResult(legacy)).toBe(true);
    expect(dailyLocalResults({ 1: legacy })).toEqual([legacy]);
  });

  it("ignores weekly entries in streaks and stats", () => {
    const local = { 9: result(9, { kind: "weekly" }) };
    const daily = dailyLocalResults(local);
    expect(daily).toEqual([]);
    expect(computeDailyPlayStreak(daily, TODAY)).toBe(0);
    expect(computeDailyStats(daily, 10, TODAY).played).toBe(0);
    // Without the filter the weekly play would have counted.
    expect(computeDailyPlayStreak(Object.values(local), TODAY)).toBe(1);
  });

  it("stores the kind from the play", () => {
    const response = {
      puzzleId: 9,
      mode: DailyPlayResponseDto.mode.SPECS,
      number: 7,
      date: TODAY,
      maxAttempts: 10,
      attempts: 1,
      status: DailyPlayResponseDto.status.WON,
      feedback: [],
      hints: { imageTokens: [], keywords: [] },
      hintAvailable: false,
      hintAt: null,
    } as unknown as DailyPlayResponseDto;
    expect(toDailyLocalResult(response, undefined, "weekly").kind).toBe(
      "weekly",
    );
    expect(toDailyLocalResult(response).kind).toBe("daily");
  });

  it("still imports finished weekly plays on sign-in", async () => {
    localStorage.setItem(
      "gamenode-daily-results",
      JSON.stringify({
        1: result(1),
        9: result(9, { kind: "weekly" }),
        3: result(3, {
          status: DailyPlayResponseDto.status.IN_PROGRESS,
          finishedAt: null,
        }),
      }),
    );
    const importSpy = vi
      .spyOn(DailyService, "dailyControllerImportResultsV1")
      .mockResolvedValue({ imported: 2 } as never);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(() => useDailyImportOnLogin(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(importSpy).toHaveBeenCalledTimes(1));
    const ids = importSpy.mock.calls[0][0].results.map((r) => r.puzzleId);
    expect(ids.sort()).toEqual([1, 9]);
  });
});

describe("daily play refresh", () => {
  it("refreshes rankings but not the play or practice rounds", () => {
    expect(shouldRefreshAfterDailyPlay(["daily", "ranking", "list"])).toBe(
      true,
    );
    expect(shouldRefreshAfterDailyPlay(["daily", "today", "u"])).toBe(true);
    expect(shouldRefreshAfterDailyPlay(["daily", "play", 1, "u"])).toBe(false);
    expect(shouldRefreshAfterDailyPlay(["daily", "practice", "cover"])).toBe(
      false,
    );
  });
});
