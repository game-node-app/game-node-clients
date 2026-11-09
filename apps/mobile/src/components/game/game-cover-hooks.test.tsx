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
import { isPersonalizedGameQuery } from "../../../../../packages/ui/src/components/game/util/isPersonalizedGameQuery";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
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

const gameDto = { relations: { cover: true } };
const originalProjectContext = PROJECT_CONTEXT;

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

function createWrapper(client: QueryClient, personalizeGameCovers?: boolean) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <UIProvider
      hooks={{
        useRouter: () => ({
          back: () => {},
          pathname: "",
          push: async () => {},
          query: new URLSearchParams(),
        }),
        personalizeGameCovers,
      }}
    >
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </UIProvider>
  );
  Wrapper.displayName = "GameCoverQueryClientWrapper";
  return Wrapper;
}

/** Game queries currently registered in the cache, in creation order. */
function gameKeys(client: QueryClient) {
  return client
    .getQueryCache()
    .findAll({ queryKey: ["game"] })
    .map((query) => query.queryKey);
}

function personalizedGameKey(client: QueryClient) {
  return gameKeys(client).find(isPersonalizedGameQuery);
}

function hasPersonalizedGameKey(client: QueryClient) {
  return personalizedGameKey(client) !== undefined;
}

const profile = (customCoverMode?: string) =>
  ({ customCoverMode }) as unknown as ProfileResponseDto;

const game = (id: number) => ({ id, name: `Game ${id}` }) as Game;

/** A request that never settles, matching the generated CancelablePromise type. */
function pendingRequest<T>(): CancelablePromise<T> {
  return new Promise<T>(() => {}) as unknown as CancelablePromise<T>;
}

function spyProfile() {
  return vi
    .spyOn(ProfileService, "profileControllerFindOneByIdV1")
    .mockResolvedValue(profile("any"));
}

function spyFindOne() {
  return vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
    .mockResolvedValue(game(1));
}

function spyFindAll() {
  return vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
    .mockResolvedValue([game(1)]);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  signOut();
  setProjectContext(originalProjectContext);
});

