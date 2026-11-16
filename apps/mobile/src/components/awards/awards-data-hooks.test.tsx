// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  AwardsService,
  type AwardsBallotDto,
  type AwardsCategoryResult,
  type AwardsEventDto,
  type CurrentAwardsEventDto,
} from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import {
  CURRENT_AWARDS_EVENT_STALE_TIME,
  useCurrentAwardsEvent,
} from "../../../../../packages/ui/src/components/awards/hooks/useCurrentAwardsEvent";
import {
  AWARDS_BALLOT_STALE_TIME,
  useAwardsBallot,
} from "../../../../../packages/ui/src/components/awards/hooks/useAwardsBallot";
import { useAwardsNominations } from "../../../../../packages/ui/src/components/awards/hooks/useAwardsNominations";
import { useAwardsSharedVotes } from "../../../../../packages/ui/src/components/awards/hooks/useAwardsSharedVotes";
import { useAwardsResults } from "../../../../../packages/ui/src/components/awards/hooks/useAwardsResults";
import { useAwardsScoreboard } from "../../../../../packages/ui/src/components/awards/hooks/useAwardsScoreboard";
import { useAwardsVoteMutation } from "../../../../../packages/ui/src/components/awards/hooks/useAwardsVoteMutation";
import { useAwardsNominationsMutation } from "../../../../../packages/ui/src/components/awards/hooks/useAwardsNominationsMutation";
import { useAwardEvent } from "../../../../../packages/ui/src/components/awards/hooks/useAwardEvent";
import {
  getAwardEventQueryKey,
  getAwardsBallotQueryKey,
  getAwardsNominationsQueryKey,
  getAwardsResultsQueryKey,
  getAwardsScoreboardQueryKey,
  getAwardsSharedVotesQueryKey,
  getCurrentAwardsEventQueryKey,
} from "../../../../../packages/ui/src/components/awards/hooks/awardsQueryKeys";
import type {
  AwardsBallot,
  AwardsMyNominations,
} from "../../../../../packages/ui/src/components/awards/types";

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
      url: "/v1/awards",
      body: { message: `awards error ${status}` },
      ok: false,
    },
    `awards error ${status}`,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const CURRENT_EVENT = {
  id: 12,
  year: 2026,
  phase: "nominations",
  categoriesCount: 12,
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-11-15T12:00:00.000Z",
  deletedAt: null,
  votingStartDate: "2026-12-01T00:00:00.000Z",
  votingEndDate: "2026-12-20T23:59:59.000Z",
  resultsDate: "2026-12-27T00:00:00.000Z",
  nominationStartDate: "2026-11-20T00:00:00.000Z",
  nominationEndDate: "2026-11-28T23:59:59.000Z",
  eligibilityCutoffDate: "2026-11-30T00:00:00.000Z",
} as unknown as CurrentAwardsEventDto;

function buildBallot(): AwardsBallotDto {
  return {
    eventId: 12,
    year: 2026,
    phase: "voting",
    categoriesVoted: 1,
    categoriesTotal: 2,
    categories: [
      {
        id: 40,
        name: "Jogo do Ano",
        description: "O prêmio principal.",
        order: 0,
        isPersonalGOTY: false,
        voteGameId: 101,
        playedNomineesCount: 1,
        suggestedGameId: null,
        nominees: [
          {
            gameId: 101,
            status: "played",
            playtimeSeconds: 309600,
            rating: 4.5,
          },
          {
            gameId: 102,
            status: "planned",
            playtimeSeconds: 0,
            rating: null,
          },
        ],
      },
      {
        id: 41,
        name: "Direção de Arte",
        description: "Arte.",
        order: 1,
        isPersonalGOTY: false,
        voteGameId: null,
        playedNomineesCount: 0,
        suggestedGameId: null,
        nominees: [],
      },
    ],
  } as unknown as AwardsBallotDto;
}

