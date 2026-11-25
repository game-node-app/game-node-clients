// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { DEFAULT_MANTINE_THEME, UIProvider } from "@repo/ui";
import {
  CancelablePromise,
  CollectionEntriesPaginatedResponseDto,
  CollectionEntry,
  CollectionsEntriesService,
  Game,
  GameRepositoryService,
  JournalEntryStatusDto,
  ProfileResponseDto,
  ProfileService,
} from "@repo/wrapper/server";
import { LibraryView } from "../../../../../packages/ui/src/components/library/view/LibraryView";
import { JournalOverviewItem } from "../../../../../packages/ui/src/components/journal/overview/item/JournalOverviewItem";
import {
  PROJECT_CONTEXT,
  setProjectContext,
} from "../../../../../packages/ui/src/util/projectContext";

const mocks = vi.hoisted(() => ({
  session: {
    data: null as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "viewer-1" }),
);

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function signIn(userId: string) {
  mocks.session = { data: { user: { id: userId } }, isPending: false };
}

function signOut() {
  mocks.session = { data: null, isPending: false };
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
}

interface TestRouter {
  pathname: string;
  query: URLSearchParams;
  back: () => void;
  push: (route: string) => Promise<void>;
}

let testRouter: TestRouter;

function createRouter(): TestRouter {
  return {
    pathname: "/library/owner-1",
    query: new URLSearchParams(),
    back: vi.fn(),
    push: vi.fn(async () => {}),
  };
}

function createWrapper(client: QueryClient) {
  testRouter = createRouter();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <MantineProvider theme={DEFAULT_MANTINE_THEME} forceColorScheme="dark">
        <UIProvider
          presenters={{
            Link: ({ href, children, ...others }) => (
              <a href={href} {...others}>
                {children}
              </a>
            ),
          }}
          hooks={{ useRouter: () => testRouter }}
        >
          {children}
        </UIProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
  Wrapper.displayName = "OwnerCoverCallSitesWrapper";
  return { Wrapper, router: testRouter };
}

const profile = (customCoverMode?: string) =>
  ({ customCoverMode }) as unknown as ProfileResponseDto;

const game = (id: number) => ({ id, name: `Game ${id}` }) as Game;

const entry = (
  gameId: number,
  visibility?: CollectionEntry.visibility,
): CollectionEntry =>
  ({
    id: `entry-${gameId}`,
    gameId,
    isFavorite: false,
    status: CollectionEntry.status.PLAYING,
    visibility,
    collections: [],
    ownedPlatforms: [],
  }) as unknown as CollectionEntry;

const page = (
  entries: CollectionEntry[],
): CollectionEntriesPaginatedResponseDto => ({
  data: entries,
  pagination: {
    totalItems: entries.length,
    totalPages: 1,
    hasNextPage: false,
  },
});

/** A request that never settles, matching the generated CancelablePromise type. */
function pendingRequest<T>(): CancelablePromise<T> {
  return new Promise<T>(() => {}) as unknown as CancelablePromise<T>;
}

const originalProjectContext = PROJECT_CONTEXT;

beforeEach(() => {
  // Profile reads that start together are batched: answer them like the
  // single read each test mocks.
  vi.spyOn(
    ProfileService,
    "profileControllerFindManyByIdsV1",
  ).mockImplementation((async ({ userIds }) =>
    Promise.all(
      userIds.map(async (userId) => ({
        ...(await ProfileService.profileControllerFindOneByIdV1(userId)),
        userId,
      })),
    )) as never);
  setProjectContext({
    client: "mobile",
    s3BucketUrl: "",
    serverUrl: "",
    searchUrl: "",
  });
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
  signOut();
  setProjectContext(originalProjectContext);
});

describe("owner cover call sites", () => {
  it("asks for another user's covers in their library", async () => {
    signIn("viewer-1");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("any"));
    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    ).mockResolvedValue(page([entry(1)]));
    const findAll = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
      .mockResolvedValue([game(1)]);

    const { Wrapper } = createWrapper(createClient());
    render(<LibraryView libraryUserId="owner-1" />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(findAll).toHaveBeenLastCalledWith({
        gameIds: [1],
        relations: { cover: true },
        coverOwnerUserId: "owner-1",
      }),
    );
    expect(findAll.mock.calls.some(([dto]) => dto.personalizeCovers)).toBe(
      false,
    );
  });

  it("personalizes the viewer's own library without sending an owner", async () => {
    signIn("viewer-1");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("any"));
    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    ).mockResolvedValue(page([entry(1)]));
    const findAll = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
      .mockResolvedValue([game(1)]);

    const { Wrapper } = createWrapper(createClient());
    render(<LibraryView libraryUserId="viewer-1" />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(findAll).toHaveBeenLastCalledWith({
        gameIds: [1],
        relations: { cover: true },
        personalizeCovers: true,
      }),
    );
    expect(
      findAll.mock.calls.some(([dto]) => dto.coverOwnerUserId != undefined),
    ).toBe(false);
  });

  it("asks for the journal owner's covers without waiting for the collection entry", async () => {
    signIn("viewer-1");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("any"));
    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindEntryByIdV1",
    ).mockReturnValue(pendingRequest<CollectionEntry>());
    const findOne = vi
      .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
      .mockResolvedValue(game(1));

    const item: JournalEntryStatusDto = {
      collectionEntryId: "entry-1",
      gameId: 1,
      status: JournalEntryStatusDto.status.PLAYING,
    };

    const { Wrapper } = createWrapper(createClient());
    render(<JournalOverviewItem userId="owner-1" item={item} targetDay={1} />, {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(findOne).toHaveBeenCalledWith(1, {
        relations: { cover: true },
        coverOwnerUserId: "owner-1",
      }),
    );
    expect(findOne.mock.calls.some(([, dto]) => dto.personalizeCovers)).toBe(
      false,
    );
  });

  it("badges the owner's own non-public entries on library cards", async () => {
    signIn("viewer-1");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("any"));
    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    ).mockResolvedValue(page([entry(1, CollectionEntry.visibility.PRIVATE)]));
    vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindAllByIdsV1",
    ).mockResolvedValue([game(1)]);

    const { Wrapper } = createWrapper(createClient());
    render(<LibraryView libraryUserId="viewer-1" />, { wrapper: Wrapper });

    expect(
      await screen.findByText("libraryVisibility.badges.private"),
    ).toBeTruthy();
  });

  it("never badges another user's library cards", async () => {
    signIn("viewer-1");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("any"));
    vi.spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    ).mockResolvedValue(page([entry(1, CollectionEntry.visibility.PRIVATE)]));
    vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindAllByIdsV1",
    ).mockResolvedValue([game(1)]);

    const { Wrapper } = createWrapper(createClient());
    render(<LibraryView libraryUserId="owner-1" />, { wrapper: Wrapper });

    expect(await screen.findByText("Game 1")).toBeTruthy();
    expect(screen.queryByText("libraryVisibility.badges.private")).toBeNull();
  });
});
