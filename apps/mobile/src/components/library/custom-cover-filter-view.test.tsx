// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { DEFAULT_MANTINE_THEME, UIProvider } from "@repo/ui";
import {
  Collection,
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  CollectionsService,
} from "@repo/wrapper/server";
import { LibraryView } from "../../../../../packages/ui/src/components/library/view/LibraryView";
import { CollectionView } from "../../../../../packages/ui/src/components/collection/view/CollectionView";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "viewer-1" }),
);
vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

const EMPTY_PAGE: CollectionEntriesPaginatedResponseDto = {
  data: [],
  pagination: {
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
  },
};

const COLLECTION = {
  id: "collection-1",
  name: "Favorite games",
  description: "",
  isPublic: true,
  libraryUserId: "owner-1",
  defaultEntryStatus: null,
  entriesMap: [],
  isFeatured: false,
  isFinished: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as unknown as Collection;

interface TestRouter {
  pathname: string;
  query: URLSearchParams;
  back: () => void;
  push: (route: string) => Promise<void>;
}

let testRouter: TestRouter;
let testClient: QueryClient;

const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testClient}>
    <MantineProvider theme={DEFAULT_MANTINE_THEME} forceColorScheme="dark">
      <UIProvider hooks={{ useRouter: () => testRouter }}>
        {children}
      </UIProvider>
    </MantineProvider>
  </QueryClientProvider>
);

function setup(initialQuery: string) {
  testRouter = {
    pathname: "/library/owner-1",
    query: new URLSearchParams(initialQuery),
    back: vi.fn(),
    push: async (route: string) => {
      const queryString = route.split("?")[1] ?? "";
      testRouter.query = new URLSearchParams(queryString);
    },
  };
  testRouter.push = vi.fn(testRouter.push);

  testClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return { router: testRouter, client: testClient };
}

beforeEach(() => {
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

it("toggling the custom cover chip in a library sends the filter and returns to offset 0", async () => {
  const { router, client } = setup("offset=24");
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  render(<LibraryView libraryUserId="owner-1" />, { wrapper: Providers });

  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(1));
  expect(findSpy.mock.calls[0][4]).toBeUndefined();
  expect(findSpy.mock.calls[0][5]).toBe(24);

  fireEvent.click(
    screen.getByRole("checkbox", { name: "library.labels.customCovers" }),
  );

  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(2));
  const filteredCall = findSpy.mock.calls[1];
  expect(filteredCall[4]).toBe(true);
  expect(filteredCall[5]).toBe(0);

  expect(router.push).toHaveBeenCalled();
  const pushedUrl = (
    router.push as unknown as ReturnType<typeof vi.fn>
  ).mock.calls.at(-1)![0] as string;
  expect(pushedUrl).toContain("hasCustomCover=true");
  expect(pushedUrl).toContain("offset=0");

  const filteredKey = client
    .getQueryCache()
    .getAll()
    .map((query) => query.queryKey)
    .find(
      (key) =>
        JSON.stringify(key.at(-1)) === JSON.stringify({ hasCustomCover: true }),
    );
  expect(filteredKey).toBeDefined();
});

it("toggling the custom cover chip in a collection sends the filter and shows the empty state", async () => {
  const { router } = setup("offset=24");
  const collectionSpy = vi
    .spyOn(
      CollectionsService,
      "collectionsControllerFindOneByIdWithPermissionsV1",
    )
    .mockResolvedValue(COLLECTION);
  const findSpy = vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByCollectionIdV1",
    )
    .mockResolvedValue(EMPTY_PAGE);

  render(
    <CollectionView libraryUserId="owner-1" collectionId="collection-1" />,
    { wrapper: Providers },
  );

  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(1));
  expect(findSpy.mock.calls[0][0]).toBe("collection-1");
  expect(findSpy.mock.calls[0][1]).not.toHaveProperty("hasCustomCover");
  expect(findSpy.mock.calls[0][1].offset).toBe(24);

  fireEvent.click(
    screen.getByRole("checkbox", { name: "library.labels.customCovers" }),
  );

  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(2));
  const filteredBody = findSpy.mock.calls[1][1];
  expect(filteredBody.hasCustomCover).toBe(true);
  expect(filteredBody.offset).toBe(0);

  expect(router.push).toHaveBeenCalled();
  const pushedUrl = (
    router.push as unknown as ReturnType<typeof vi.fn>
  ).mock.calls.at(-1)![0] as string;
  expect(pushedUrl).toContain("hasCustomCover=true");
  expect(pushedUrl).toContain("offset=0");

  await waitFor(() => expect(collectionSpy).toHaveBeenCalled());
  await waitFor(() =>
    expect(screen.getByText("This collection is empty.")).toBeTruthy(),
  );
});

it("shows the existing library empty state when the filter is on and the owner has no choices", async () => {
  setup("hasCustomCover=true");
  vi.spyOn(
    CollectionsEntriesService,
    "collectionsEntriesControllerFindAllByLibraryIdV1",
  ).mockResolvedValue(EMPTY_PAGE);

  render(<LibraryView libraryUserId="owner-1" />, { wrapper: Providers });

  await waitFor(() =>
    expect(screen.getByText("No games in this category.")).toBeTruthy(),
  );
});
