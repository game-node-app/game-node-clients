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

// Signed out: the viewer marker is `null` in every key.
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => undefined }),
);

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
      null,
      null,
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
      null,
      null,
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
      null,
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
    undefined,
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
      null,
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
      null,
      null,
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
      null,
      null,
    ],
  ]);
});

it("sends a library search as the second argument and a blank one as undefined", async () => {
  const { wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result, rerender } = renderHook(
    ({ search }: { search: string }) =>
      useCollectionEntriesForUserId({ userId: "user-1", search }),
    { wrapper, initialProps: { search: "zelda" } },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(findSpy.mock.calls[0][1]).toBe("zelda");

  rerender({ search: "   " });
  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(2));
  expect(findSpy.mock.calls[1][1]).toBeUndefined();
});

it("changes the library key with the search and keeps the previous page while loading", async () => {
  const { client, wrapper } = createWrapper();
  const first = { ...EMPTY_PAGE, data: [] };
  vi.spyOn(
    CollectionsEntriesService,
    "collectionsEntriesControllerFindAllByLibraryIdV1",
  )
    .mockResolvedValueOnce(first)
    .mockReturnValueOnce(new Promise(() => {}) as never);

  const { result, rerender } = renderHook(
    ({ search }: { search: string }) =>
      useCollectionEntriesForUserId({ userId: "user-1", search }),
    { wrapper, initialProps: { search: "" } },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  rerender({ search: "zelda" });
  expect(result.current.data).toBe(first);
  expect(result.current.isPlaceholderData).toBe(true);
  expect(getQueryKeys(client)).toHaveLength(2);
  expect(getQueryKeys(client).map((key) => key.at(-2))).toEqual([
    null,
    "zelda",
  ]);
});

it("sends search in the collection body and key only when nonblank", async () => {
  const { client, wrapper } = createWrapper();
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByCollectionIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  const { result, rerender } = renderHook(
    ({ search }: { search: string }) =>
      useCollectionEntriesForCollectionId({
        collectionId: "collection-1",
        search,
      }),
    { wrapper, initialProps: { search: "zelda" } },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(findSpy.mock.calls[0][1]).toMatchObject({ search: "zelda" });

  rerender({ search: " " });
  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(2));
  expect(findSpy.mock.calls[1][1]).not.toHaveProperty("search");
  expect(getQueryKeys(client).map((key) => key.at(-2))).toEqual([
    "zelda",
    null,
  ]);
});
