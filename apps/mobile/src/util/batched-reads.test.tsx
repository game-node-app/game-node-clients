// @vitest-environment jsdom
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CollectionEntry,
  CollectionsEntriesService,
  ProfileResponseDto,
  ProfileService,
  StatisticsService,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUserProfile } from "../../../../packages/ui/src/components/profile/hooks/useUserProfile";
import { useOwnCollectionEntryForGameId } from "../../../../packages/ui/src/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { useItemStatistics } from "../../../../packages/ui/src/components/statistics/hooks/useItemStatistics";

const session = vi.hoisted(() => ({ id: "viewer-1" as string | undefined }));
vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => session.id,
}));

function renderTogether<T>(hooks: (() => T)[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => hooks.map((hook) => hook()), { wrapper });
}

afterEach(async () => {
  cleanup();
  // let batches queued by this test flush before its mocks are restored
  await new Promise((resolve) => setTimeout(resolve, 0));
  vi.restoreAllMocks();
  session.id = "viewer-1";
});

describe("batched card reads", () => {
  it("reads the profiles of a list in one request", async () => {
    const findMany = vi
      .spyOn(ProfileService, "profileControllerFindManyByIdsV1")
      .mockImplementation(
        async ({ userIds }) =>
          userIds.map((userId) => ({ userId })) as ProfileResponseDto[],
      );
    const findOne = vi.spyOn(ProfileService, "profileControllerFindOneByIdV1");

    const { result } = renderTogether([
      () => useUserProfile("a"),
      () => useUserProfile("b"),
    ]);

    await waitFor(() =>
      expect(result.current.map((query) => query.data?.userId)).toEqual([
        "a",
        "b",
      ]),
    );
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({ userIds: ["a", "b"] });
    expect(findOne).not.toHaveBeenCalled();
  });

  it("reads own library entries in one request; games not in the library resolve to null", async () => {
    const findMany = vi
      .spyOn(
        CollectionsEntriesService,
        "collectionsEntriesControllerFindOwnEntriesByGameIdsV1",
      )
      .mockResolvedValue([{ id: "entry-1", gameId: 1 } as CollectionEntry]);
    const findOne = vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindOwnEntryByGameIdV1",
    );

    const { result } = renderTogether([
      () => useOwnCollectionEntryForGameId(1),
      () => useOwnCollectionEntryForGameId(2),
    ]);

    await waitFor(() =>
      expect(result.current.every((query) => query.isSuccess)).toBe(true),
    );
    expect(result.current.map((query) => query.data?.id ?? null)).toEqual([
      "entry-1",
      null,
    ]);
    expect(findMany).toHaveBeenCalledWith({ gameIds: [1, 2] });
    expect(findOne).not.toHaveBeenCalled();
  });

  it("reads statistics, status and comment counts of a list in one request", async () => {
    const findBatch = vi
      .spyOn(StatisticsService, "statisticsControllerFindBatchSummaryV1")
      .mockImplementation(async ({ sourceType, sourceIds }) => ({
        items: sourceIds.map((sourceId, index) => ({
          sourceType: sourceType as never,
          sourceId,
          viewsCount: 0,
          likesCount: index + 1,
          commentsCount: index + 3,
          isLiked: index === 0,
          isViewed: false,
        })),
        asOf: "2026-11-24T00:00:00.000Z",
        projectionLagSeconds: 0,
        hasFailedEvents: false,
        historyComplete: true,
        completeSince: null,
      }));
    const findSummary = vi.spyOn(
      StatisticsService,
      "statisticsControllerFindSummaryV1",
    );
    const getStatus = vi.spyOn(
      StatisticsService,
      "statisticsControllerGetStatusV1",
    );
    const REVIEW = StatisticsSourceRequestDto.sourceType.REVIEW;

    const { result } = renderTogether([
      () => useItemStatistics("review-1", REVIEW),
      () => useItemStatistics("review-2", REVIEW),
    ]);

    await waitFor(() =>
      expect(result.current.every((query) => query.isSuccess)).toBe(true),
    );
    expect(result.current.map((query) => query.data)).toEqual([
      expect.objectContaining({
        sourceId: "review-1",
        likesCount: 1,
        commentsCount: 3,
        isLiked: true,
        asOf: "2026-11-24T00:00:00.000Z",
      }),
      expect.objectContaining({
        sourceId: "review-2",
        likesCount: 2,
        commentsCount: 4,
        isLiked: false,
      }),
    ]);
    expect(findBatch).toHaveBeenCalledTimes(1);
    expect(findBatch).toHaveBeenCalledWith({
      sourceType: REVIEW,
      sourceIds: ["review-1", "review-2"],
    });
    expect(findSummary).not.toHaveBeenCalled();
    expect(getStatus).not.toHaveBeenCalled();
  });
});