describe("useGame cover request", () => {
  it("keeps the unpersonalized key and body unchanged while the session is pending", async () => {
    mocks.session = { data: null, isPending: true };
    const profileSpy = spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(findOne).toHaveBeenCalledWith(1, gameDto));
    expect(gameKeys(client)).toEqual([["game", 1, gameDto]]);
    expect(hasPersonalizedGameKey(client)).toBe(false);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("does not opt in when the read does not request relations.cover", async () => {
    signIn("viewer");
    const profileSpy = spyProfile();
    const findOne = spyFindOne();
    const client = createClient();
    const dto = {};

    renderHook(() => useGame(1, dto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(findOne).toHaveBeenCalledWith(1, dto));
    expect(gameKeys(client)).toEqual([["game", 1, dto]]);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("personalizes for the signed-in viewer with personalizeCovers", async () => {
    signIn("viewer");
    spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(personalizedGameKey(client)).toEqual([
        "game",
        1,
        gameDto,
        {
          coverContext: { viewer: "viewer", owner: null, mode: "any" },
        },
      ]),
    );
    expect(findOne).toHaveBeenLastCalledWith(1, {
      ...gameDto,
      personalizeCovers: true,
    });
    expect(findOne.mock.lastCall?.[1]).not.toHaveProperty("coverOwnerUserId");
  });

  it("sends coverOwnerUserId for another user's content", async () => {
    signIn("viewer");
    spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto, { ownerUserId: "owner-b" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(personalizedGameKey(client)).toEqual([
        "game",
        1,
        gameDto,
        {
          coverContext: { viewer: "viewer", owner: "owner-b", mode: "any" },
        },
      ]),
    );
    expect(findOne).toHaveBeenLastCalledWith(1, {
      ...gameDto,
      coverOwnerUserId: "owner-b",
    });
    expect(findOne.mock.lastCall?.[1]).not.toHaveProperty("personalizeCovers");
  });

  it("keys another user's content by the viewer's mode", async () => {
    signIn("viewer");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("prefer_yours"));
    spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto, { ownerUserId: "owner-b" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(personalizedGameKey(client)).toEqual([
        "game",
        1,
        gameDto,
        {
          coverContext: {
            viewer: "viewer",
            owner: "owner-b",
            mode: "prefer_yours",
          },
        },
      ]),
    );
  });

  it("normalizes an owner equal to the viewer to viewer personalization", async () => {
    signIn("viewer");
    spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto, { ownerUserId: "viewer" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(personalizedGameKey(client)).toEqual([
        "game",
        1,
        gameDto,
        {
          coverContext: { viewer: "viewer", owner: null, mode: "any" },
        },
      ]),
    );
    expect(findOne).toHaveBeenLastCalledWith(1, {
      ...gameDto,
      personalizeCovers: true,
    });
  });

  it("sends nothing and skips the profile lookup while the owner is loading", async () => {
    signIn("viewer");
    const profileSpy = spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto, { ownerUserId: undefined }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(findOne).toHaveBeenCalledWith(1, gameDto));
    expect(gameKeys(client)).toEqual([["game", 1, gameDto]]);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("asks for the owner's choices for an anonymous visitor", async () => {
    signOut();
    const profileSpy = spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto, { ownerUserId: "owner-b" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(findOne).toHaveBeenLastCalledWith(1, {
        ...gameDto,
        coverOwnerUserId: "owner-b",
      }),
    );
    expect(personalizedGameKey(client)).toEqual([
      "game",
      1,
      gameDto,
      {
        coverContext: { viewer: null, owner: "owner-b", mode: "any" },
      },
    ]);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("sends nothing when the viewer's mode is none", async () => {
    signIn("viewer");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile("none"));
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto, { ownerUserId: "owner-b" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(client.getQueryData(["userProfile", "viewer"])).toBeDefined(),
    );
    expect(gameKeys(client)).toEqual([["game", 1, gameDto]]);
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(findOne).toHaveBeenCalledWith(1, gameDto);
  });

  it("treats a debugUserId preview as anonymous", async () => {
    signOut();
    setProjectContext({
      client: "web",
      s3BucketUrl: "",
      serverUrl: "",
      searchUrl: "",
      debugUserId: "debug-user",
    });
    const profileSpy = spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(findOne).toHaveBeenCalledWith(1, gameDto));
    expect(gameKeys(client)).toEqual([["game", 1, gameDto]]);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("sends nothing when the viewer's profile fails to load", async () => {
    signIn("viewer");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockRejectedValue(new Error("profile unavailable"));
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto, { ownerUserId: "owner-b" }), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(
        client.getQueryCache().find({ queryKey: ["userProfile", "viewer"] })
          ?.state.status,
      ).toBe("error"),
    );
    expect(gameKeys(client)).toEqual([["game", 1, gameDto]]);
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(findOne).toHaveBeenCalledWith(1, gameDto);
  });

  it("reads a profile without customCoverMode as mode any", async () => {
    signIn("viewer");
    vi.spyOn(
      ProfileService,
      "profileControllerFindOneByIdV1",
    ).mockResolvedValue(profile(undefined));
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(personalizedGameKey(client)).toEqual([
        "game",
        1,
        gameDto,
        {
          coverContext: { viewer: "viewer", owner: null, mode: "any" },
        },
      ]),
    );
    expect(findOne).toHaveBeenLastCalledWith(1, {
      ...gameDto,
      personalizeCovers: true,
    });
  });

  it("changes the key when the viewer changes", async () => {
    signIn("viewer-a");
    spyProfile();
    spyFindOne();
    const client = createClient();

    const { rerender } = renderHook(() => useGame(1, gameDto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(personalizedGameKey(client)).toEqual([
        "game",
        1,
        gameDto,
        {
          coverContext: { viewer: "viewer-a", owner: null, mode: "any" },
        },
      ]),
    );

    signIn("viewer-b");
    rerender();

    await waitFor(() =>
      expect(gameKeys(client)).toContainEqual([
        "game",
        1,
        gameDto,
        {
          coverContext: { viewer: "viewer-b", owner: null, mode: "any" },
        },
      ]),
    );
  });

  it("shows the cached unpersonalized data as placeholder while personalizing", async () => {
    signIn("viewer");
    spyProfile();
    const client = createClient();
    const seeded = game(1);
    client.setQueryData(["game", 1, gameDto], seeded);
    vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindOneByIdV1",
    ).mockReturnValue(pendingRequest<Game>());

    const { result } = renderHook(() => useGame(1, gameDto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() => expect(hasPersonalizedGameKey(client)).toBe(true));
    expect(result.current.data).toEqual(seeded);
    expect(result.current.isPlaceholderData).toBe(true);
  });

  it("sends nothing when the app disables personalization", async () => {
    signIn("viewer");
    const profileSpy = spyProfile();
    const findOne = spyFindOne();
    const client = createClient();

    renderHook(() => useGame(1, gameDto), {
      wrapper: createWrapper(client, false),
    });

    await waitFor(() => expect(findOne).toHaveBeenCalledWith(1, gameDto));
    expect(gameKeys(client)).toEqual([["game", 1, gameDto]]);
    expect(profileSpy).not.toHaveBeenCalled();
  });
});

describe("useGames cover request", () => {
  const dto = { gameIds: [1, 2], relations: { cover: true } };

  it("keeps the unpersonalized key and body unchanged", async () => {
    mocks.session = { data: null, isPending: true };
    const profileSpy = spyProfile();
    const findAll = spyFindAll();

    const { result } = renderHook(() => useGames(dto), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() =>
      expect(findAll).toHaveBeenCalledWith({
        gameIds: [1, 2],
        relations: { cover: true },
      }),
    );
    expect(result.current.queryKey).toEqual([
      "game",
      "all",
      [1, 2],
      { cover: true },
    ]);
    expect(profileSpy).not.toHaveBeenCalled();
  });

  it("appends the cover context and merges the fields when personalized", async () => {
    signIn("viewer");
    spyProfile();
    const findAll = spyFindAll();

    const { result } = renderHook(() => useGames(dto), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() =>
      expect(isPersonalizedGameQuery(result.current.queryKey)).toBe(true),
    );

    expect(result.current.queryKey).toEqual([
      "game",
      "all",
      [1, 2],
      { cover: true },
      {
        coverContext: { viewer: "viewer", owner: null, mode: "any" },
      },
    ]);
    expect(findAll).toHaveBeenLastCalledWith({
      gameIds: [1, 2],
      relations: { cover: true },
      personalizeCovers: true,
    });
  });

  it("passes coverOwnerUserId for another user's content", async () => {
    signIn("viewer");
    spyProfile();
    const findAll = spyFindAll();

    renderHook(() => useGames(dto, false, { ownerUserId: "owner-b" }), {
      wrapper: createWrapper(createClient()),
    });

    await waitFor(() =>
      expect(findAll).toHaveBeenLastCalledWith({
        gameIds: [1, 2],
        relations: { cover: true },
        coverOwnerUserId: "owner-b",
      }),
    );
  });

  it("invalidates the same prefix for personalized and default keys", async () => {
    signIn("viewer");
    spyProfile();
    spyFindAll();
    const client = createClient();
    const invalidateQueries = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useGames(dto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(isPersonalizedGameQuery(result.current.queryKey)).toBe(true),
    );

    result.current.invalidate();
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["game", "all", [1, 2]],
    });
  });

  it("lets keepPreviousData win over the default placeholder", async () => {
    signIn("viewer");
    spyProfile();
    vi.spyOn(GameRepositoryService, "gameRepositoryControllerFindAllByIdsV1")
      .mockResolvedValueOnce([game(1)])
      .mockReturnValue(pendingRequest<Game[]>());
    const client = createClient();
    client.setQueryData(["game", "all", [2], { cover: true }], [game(2)]);
    const relations = { cover: true };

    const { result, rerender } = renderHook(
      ({ gameIds }: { gameIds: number[] }) =>
        useGames({ gameIds, relations }, true),
      {
        initialProps: { gameIds: [1] },
        wrapper: createWrapper(client),
      },
    );

    await waitFor(() => expect(result.current.data).toEqual([game(1)]));

    rerender({ gameIds: [2] });

    expect(result.current.data).toEqual([game(1)]);
    expect(result.current.isPlaceholderData).toBe(true);
  });

  it("shows the cached unpersonalized list as placeholder while personalizing", async () => {
    signIn("viewer");
    spyProfile();
    const client = createClient();
    const seeded = [game(1), game(2)];
    client.setQueryData(["game", "all", [1, 2], { cover: true }], seeded);
    vi.spyOn(
      GameRepositoryService,
      "gameRepositoryControllerFindAllByIdsV1",
    ).mockReturnValue(pendingRequest<Game[]>());

    const { result } = renderHook(() => useGames(dto), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(isPersonalizedGameQuery(result.current.queryKey)).toBe(true),
    );
    expect(result.current.data).toEqual(seeded);
    expect(result.current.isPlaceholderData).toBe(true);
  });
});
