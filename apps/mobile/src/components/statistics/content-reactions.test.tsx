// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity,
  ActivityResponseDto,
  FindAllCommentsDto,
  StatisticsSourceRequestDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { ItemLikesButton } from "../../../../../packages/ui/src/components/statistics/input/ItemLikesButton";
import { ActivityItemLikes } from "../../../../../packages/ui/src/components/activity/input/ActivityItemLikes";
import { CommentsListView } from "../../../../../packages/ui/src/components/comment/view/CommentsListView";
import { CommentsView } from "../../../../../packages/ui/src/components/comment/view/CommentsView";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

vi.mock("@repo/locales", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/locales")>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));

const session = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  let id: string | undefined = "user-123";
  return {
    get id() {
      return id;
    },
    set id(next: string | undefined) {
      id = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
});

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({
    useUserId: () =>
      React.useSyncExternalStore(
        session.subscribe,
        () => session.id,
        () => session.id,
      ),
  }),
);

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function renderComponent(ui: React.ReactElement, client: QueryClient) {
  return render(
    <QueryClientProvider client={client}>
      <MantineProvider>{ui}</MantineProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  session.id = "user-123";
  vi.clearAllMocks();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  session.id = "user-123";
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("renders and likes a review comment without a reviewId in its response", async () => {
  const client = createTestQueryClient();
  const reviewId = "123e4567-e89b-12d3-a456-426614174000";
  const commentId = "123e4567-e89b-12d3-a456-426614174001";
  const userId = session.id!;
  const sourceType = FindAllCommentsDto.sourceType.REVIEW;
  const commentSourceType =
    StatisticsSourceRequestDto.sourceType.REVIEW_COMMENT;
  const date = "2026-01-01T12:00:00Z";

  client.setQueryData(
    ["comments", sourceType, reviewId, 0, 10, { createdAt: "DESC" }],
    {
      data: [
        {
          id: commentId,
          content: "<p>A newly submitted comment</p>",
          profileUserId: userId,
          createdAt: date,
          updatedAt: date,
          childOfId: null,
          parentOf: null,
        },
      ],
      pagination: { totalItems: 1, totalPages: 1, hasNextPage: false },
    },
  );
  client.setQueryData(["userProfile", userId, userId], {
    userId,
    username: "Player",
  });
  client.setQueryData(["statistics", commentSourceType, commentId, userId], {
    isLiked: false,
    likesCount: 0,
  });
  const like = vi
    .spyOn(StatisticsService, "statisticsControllerAddLikeV1")
    .mockImplementation(
      () =>
        Promise.resolve({ isLiked: true, likesCount: 1 }) as ReturnType<
          typeof StatisticsService.statisticsControllerAddLikeV1
        >,
    );

  renderComponent(
    <UIProvider
      hooks={{
        useRouter: () => ({
          back: () => {},
          pathname: "/",
          push: async () => {},
          query: new URLSearchParams(),
        }),
      }}
      presenters={{
        Link: ({ href, children }) => <a href={href}>{children}</a>,
      }}
    >
      <CommentsView>
        <CommentsListView sourceId={reviewId} sourceType={sourceType} />
      </CommentsView>
    </UIProvider>,
    client,
  );

  expect(await screen.findByText("A newly submitted comment")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "actions.like" }));
  await waitFor(() => {
    expect(like).toHaveBeenCalledWith({
      sourceId: commentId,
      sourceType: commentSourceType,
    });
  });
});