function buildBallotCache(): AwardsBallot {
  return {
    eventId: 12,
    year: 2026,
    phase: "voting",
    categoriesVoted: 1,
    categoriesTotal: 2,
    categories: [
      {
        id: 40,
        name: "Jogo do Ano",
        description: "O prêmio principal.",
        translations: [],
        order: 0,
        isPersonalGOTY: false,
        voteGameId: 101,
        playedNomineesCount: 1,
        suggestedGameId: null,
        nominees: [
          {
            gameId: 101,
            status: "played",
            playtimeSeconds: 309600,
            rating: 4.5,
          },
        ],
      },
      {
        id: 41,
        name: "Direção de Arte",
        description: "Arte.",
        translations: [],
        order: 1,
        isPersonalGOTY: false,
        voteGameId: null,
        playedNomineesCount: 0,
        suggestedGameId: null,
        nominees: [],
      },
    ],
  };
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

describe("useCurrentAwardsEvent", () => {
  it("narrows a 200 response and keeps the event fresh for 5 minutes", async () => {
    vi.spyOn(
      AwardsService,
      "awardsControllerGetCurrentEventV1",
    ).mockResolvedValue(CURRENT_EVENT);

    const client = createClient();
    const hook = renderHook(() => useCurrentAwardsEvent(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(
      client.getQueryCache().find({
        queryKey: getCurrentAwardsEventQueryKey(),
      }),
    ).toBeDefined();
    expect(hook.result.current.data?.phase).toBe("nominations");
    expect(hook.result.current.data?.categoriesCount).toBe(12);

    const options = client.getQueryCache().find({
      queryKey: ["awards", "event", "current"],
    })?.options as unknown as { staleTime?: unknown } | undefined;
    expect(options?.staleTime).toBe(CURRENT_AWARDS_EVENT_STALE_TIME);
    expect(CURRENT_AWARDS_EVENT_STALE_TIME).toBe(5 * 60 * 1000);
  });

  it("turns the curated 404 into null without retrying or erroring", async () => {
    const getCurrent = vi
      .spyOn(AwardsService, "awardsControllerGetCurrentEventV1")
      .mockRejectedValue(apiError(404));

    const client = createClient();
    const hook = renderHook(() => useCurrentAwardsEvent(), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(hook.result.current.data).toBeNull();
    expect(hook.result.current.error).toBeNull();
    expect(getCurrent).toHaveBeenCalledTimes(1);
  });
});

describe("useAwardEvent", () => {
  it("exposes the server phase instead of a date guess", async () => {
    vi.spyOn(
      AwardsService,
      "awardsControllerGetEventsByYearV1",
    ).mockResolvedValue({
      ...(CURRENT_EVENT as unknown as AwardsEventDto),
      phase: "voting",
    } as unknown as AwardsEventDto);

    const client = createClient();
    const hook = renderHook(() => useAwardEvent({ eventYear: 2026 }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(hook.result.current.data?.phase).toBe("voting");
    expect(
      client.getQueryCache().find({
        queryKey: getAwardEventQueryKey({ eventYear: 2026 }),
      }),
    ).toBeDefined();
  });
});

describe("useAwardsBallot", () => {
  it("stays disabled without a session", async () => {
    const getBallot = vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetBallotV1",
    );

    const hook = renderHook(() => useAwardsBallot(12), {
      wrapper: createWrapper(createClient()),
    });

    expect(hook.result.current.queryKey).toEqual([
      "awards",
      12,
      "ballot",
      null,
    ]);
    expect(hook.result.current.isPending).toBe(true);
    expect(getBallot).not.toHaveBeenCalled();
  });

  it("reads and narrows the ballot for a signed-in user", async () => {
    session.userId = "user-1";
    const getBallot = vi
      .spyOn(AwardsService, "awardsBallotControllerGetBallotV1")
      .mockResolvedValue(buildBallot());

    const client = createClient();
    const hook = renderHook(() => useAwardsBallot(12), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(getBallot).toHaveBeenCalledWith(12);
    expect(hook.result.current.queryKey).toEqual([
      "awards",
      12,
      "ballot",
      "user-1",
    ]);
    expect(hook.result.current.data?.phase).toBe("voting");
    expect(hook.result.current.data?.categories[0]?.nominees[0]).toEqual({
      gameId: 101,
      status: "played",
      playtimeSeconds: 309600,
      rating: 4.5,
    });

    const options = client.getQueryCache().find({
      queryKey: ["awards", 12, "ballot", "user-1"],
    })?.options as unknown as { staleTime?: unknown } | undefined;
    expect(options?.staleTime).toBe(AWARDS_BALLOT_STALE_TIME);
    expect(AWARDS_BALLOT_STALE_TIME).toBe(60 * 1000);
  });

  it("invalidates its own key", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetBallotV1",
    ).mockResolvedValue(buildBallot());

    const client = createClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useAwardsBallot(12), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    act(() => hook.result.current.invalidate());

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["awards", 12, "ballot", "user-1"],
    });
  });
});

describe("useAwardsNominations", () => {
  it("stays disabled without a session", () => {
    const getNominations = vi.spyOn(
      AwardsService,
      "awardsNominationControllerGetMyNominationsV1",
    );

    const hook = renderHook(() => useAwardsNominations(12), {
      wrapper: createWrapper(createClient()),
    });

    expect(hook.result.current.queryKey).toEqual([
      "awards",
      12,
      "nominations",
      null,
    ]);
    expect(getNominations).not.toHaveBeenCalled();
  });

  it("narrows nominations/me into categories with game ids", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsNominationControllerGetMyNominationsV1",
    ).mockResolvedValue([
      { categoryId: 41, gameIds: [101, 102] },
      { categoryId: 42, gameIds: [] },
    ]);

    const hook = renderHook(() => useAwardsNominations(12), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(hook.result.current.data).toEqual([
      { categoryId: 41, gameIds: [101, 102] },
      { categoryId: 42, gameIds: [] },
    ]);
  });
});

describe("useAwardsSharedVotes", () => {
  it("reads public votes for the shared ballot without a session", async () => {
    session.userId = undefined;
    const getVotes = vi
      .spyOn(AwardsService, "awardsBallotControllerGetVotesByUserIdV1")
      .mockResolvedValue([
        { categoryId: 40, gameId: 101 },
        { categoryId: 41, gameId: 207 },
      ]);

    const client = createClient();
    const hook = renderHook(() => useAwardsSharedVotes(12, "someone"), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(getVotes).toHaveBeenCalledWith(12, "someone");
    expect(
      client.getQueryCache().find({
        queryKey: getAwardsSharedVotesQueryKey(12, "someone"),
      }),
    ).toBeDefined();
    expect(hook.result.current.data).toEqual([
      { categoryId: 40, gameId: 101 },
      { categoryId: 41, gameId: 207 },
    ]);
  });

  it("stays disabled without a target user", () => {
    const getVotes = vi.spyOn(
      AwardsService,
      "awardsBallotControllerGetVotesByUserIdV1",
    );

    renderHook(() => useAwardsSharedVotes(12, undefined), {
      wrapper: createWrapper(createClient()),
    });

    expect(getVotes).not.toHaveBeenCalled();
  });
});

describe("useAwardsResults", () => {
  it("reads the public results", async () => {
    const results = [
      { id: 7001, categoryId: 42, winners: [] },
    ] as unknown as AwardsCategoryResult[];
    const getResults = vi
      .spyOn(AwardsService, "awardsControllerGetResultsByEventIdV1")
      .mockResolvedValue(results);

    const client = createClient();
    const hook = renderHook(() => useAwardsResults(12), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(getResults).toHaveBeenCalledWith(12);
    expect(
      client.getQueryCache().find({
        queryKey: getAwardsResultsQueryKey(12),
      }),
    ).toBeDefined();
    expect(hook.result.current.data).toEqual(results);
  });
});

describe("useAwardsScoreboard", () => {
  const scoreboard = {
    totals: { hits: 7, voted: 8, scorable: 11 },
    categories: [
      {
        categoryId: 42,
        votedGameId: 101,
        winningGameId: 101,
        outcome: "hit",
      },
      {
        categoryId: 43,
        votedGameId: null,
        winningGameId: 207,
        outcome: "not_voted",
      },
    ],
    personalGOTY: { gameId: 103, otherUsersCount: 312 },
  };

  it("stays disabled without a user id", () => {
    const getScoreboard = vi.spyOn(
      AwardsService,
      "awardsControllerGetScoreboardV1",
    );

    const hook = renderHook(() => useAwardsScoreboard(12, undefined), {
      wrapper: createWrapper(createClient()),
    });

    expect(hook.result.current.isPending).toBe(true);
    expect(getScoreboard).not.toHaveBeenCalled();
  });

  it("narrows a 200 scoreboard", async () => {
    const getScoreboard = vi
      .spyOn(AwardsService, "awardsControllerGetScoreboardV1")
      .mockResolvedValue(scoreboard);

    const hook = renderHook(() => useAwardsScoreboard(12, "user-1"), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(getScoreboard).toHaveBeenCalledWith(12, "user-1");
    expect(hook.result.current.data).toEqual(scoreboard);
    expect(hook.result.current.data?.categories[0]?.outcome).toBe("hit");
    expect(hook.result.current.data?.personalGOTY).toEqual({
      gameId: 103,
      otherUsersCount: 312,
    });
  });

  it("turns the 404 before results into null", async () => {
    const getScoreboard = vi
      .spyOn(AwardsService, "awardsControllerGetScoreboardV1")
      .mockRejectedValue(apiError(404));

    const hook = renderHook(() => useAwardsScoreboard(12, "user-1"), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(hook.result.current.data).toBeNull();
    expect(hook.result.current.error).toBeNull();
    expect(getScoreboard).toHaveBeenCalledTimes(1);
  });
});

describe("Awards query keys", () => {
  it("matches the design §2 table", () => {
    expect(getCurrentAwardsEventQueryKey()).toEqual([
      "awards",
      "event",
      "current",
    ]);
    expect(getAwardEventQueryKey({ eventYear: 2026, eventId: 12 })).toEqual([
      "awards",
      "event",
      2026,
      12,
    ]);
    expect(getAwardsBallotQueryKey(12, "user-1")).toEqual([
      "awards",
      12,
      "ballot",
      "user-1",
    ]);
    expect(getAwardsNominationsQueryKey(12, "user-1")).toEqual([
      "awards",
      12,
      "nominations",
      "user-1",
    ]);
    expect(getAwardsSharedVotesQueryKey(12, "user-1")).toEqual([
      "awards",
      12,
      "votes",
      "user-1",
    ]);
    expect(getAwardsResultsQueryKey(12)).toEqual(["awards", 12, "results"]);
    expect(getAwardsScoreboardQueryKey(12, "user-1")).toEqual([
      "awards",
      12,
      "scoreboard",
      "user-1",
    ]);
  });
});

describe("useAwardsVoteMutation", () => {
  it("optimistically sets voteGameId and categoriesVoted without touching playedNomineesCount", async () => {
    session.userId = "user-1";
    const post = deferred<void>();
    const register = vi
      .spyOn(AwardsService, "awardsVoteControllerRegisterVoteV1")
      .mockReturnValue(post.promise as never);

    const client = createClient();
    const queryKey = ["awards", 12, "ballot", "user-1"];
    client.setQueryData<AwardsBallot>(queryKey, buildBallotCache());
    const invalidateQueries = vi.spyOn(client, "invalidateQueries");

    const hook = renderHook(() => useAwardsVoteMutation(12), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      hook.result.current.mutate({ categoryId: 41, gameId: 205 });
    });

    const optimistic = client.getQueryData<AwardsBallot>(queryKey);
    expect(optimistic?.categoriesVoted).toBe(2);
    expect(optimistic?.categories[1]?.voteGameId).toBe(205);
    expect(optimistic?.categories[1]?.playedNomineesCount).toBe(0);
    expect(optimistic?.categories[0]?.voteGameId).toBe(101);

    post.resolve();
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

    expect(register).toHaveBeenCalledWith({ categoryId: 41, gameId: 205 });
    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey }),
    );
  });

  it("rolls the ballot back and notifies when the vote is rejected", async () => {
    session.userId = "user-1";
    vi.spyOn(
      AwardsService,
      "awardsVoteControllerRegisterVoteV1",
    ).mockRejectedValue(apiError(400));

    const client = createClient();
    const queryKey = ["awards", 12, "ballot", "user-1"];
    client.setQueryData<AwardsBallot>(queryKey, buildBallotCache());

    const hook = renderHook(() => useAwardsVoteMutation(12), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      hook.result.current.mutate({ categoryId: 41, gameId: 205 });
    });

    await waitFor(() => expect(hook.result.current.isError).toBe(true));

    const restored = client.getQueryData<AwardsBallot>(queryKey);
    expect(restored?.categoriesVoted).toBe(1);
    expect(restored?.categories[1]?.voteGameId).toBeNull();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" }),
    );
  });
});

