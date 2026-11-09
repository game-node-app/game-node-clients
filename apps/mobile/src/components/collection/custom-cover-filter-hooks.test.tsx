// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
} from "@repo/wrapper/server";
import { useCollectionEntriesForUserId } from "../../../../../packages/ui/src/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import { useFavoriteCollectionEntriesForUserId } from "../../../../../packages/ui/src/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import { useCollectionEntriesForCollectionId } from "../../../../../packages/ui/src/components/collection/collection-entry/hooks/useCollectionEntriesForCollectionId";

const EMPTY_PAGE: CollectionEntriesPaginatedResponseDto = {
  data: [],
  pagination: {
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
  },
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return { client, wrapper };
}

function getQueryKeys(client: QueryClient) {
  return client
    .getQueryCache()
    .getAll()
    .map((query) => query.queryKey);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("sends no hasCustomCover and keeps the existing key when the library filter is off", async () => {
  const { client, wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result } = renderHook(
    () => useCollectionEntriesForUserId({ userId: "user-1" }),
    { wrapper },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(findSpy).toHaveBeenCalledWith(
    "user-1",
    undefined,
    undefined,
    undefined,
    undefined,
    0,
    20,
  );
  expect(getQueryKeys(client)).toEqual([
    [
      "collection-entries",
      "all",
      "user-1",
      0,
      20,
      undefined,
      undefined,
      undefined,
    ],
  ]);
});

it("sends hasCustomCover=true in the right positional argument when the library filter is on", async () => {
  const { client, wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result } = renderHook(
    () =>
      useCollectionEntriesForUserId({
        userId: "user-1",
        offset: 48,
        hasCustomCover: true,
      }),
    { wrapper },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(findSpy).toHaveBeenCalledWith(
    "user-1",
    undefined,
    undefined,
    undefined,
    true,
    48,
    20,
  );
  expect(getQueryKeys(client)).toEqual([
    [
      "collection-entries",
      "all",
      "user-1",
      48,
      20,
      undefined,
      undefined,
      undefined,
      { hasCustomCover: true },
    ],
  ]);
});

it("keeps favorites requests and keys unchanged when the filter is off", async () => {
  const { client, wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindFavoritesByLibraryIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result } = renderHook(
    () => useFavoriteCollectionEntriesForUserId("user-1"),
    { wrapper },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(findSpy).toHaveBeenCalledWith(
    "user-1",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  );
  expect(getQueryKeys(client)).toEqual([
    [
      "collection-entries",
      "favorites",
      "user-1",
      undefined,
      undefined,
      undefined,
    ],
  ]);
});

it("sends hasCustomCover=true in the right positional argument for favorites when the filter is on", async () => {
  const { client, wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindFavoritesByLibraryIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result } = renderHook(
    () =>
      useFavoriteCollectionEntriesForUserId(
        "user-1",
        24,
        20,
        { addedDate: "DESC" },
        true,
      ),
    { wrapper },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(findSpy).toHaveBeenCalledWith(
    "user-1",
    { addedDate: "DESC" },
    undefined,
    undefined,
    true,
    24,
    20,
  );
  expect(getQueryKeys(client)).toEqual([
    [
      "collection-entries",
      "favorites",
      "user-1",
      24,
      20,
      { addedDate: "DESC" },
      { hasCustomCover: true },
    ],
  ]);
});

it("omits hasCustomCover from the collection body and key when the filter is off", async () => {
  const { client, wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByCollectionIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result } = renderHook(
    () => useCollectionEntriesForCollectionId({ collectionId: "collection-1" }),
    { wrapper },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  const body = findSpy.mock.calls[0][1];
  expect(findSpy.mock.calls[0][0]).toBe("collection-1");
  expect(body).not.toHaveProperty("hasCustomCover");
  expect(getQueryKeys(client)).toEqual([
    [
      "collection-entries",
      "collection-1",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ],
  ]);
});

it("sends hasCustomCover in the collection body and key when the filter is on", async () => {
  const { client, wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByCollectionIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result } = renderHook(
    () =>
      useCollectionEntriesForCollectionId({
        collectionId: "collection-1",
        offset: 24,
        hasCustomCover: true,
      }),
    { wrapper },
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(findSpy.mock.calls[0][1]).toEqual({
    offset: 24,
    limit: undefined,
    orderBy: undefined,
    status: undefined,
    gameFilters: undefined,
    hasCustomCover: true,
  });
  expect(getQueryKeys(client)).toEqual([
    [
      "collection-entries",
      "collection-1",
      24,
      undefined,
      undefined,
      undefined,
      undefined,
      { hasCustomCover: true },
    ],
  ]);
});
