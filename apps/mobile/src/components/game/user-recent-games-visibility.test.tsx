// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  CollectionEntry,
  Game,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { useUserRecentGames } from "../../../../../packages/ui/src/components/game/hooks/useUserRecentGames";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

const mocks = vi.hoisted(() => ({
  viewerId: undefined as string | undefined,
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.viewerId }),
);

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: null, isPending: false }),
  },
}));

const OWNER_ID = "owner-1";

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
}

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: React.PropsWithChildren) => (
    <UIProvider
      hooks={{
        useRouter: () => ({
          back: () => {},
          pathname: "",
          push: async () => {},
          query: new URLSearchParams(),
        }),
        personalizeGameCovers: false,
      }}
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </UIProvider>
  );
  Wrapper.displayName = "UserRecentGamesWrapper";

  return Wrapper;
}

function spyRecentGames(visibility: CollectionEntry.visibility) {
  const entries = [
    { id: "entry-1", gameId: 1, libraryUserId: OWNER_ID, visibility },
  ] as unknown as CollectionEntry[];

  return vi
    .spyOn(
      CollectionsEntriesService,
      "collectionsEntriesControllerFindAllByLibraryIdV1",
    )
    .mockResolvedValue({
      data: entries,
      pagination: {
        totalItems: entries.length,
        totalPages: 1,
        currentPage: 1,
      },
    } as unknown as CollectionEntriesPaginatedResponseDto);
}

function spyGames() {
  return vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
    .mockResolvedValue([{ id: 1, name: "Game 1" } as Game]);
}

beforeEach(() => {
  mocks.viewerId = OWNER_ID;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mocks.viewerId = undefined;
});

describe("useUserRecentGames owner visibility", () => {
  it("passes the entry visibility to the owner's items", async () => {
    spyRecentGames(CollectionEntry.visibility.PRIVATE);
    spyGames();

    const hook = renderHook(() => useUserRecentGames(OWNER_ID), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.data).toHaveLength(1));

    expect(hook.result.current.data?.[0].visibility).toBe("private");
  });

  it("never exposes the entry visibility to another viewer", async () => {
    mocks.viewerId = "viewer-2";
    spyRecentGames(CollectionEntry.visibility.PRIVATE);
    spyGames();

    const hook = renderHook(() => useUserRecentGames(OWNER_ID), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.data).toHaveLength(1));

    expect(hook.result.current.data?.[0].visibility).toBeUndefined();
  });

  it("keeps public entries badge-free for the owner", async () => {
    spyRecentGames(CollectionEntry.visibility.PUBLIC);
    spyGames();

    const hook = renderHook(() => useUserRecentGames(OWNER_ID), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() => expect(hook.result.current.data).toHaveLength(1));

    expect(hook.result.current.data?.[0].visibility).toBe("public");
  });
});
