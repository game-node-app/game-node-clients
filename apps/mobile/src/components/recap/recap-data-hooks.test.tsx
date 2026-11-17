// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  RecapService,
  type RecapCurrentDto,
  type RecapGoalDto,
  type RecapStatusDto,
  type YearRecapDto,
} from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import {
  CURRENT_RECAP_WINDOW_STALE_TIME,
  useCurrentRecapWindow,
} from "../../../../../packages/ui/src/components/recap/hooks/useCurrentRecapWindow";
import { useRecapStatus } from "../../../../../packages/ui/src/components/recap/hooks/useRecapStatus";
import { useRecapGoal } from "../../../../../packages/ui/src/components/recap/hooks/useRecapGoal";
import { useRecapGoalMutation } from "../../../../../packages/ui/src/components/recap/hooks/useRecapGoalMutation";
import { useRecap } from "../../../../../packages/ui/src/components/recap/hooks/useRecap";
import type { YearRecap } from "../../../../../packages/ui/src/components/recap/types";
import {
  getCurrentRecapWindowQueryKey,
  getRecapGoalQueryKey,
  getRecapQueryKey,
  getRecapStatusQueryKey,
} from "../../../../../packages/ui/src/components/recap/hooks/recapQueryKeys";

const session = vi.hoisted(() => ({
  userId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.userId }),
);

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/recap",
      body: { message: `recap error ${status}` },
      ok: false,
    },
    `recap error ${status}`,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  session.userId = undefined;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.userId = undefined;
});

