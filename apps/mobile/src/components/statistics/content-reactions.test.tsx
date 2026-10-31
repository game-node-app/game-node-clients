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
  StatisticsSourceRequestDto,
  StatisticsService,
} from "@repo/wrapper/server";
import { ItemLikesButton } from "../../../../../packages/ui/src/components/statistics/input/ItemLikesButton";

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-123" }),
);

vi.mock("supertokens-auth-react", () => ({
  redirectToAuth: vi.fn(),
}));

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
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
