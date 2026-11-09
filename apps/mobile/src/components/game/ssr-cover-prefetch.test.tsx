// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CancelablePromise,
  Game,
  GameRepositoryService,
  ProfileResponseDto,
  ProfileService,
} from "@repo/wrapper/server";
import { useGame } from "../../../../../packages/ui/src/components/game/hooks/useGame";
import { useGames } from "../../../../../packages/ui/src/components/game/hooks/useGames";
import { DEFAULT_GAME_INFO_VIEW_DTO } from "../../../../../packages/ui/src/components/game/info/GameInfoView";
import { isPersonalizedGameQuery } from "../../../../../packages/ui/src/components/game/util/isPersonalizedGameQuery";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";

const mocks = vi.hoisted(() => ({
  session: {
    data: { user: { id: "viewer-1" } } as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => mocks.session },
}));

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
}

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <UIProvider
      hooks={{
        useRouter: () => ({
          back: () => {},
          pathname: "",
          push: async () => {},
          query: new URLSearchParams(),
        }),
      }}
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </UIProvider>
  );
  Wrapper.displayName = "SsrCoverPrefetchWrapper";
  return Wrapper;
}

const game = (id: number) => ({ id, name: `Game ${id}` }) as Game;

/** A request that never settles, matching the generated CancelablePromise type. */
function pendingRequest<T>(): CancelablePromise<T> {
  return new Promise<T>(() => {}) as unknown as CancelablePromise<T>;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SSR prefetched default entries", () => {
  it("reuses the game page's unpersonalized prefetch without a loading state", () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue({
      customCoverMode: "any",
    } as unknown as ProfileResponseDto);
    // The personalized read never settles: the first render must already show
    // the SSR entry instead of waiting for it.
    vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindOneByIdV1",
    ).mockReturnValue(pendingRequest<Game>());

    const client = createClient();
    const seeded = game(1);
    client.setQueryData(["game", 1, DEFAULT_GAME_INFO_VIEW_DTO], seeded);

    const { result } = renderHook(
      () => useGame(1, DEFAULT_GAME_INFO_VIEW_DTO),
      { wrapper: createWrapper(client) },
    );

    expect(result.current.data).toEqual(seeded);
    expect(result.current.isLoading).toBe(false);
  });

  it("matches the explore prefetch key and hydrates the list", async () => {
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue({
      customCoverMode: "any",
    } as unknown as ProfileResponseDto);
    vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindAllByIdsV1",
    ).mockReturnValue(pendingRequest<Game[]>());

    const client = createClient();
    const seeded = [game(1), game(2)];
    const relations = { cover: true };
    client.setQueryData(["game", "all", [1, 2], relations], seeded);

    const { result } = renderHook(
      () => useGames({ gameIds: [1, 2], relations }, true),
      { wrapper: createWrapper(client) },
    );

    expect(result.current.data).toEqual(seeded);
    expect(result.current.isLoading).toBe(false);

    // The personalized key is a separate entry appended to the same prefix.
    await waitFor(() =>
      expect(isPersonalizedGameQuery(result.current.queryKey)).toBe(true),
    );
    expect(result.current.queryKey.slice(0, 4)).toEqual([
      "game",
      "all",
      [1, 2],
      relations,
    ]);
  });
});