describe("content reactions (useUserLike & ItemLikesButton)", () => {
  it("submits like request without targetUserId, performs optimistic update, and reconciles on success", async () => {
    const queryClient = createTestQueryClient();
    const sourceId = "123e4567-e89b-12d3-a456-426614174000";
    const sourceType = StatisticsSourceRequestDto.sourceType.REVIEW;

    queryClient.setQueryData(["statistics", sourceType, sourceId, "user-123"], {
      isLiked: false,
      likesCount: 5,
      viewsCount: 10,
      isViewed: true,
      projectionLagSeconds: 17,
    });

    let resolveAddLike!: (value: unknown) => void;
    const addLikePromise = new Promise((resolve) => {
      resolveAddLike = resolve;
    });

    const addLikeSpy = vi
      .spyOn(StatisticsService, "statisticsControllerAddLikeV1")
      .mockReturnValue(
        addLikePromise as unknown as import("@repo/wrapper/server").CancelablePromise<
          import("@repo/wrapper/server").ReactionResponseDto
        >,
      );

    renderComponent(
      <ItemLikesButton sourceId={sourceId} sourceType={sourceType} />,
      queryClient,
    );

    expect(screen.getByText("5")).toBeTruthy();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Optimistic update: likesCount is immediately incremented to 6
    await waitFor(() => {
      expect(screen.getByText("6")).toBeTruthy();
    });
    const cachedDuringMutation = queryClient.getQueryData<
      import("@repo/ui").StatisticsWithStatus
    >(["statistics", sourceType, sourceId, "user-123"]);
    expect(cachedDuringMutation?.isLiked).toBe(true);
    expect(cachedDuringMutation?.likesCount).toBe(6);

    // Verify request payload has sourceType and sourceId, and NO targetUserId
    expect(addLikeSpy).toHaveBeenCalledTimes(1);
    expect(addLikeSpy).toHaveBeenCalledWith({
      sourceId: "123e4567-e89b-12d3-a456-426614174000",
      sourceType: "review",
    });
    expect(addLikeSpy.mock.calls[0][0]).not.toHaveProperty("targetUserId");

    // Reconcile with committed server response
    resolveAddLike({
      isLiked: true,
      likesCount: 10, // Server committed count
    });

    await waitFor(() => {
      expect(screen.getByText("10")).toBeTruthy();
    });

    const cachedAfterSuccess = queryClient.getQueryData<
      import("@repo/ui").StatisticsWithStatus
    >(["statistics", sourceType, sourceId, "user-123"]);
    expect(cachedAfterSuccess?.isLiked).toBe(true);
    expect(cachedAfterSuccess?.likesCount).toBe(10);
    expect(cachedAfterSuccess?.viewsCount).toBe(10);
    expect(cachedAfterSuccess?.isViewed).toBe(true);
    expect(cachedAfterSuccess?.projectionLagSeconds).toBe(17);
  });

  it("submits unlike request without targetUserId, performs optimistic decrement, and reconciles on success", async () => {
    const queryClient = createTestQueryClient();
    const sourceId = 42; // game id
    const sourceType = StatisticsSourceRequestDto.sourceType.GAME;

    queryClient.setQueryData(["statistics", sourceType, sourceId, "user-123"], {
      isLiked: true,
      likesCount: 3,
      viewsCount: 20,
    });

    let resolveRemoveLike!: (value: unknown) => void;
    const removeLikePromise = new Promise((resolve) => {
      resolveRemoveLike = resolve;
    });

    const removeLikeSpy = vi
      .spyOn(StatisticsService, "statisticsControllerRemoveLikeV1")
      .mockReturnValue(
        removeLikePromise as unknown as import("@repo/wrapper/server").CancelablePromise<
          import("@repo/wrapper/server").ReactionResponseDto
        >,
      );

    renderComponent(
      <ItemLikesButton sourceId={sourceId} sourceType={sourceType} />,
      queryClient,
    );

    expect(screen.getByText("3")).toBeTruthy();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Optimistic update: likesCount decremented to 2
    await waitFor(() => {
      expect(screen.getByText("2")).toBeTruthy();
    });
    const cachedDuringMutation = queryClient.getQueryData<
      import("@repo/ui").StatisticsWithStatus
    >(["statistics", sourceType, sourceId, "user-123"]);
    expect(cachedDuringMutation?.isLiked).toBe(false);
    expect(cachedDuringMutation?.likesCount).toBe(2);

    // Verify request payload formats game sourceId as number and has no targetUserId
    expect(removeLikeSpy).toHaveBeenCalledTimes(1);
    expect(removeLikeSpy).toHaveBeenCalledWith({
      sourceId: 42,
      sourceType: "game",
    });
    expect(removeLikeSpy.mock.calls[0][0]).not.toHaveProperty("targetUserId");

    // Server responds with committed state
    resolveRemoveLike({
      isLiked: false,
      likesCount: 1,
    });

    await waitFor(() => {
      expect(screen.getByText("1")).toBeTruthy();
    });

    const cachedAfterSuccess = queryClient.getQueryData<
      import("@repo/ui").StatisticsWithStatus
    >(["statistics", sourceType, sourceId, "user-123"]);
    expect(cachedAfterSuccess?.isLiked).toBe(false);
    expect(cachedAfterSuccess?.likesCount).toBe(1);
  });

  it("rolls back optimistic state to previous cached values when the request fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation((() => {}) as unknown as typeof console.error);
    const queryClient = createTestQueryClient();
    const sourceId = "123e4567-e89b-12d3-a456-426614174001";
    const sourceType = StatisticsSourceRequestDto.sourceType.POST;

    queryClient.setQueryData(["statistics", sourceType, sourceId, "user-123"], {
      isLiked: false,
      likesCount: 7,
      viewsCount: 15,
      isViewed: true,
      projectionLagSeconds: 17,
    });

    vi.spyOn(
      StatisticsService,
      "statisticsControllerAddLikeV1",
    ).mockRejectedValue(new Error("Network Error"));

    renderComponent(
      <ItemLikesButton sourceId={sourceId} sourceType={sourceType} />,
      queryClient,
    );

    expect(screen.getByText("7")).toBeTruthy();

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Rolled back after failure
    await waitFor(() => {
      const cached = queryClient.getQueryData<
        import("@repo/ui").StatisticsWithStatus
      >(["statistics", sourceType, sourceId, "user-123"]);
      expect(cached?.isLiked).toBe(false);
      expect(cached?.likesCount).toBe(7);
      expect(cached?.viewsCount).toBe(15);
      expect(cached?.isViewed).toBe(true);
      expect(cached?.projectionLagSeconds).toBe(17);
      expect(screen.getByText("7")).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });
  it("shows optimistic and committed reactions while the summary has not loaded", async () => {
    const client = createTestQueryClient();
    const id = "123e4567-e89b-12d3-a456-426614174000";
    const pendingRead = new Promise(() => {});
    vi.spyOn(
      StatisticsService,
      "statisticsControllerFindSummaryV1",
    ).mockReturnValue(
      pendingRead as unknown as import("@repo/wrapper/server").CancelablePromise<
        import("@repo/wrapper/server").StatisticsSummaryDto
      >,
    );
    vi.spyOn(
      StatisticsService,
      "statisticsControllerGetStatusV1",
    ).mockReturnValue(
      pendingRead as unknown as import("@repo/wrapper/server").CancelablePromise<
        import("@repo/wrapper/server").StatisticsStatusDto
      >,
    );
    let resolveLike!: (response: unknown) => void;
    vi.spyOn(
      StatisticsService,
      "statisticsControllerAddLikeV1",
    ).mockReturnValue(
      new Promise((resolve) => {
        resolveLike = resolve;
      }) as unknown as import("@repo/wrapper/server").CancelablePromise<
        import("@repo/wrapper/server").ReactionResponseDto
      >,
    );
    renderComponent(
      <ItemLikesButton
        sourceId={id}
        sourceType={StatisticsSourceRequestDto.sourceType.REVIEW}
      />,
      client,
    );
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText("1")).toBeTruthy());
    expect(
      client.getQueryData(["statistics", "review", id, "user-123"]),
    ).toBeUndefined();
    resolveLike({ isLiked: true, likesCount: 4 });
    await waitFor(() => expect(screen.getByText("4")).toBeTruthy());
    expect(
      client.getQueryData(["statistics", "review", id, "user-123"]),
    ).toBeUndefined();
  });
});

function createMobileQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        gcTime: Infinity,
      },
      mutations: { retry: false },
    },
  });
}

function makeActivity(
  id: string,
  statistics?: { likesCount: number; isLiked: boolean } | null,
): Activity & { statistics?: { likesCount: number; isLiked: boolean } | null } {
  return {
    id,
    type: Activity.type.POST,
    profile: {} as Activity["profile"],
    profileUserId: "author-1",
    collectionEntry: null,
    collectionEntryId: null,
    collection: null,
    collectionId: null,
    review: null,
    reviewId: null,
    userFollow: null,
    userFollowId: null,
    post: null,
    postId: null,
    obtainedGameAchievementActivity: null,
    obtainedGameAchievementActivityId: null,
    obtainedAchievement: null,
    obtainedAchievementId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    statisticsTarget: null,
    statisticsTargetId: null,
    ...(statistics !== undefined ? { statistics } : {}),
  };
}

describe("activity embedded statistics (ActivityItemLikes & ItemLikesButton)", () => {
  it("renders embedded statistics without initial requests on web Infinity or mobile refetchOnMount true", () => {
    const findSummarySpy = vi.spyOn(
      StatisticsService,
      "statisticsControllerFindSummaryV1",
    );
    const getStatusSpy = vi.spyOn(
      StatisticsService,
      "statisticsControllerGetStatusV1",
    );

    const webClient = createTestQueryClient();
    const activityResponse: ActivityResponseDto = {
      ...makeActivity("act-web-1"),
      type: ActivityResponseDto.type.POST,
      game: null,
      statistics: { likesCount: 8, isLiked: true },
    };
    renderComponent(
      <ActivityItemLikes activity={activityResponse} />,
      webClient,
    );
    expect(screen.getByText("8")).toBeTruthy();

    cleanup();

    const mobileClient = createMobileQueryClient();
    renderComponent(
      <ActivityItemLikes
        activity={makeActivity("act-mobile-1", {
          likesCount: 3,
          isLiked: false,
        })}
      />,
      mobileClient,
    );
    expect(screen.getByText("3")).toBeTruthy();

    expect(findSummarySpy).not.toHaveBeenCalled();
    expect(getStatusSpy).not.toHaveBeenCalled();
    expect(
      mobileClient.getQueryData([
        "statistics",
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        "act-mobile-1",
        "user-123",
      ]),
    ).toEqual({ likesCount: 3, isLiked: false });
  });

  it("prefers populated cache over stale embedded activity statistics", () => {
    const mobileClient = createMobileQueryClient();
    const activityId = "act-cached-1";
    const cacheKey = [
      "statistics",
      StatisticsSourceRequestDto.sourceType.ACTIVITY,
      activityId,
      "user-123",
    ];
    mobileClient.setQueryData(cacheKey, {
      likesCount: 12,
      isLiked: true,
      viewsCount: 40,
      isViewed: true,
      projectionLagSeconds: 2,
    });

    const findSummarySpy = vi.spyOn(
      StatisticsService,
      "statisticsControllerFindSummaryV1",
    );
    const getStatusSpy = vi.spyOn(
      StatisticsService,
      "statisticsControllerGetStatusV1",
    );

    renderComponent(
      <ActivityItemLikes
        activity={makeActivity(activityId, { likesCount: 2, isLiked: false })}
      />,
      mobileClient,
    );

    expect(screen.getByText("12")).toBeTruthy();
    expect(findSummarySpy).not.toHaveBeenCalled();
    expect(getStatusSpy).not.toHaveBeenCalled();
    expect(mobileClient.getQueryData(cacheKey)).toEqual({
      likesCount: 12,
      isLiked: true,
      viewsCount: 40,
      isViewed: true,
      projectionLagSeconds: 2,
    });
  });

  it("optimistically updates, invalidates, and refetches on like and unlike for seeded activity", async () => {
    const mobileClient = createMobileQueryClient();
    const activityId = "act-mutate-1";
    const cacheKey = [
      "statistics",
      StatisticsSourceRequestDto.sourceType.ACTIVITY,
      activityId,
      "user-123",
    ];

    let summaryCount = 5;
    let statusLiked = false;
    const findSummarySpy = vi
      .spyOn(StatisticsService, "statisticsControllerFindSummaryV1")
      .mockImplementation((async () => ({
        likesCount: summaryCount,
        viewsCount: 11,
        projectionLagSeconds: 0,
      })) as unknown as typeof StatisticsService.statisticsControllerFindSummaryV1);
    const getStatusSpy = vi
      .spyOn(StatisticsService, "statisticsControllerGetStatusV1")
      .mockImplementation((async () => ({
        isLiked: statusLiked,
        isViewed: true,
      })) as unknown as typeof StatisticsService.statisticsControllerGetStatusV1);

    let resolveAddLike!: (value: unknown) => void;
    const addLikeSpy = vi
      .spyOn(StatisticsService, "statisticsControllerAddLikeV1")
      .mockReturnValue(
        new Promise((resolve) => {
          resolveAddLike = resolve;
        }) as unknown as import("@repo/wrapper/server").CancelablePromise<
          import("@repo/wrapper/server").ReactionResponseDto
        >,
      );

    let resolveRemoveLike!: (value: unknown) => void;
    const removeLikeSpy = vi
      .spyOn(StatisticsService, "statisticsControllerRemoveLikeV1")
      .mockReturnValue(
        new Promise((resolve) => {
          resolveRemoveLike = resolve;
        }) as unknown as import("@repo/wrapper/server").CancelablePromise<
          import("@repo/wrapper/server").ReactionResponseDto
        >,
      );

    renderComponent(
      <ActivityItemLikes
        activity={makeActivity(activityId, { likesCount: 5, isLiked: false })}
      />,
      mobileClient,
    );

    expect(screen.getByText("5")).toBeTruthy();
    expect(findSummarySpy).not.toHaveBeenCalled();
    expect(getStatusSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText("6")).toBeTruthy());
    expect(addLikeSpy).toHaveBeenCalledWith({
      sourceId: activityId,
      sourceType: "activity",
    });

    summaryCount = 6;
    statusLiked = true;
    resolveAddLike({ isLiked: true, likesCount: 6 });

    await waitFor(() => expect(findSummarySpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getStatusSpy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mobileClient.getQueryData(cacheKey)).toEqual({
        likesCount: 6,
        viewsCount: 11,
        projectionLagSeconds: 0,
        isLiked: true,
        isViewed: true,
      }),
    );

    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByText("5")).toBeTruthy());
    expect(removeLikeSpy).toHaveBeenCalledWith({
      sourceId: activityId,
      sourceType: "activity",
    });

    summaryCount = 5;
    statusLiked = false;
    resolveRemoveLike({ isLiked: false, likesCount: 5 });

    await waitFor(() => expect(findSummarySpy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getStatusSpy).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(mobileClient.getQueryData(cacheKey)).toEqual({
        likesCount: 5,
        viewsCount: 11,
        projectionLagSeconds: 0,
        isLiked: false,
        isViewed: true,
      }),
    );
  });

  it("rolls back optimistic update when like fails on seeded activity", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation((() => {}) as unknown as typeof console.error);
    const mobileClient = createMobileQueryClient();
    const activityId = "act-rollback-1";
    const cacheKey = [
      "statistics",
      StatisticsSourceRequestDto.sourceType.ACTIVITY,
      activityId,
      "user-123",
    ];

    vi.spyOn(
      StatisticsService,
      "statisticsControllerAddLikeV1",
    ).mockRejectedValue(new Error("Network Error"));
    vi.spyOn(
      StatisticsService,
      "statisticsControllerFindSummaryV1",
    ).mockRejectedValue(new Error("Network Error"));
    vi.spyOn(
      StatisticsService,
      "statisticsControllerGetStatusV1",
    ).mockRejectedValue(new Error("Network Error"));

    renderComponent(
      <ActivityItemLikes
        activity={makeActivity(activityId, { likesCount: 4, isLiked: false })}
      />,
      mobileClient,
    );

    expect(screen.getByText("4")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mobileClient.getQueryData(cacheKey)).toEqual({
        likesCount: 4,
        isLiked: false,
      });
      expect(screen.getByText("4")).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  it("isolates seeded state across viewer keys and auth changes", async () => {
    const mobileClient = createMobileQueryClient();
    const activity = makeActivity("act-actor-1", {
      likesCount: 5,
      isLiked: true,
    });

    const findSummarySpy = vi
      .spyOn(StatisticsService, "statisticsControllerFindSummaryV1")
      .mockResolvedValue({
        likesCount: 9,
        viewsCount: 2,
        projectionLagSeconds: 0,
      } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
    const getStatusSpy = vi
      .spyOn(StatisticsService, "statisticsControllerGetStatusV1")
      .mockResolvedValue({
        isLiked: false,
        isViewed: false,
      } as unknown as import("@repo/wrapper/server").StatisticsStatusDto);

    session.id = "user-1";
    const view = renderComponent(
      <ActivityItemLikes activity={activity} />,
      mobileClient,
    );
    expect(screen.getByText("5")).toBeTruthy();
    expect(
      screen.getByRole("button").querySelector(".tabler-icon-thumb-up-filled"),
    ).toBeTruthy();
    expect(findSummarySpy).not.toHaveBeenCalled();

    session.id = "user-2";

    await waitFor(() => expect(findSummarySpy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole("button").querySelector(".tabler-icon-thumb-up"),
      ).toBeTruthy(),
    );
    await waitFor(() => expect(getStatusSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText("9")).toBeTruthy());
    expect(
      mobileClient.getQueryData([
        "statistics",
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        "act-actor-1",
        "user-1",
      ]),
    ).toEqual({ likesCount: 5, isLiked: true });
    expect(
      mobileClient.getQueryData([
        "statistics",
        StatisticsSourceRequestDto.sourceType.ACTIVITY,
        "act-actor-1",
        "user-2",
      ]),
    ).toMatchObject({ likesCount: 9, isLiked: false });

    view.unmount();
    session.id = undefined;
    renderComponent(<ActivityItemLikes activity={activity} />, mobileClient);
    await waitFor(() => expect(findSummarySpy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getStatusSpy).toHaveBeenCalledTimes(2));
    expect(
      screen.getByRole("button").querySelector(".tabler-icon-thumb-up"),
    ).toBeTruthy();
  });

  it("falls back when activity.statistics is missing and leaves non-activity ItemLikesButton unaffected", async () => {
    const mobileClient = createMobileQueryClient();
    const findSummarySpy = vi
      .spyOn(StatisticsService, "statisticsControllerFindSummaryV1")
      .mockResolvedValue({
        likesCount: 7,
        viewsCount: 1,
        projectionLagSeconds: 0,
      } as unknown as import("@repo/wrapper/server").StatisticsSummaryDto);
    const getStatusSpy = vi
      .spyOn(StatisticsService, "statisticsControllerGetStatusV1")
      .mockResolvedValue({
        isLiked: false,
        isViewed: false,
      } as unknown as import("@repo/wrapper/server").StatisticsStatusDto);

    renderComponent(
      <ActivityItemLikes activity={makeActivity("act-fallback-1")} />,
      mobileClient,
    );

    await waitFor(() => expect(screen.getByText("7")).toBeTruthy());
    expect(findSummarySpy).toHaveBeenCalledTimes(1);
    expect(getStatusSpy).toHaveBeenCalledTimes(1);

    cleanup();

    renderComponent(
      <ItemLikesButton
        sourceId="rev-nonactivity-1"
        sourceType={StatisticsSourceRequestDto.sourceType.REVIEW}
        initialStatistics={{ likesCount: 99, isLiked: true }}
      />,
      mobileClient,
    );

    await waitFor(() => expect(findSummarySpy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(getStatusSpy).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByText("7")).toBeTruthy());
  });
});