describe("useCurrentRecapWindow", () => {
  it("narrows the phase and refreshes it every 5 minutes", async () => {
    vi.spyOn(
      RecapService,
      "recapControllerGetCurrentRecapV1",
    ).mockResolvedValue({
      year: 2026,
      phase: "live",
      opensAt: "2026-11-15T00:00:00.000Z",
      closesAt: "2027-01-01T00:00:00.000Z",
    } as unknown as RecapCurrentDto);

    const client = createClient();
    const hook = renderHook(() => useCurrentRecapWindow(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(
      client.getQueryCache().find({
        queryKey: getCurrentRecapWindowQueryKey(),
      }),
    ).toBeDefined();
    expect(hook.result.current.data?.phase).toBe("live");
    expect(hook.result.current.data?.year).toBe(2026);

    const options = client.getQueryCache().find({
      queryKey: ["recap", "current"],
    })?.options as unknown as { staleTime?: unknown } | undefined;
    expect(options?.staleTime).toBe(CURRENT_RECAP_WINDOW_STALE_TIME);
    expect(CURRENT_RECAP_WINDOW_STALE_TIME).toBe(5 * 60 * 1000);
  });
});

describe("useRecapStatus", () => {
  it("exposes the server phase for the requested year", async () => {
    vi.spyOn(RecapService, "recapControllerGetRecapStatusV1").mockResolvedValue(
      {
        isRecapCreated: true,
        isRecapEligible: true,
        phase: "closed",
      } as unknown as RecapStatusDto,
    );

    const client = createClient();
    const hook = renderHook(() => useRecapStatus("user-1", 2025), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(
      client.getQueryCache().find({
        queryKey: getRecapStatusQueryKey("user-1", 2025, null),
      }),
    ).toBeDefined();
    expect(hook.result.current.data).toEqual({
      isRecapCreated: true,
      isRecapEligible: true,
      phase: "closed",
    });
  });
});

describe("useRecapGoal", () => {
  it("stays disabled without a session", () => {
    const getGoal = vi.spyOn(RecapService, "recapControllerGetGoalV1");

    const hook = renderHook(() => useRecapGoal(2027), {
      wrapper: createWrapper(createClient()),
    });

    expect(hook.result.current.isPending).toBe(true);
    expect(getGoal).not.toHaveBeenCalled();
  });

  it("reads the goal and progress for the signed-in user", async () => {
    session.userId = "user-1";
    const getGoal = vi
      .spyOn(RecapService, "recapControllerGetGoalV1")
      .mockResolvedValue({ year: 2027, target: 18, finished: 5 });

    const client = createClient();
    const hook = renderHook(() => useRecapGoal(2027), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(getGoal).toHaveBeenCalledWith(2027);
    expect(
      client.getQueryCache().find({
        queryKey: getRecapGoalQueryKey(2027, "user-1"),
      }),
    ).toBeDefined();
    expect(hook.result.current.data).toEqual({
      year: 2027,
      target: 18,
      finished: 5,
    });
  });
});

describe("Recap query keys", () => {
  it("matches the design §2 table", () => {
    expect(getCurrentRecapWindowQueryKey()).toEqual(["recap", "current"]);
    expect(getRecapStatusQueryKey("user-1", 2026, "viewer-1")).toEqual([
      "recap",
      "status",
      "user-1",
      2026,
      "viewer-1",
    ]);
    expect(getRecapQueryKey(2026, "user-1", "viewer-1")).toEqual([
      "recap",
      2026,
      "user-1",
      "viewer-1",
    ]);
    expect(getRecapGoalQueryKey(2027, "user-1")).toEqual([
      "recap",
      "goals",
      2027,
      "user-1",
    ]);
  });
});

describe("useRecapGoalMutation", () => {
  it("stores the response in the goal cache", async () => {
    session.userId = "user-1";
    const goal: RecapGoalDto = { year: 2027, target: 18, finished: 5 };
    const setGoal = vi
      .spyOn(RecapService, "recapControllerSetGoalV1")
      .mockResolvedValue(goal);

    const client = createClient();
    const queryKey = ["recap", "goals", 2027, "user-1"];
    client.setQueryData<RecapGoalDto>(queryKey, {
      year: 2027,
      target: 12,
      finished: 5,
    });

    const hook = renderHook(() => useRecapGoalMutation(2027), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      hook.result.current.mutate({ target: 18 });
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(setGoal).toHaveBeenCalledWith(2027, { target: 18 });
    expect(client.getQueryData<RecapGoalDto>(queryKey)).toEqual(goal);
  });

  it("keeps the previous goal and notifies when saving fails", async () => {
    session.userId = "user-1";
    vi.spyOn(RecapService, "recapControllerSetGoalV1").mockRejectedValue(
      apiError(400),
    );

    const client = createClient();
    const queryKey = ["recap", "goals", 2027, "user-1"];
    const previous: RecapGoalDto = { year: 2027, target: 12, finished: 5 };
    client.setQueryData<RecapGoalDto>(queryKey, previous);

    const hook = renderHook(() => useRecapGoalMutation(2027), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      hook.result.current.mutate({ target: 18 });
    });

    await waitFor(() => expect(hook.result.current.isError).toBe(true));

    expect(client.getQueryData<RecapGoalDto>(queryKey)).toEqual(previous);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" }),
    );
  });
});

describe("useRecap", () => {
  function recapDto(): YearRecapDto {
    return {
      id: 1,
      year: 2026,
      profileUserId: "user-1",
      totalPlayedGames: 41,
      totalPlaytimeSeconds: 1483200,
      totalAddedGames: 60,
      totalFinishedGames: 14,
      totalDroppedGames: 3,
      isFinal: false,
      dailyPlaytimeSeconds: null,
      communityHighlights: {
        minority: {
          gameId: 101,
          userRating: 2,
          communityAverage: 4.2,
          reviewCount: 120,
          beyondShare: 0.06,
          sameRangeCount: 4,
        },
        inTune: null,
      },
      totalReviewsCreated: 3,
      totalCollectionsCreated: 1,
      totalFollowersGained: 2,
      totalLikesPerformed: 10,
      likesHistoryComplete: true,
      likesCompleteSince: null,
      playedGames: [],
      playedGamesByPlatform: [],
      distributionByGenre: [],
      distributionByMode: [],
      distributionByTheme: [],
      distributionByPlatform: [],
      backlogGrowth: 43,
      calendar: null,
      topGames: [],
      playtimeByPlatform: [],
      genres: [],
      themes: [],
      modes: [],
      platforms: [],
      createdAt: "2026-11-16T00:00:00.000Z",
      updatedAt: "2026-11-16T00:00:00.000Z",
      deletedAt: null,
    } as unknown as YearRecapDto;
  }

  it("does not read the Recap until the caller enables it", () => {
    session.userId = "user-1";
    const getRecap = vi.spyOn(RecapService, "recapControllerGetRecapByYearV1");

    renderHook(() => useRecap("user-1", 2026, { enabled: false }), {
      wrapper: createWrapper(createClient()),
    });

    expect(getRecap).not.toHaveBeenCalled();
  });

  it("uses the year-first key and narrows communityHighlights", async () => {
    session.userId = "user-1";
    const getRecap = vi
      .spyOn(RecapService, "recapControllerGetRecapByYearV1")
      .mockResolvedValue(recapDto());

    const client = createClient();
    const hook = renderHook(() => useRecap("user-1", 2026), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(getRecap).toHaveBeenCalledWith("user-1", 2026);
    expect(
      client
        .getQueryCache()
        .find({ queryKey: getRecapQueryKey(2026, "user-1", "user-1") }),
    ).toBeDefined();

    const data = hook.result.current.data as YearRecap;
    expect(data.communityHighlights?.minority?.gameId).toBe(101);
    expect(data.communityHighlights?.minority?.beyondShare).toBe(0.06);
    expect(data.communityHighlights?.inTune).toBeNull();
  });

  it("never retries a 404 from a hidden library, but retries transient errors", () => {
    session.userId = "viewer-1";
    vi.spyOn(RecapService, "recapControllerGetRecapByYearV1").mockReturnValue(
      new Promise(() => {}) as never,
    );

    const client = createClient();
    renderHook(() => useRecap("user-1", 2026), {
      wrapper: createWrapper(client),
    });

    const options = client
      .getQueryCache()
      .find({ queryKey: getRecapQueryKey(2026, "user-1", "viewer-1") })
      ?.options as unknown as { retry?: unknown };
    const retry = options.retry as (count: number, error: unknown) => boolean;

    expect(typeof retry).toBe("function");
    expect(retry(0, apiError(404))).toBe(false);
    expect(retry(0, apiError(500))).toBe(true);
  });
});