describe("useAwardsNominationsMutation", () => {
  it("optimistically replaces one category and rolls back on failure", async () => {
    session.userId = "user-1";
    const request = deferred<void>();
    vi.spyOn(
      AwardsService,
      "awardsNominationControllerReplaceNominationsV1",
    ).mockReturnValue(request.promise as never);

    const client = createClient();
    const queryKey = ["awards", 12, "nominations", "user-1"];
    client.setQueryData<AwardsMyNominations[]>(queryKey, [
      { categoryId: 41, gameIds: [101] },
      { categoryId: 42, gameIds: [] },
    ]);

    const hook = renderHook(() => useAwardsNominationsMutation(12), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      hook.result.current.mutate({ categoryId: 42, gameIds: [205, 206] });
    });

    expect(client.getQueryData<AwardsMyNominations[]>(queryKey)).toEqual([
      { categoryId: 41, gameIds: [101] },
      { categoryId: 42, gameIds: [205, 206] },
    ]);

    request.reject(apiError(400));
    await waitFor(() => expect(hook.result.current.isError).toBe(true));

    expect(client.getQueryData<AwardsMyNominations[]>(queryKey)).toEqual([
      { categoryId: 41, gameIds: [101] },
      { categoryId: 42, gameIds: [] },
    ]);
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ color: "red" }),
    );
  });
});
