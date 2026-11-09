// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameCoverService } from "@repo/wrapper/server";
import { useGameCoverChoice } from "../../../../../packages/ui/src/components/game/hooks/useGameCoverChoice";
import { useSetGameCoverChoice } from "../../../../../packages/ui/src/components/game/hooks/useSetGameCoverChoice";
import { useClearGameCoverChoice } from "../../../../../packages/ui/src/components/game/hooks/useClearGameCoverChoice";

const mocks = vi.hoisted(() => ({
  session: {
    data: null as { user: { id: string } } | null,
    isPending: false,
  },
}));

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => mocks.session,
    getSession: vi.fn(),
  },
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

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "GameCoverSelectionWrapper";
  return Wrapper;
}

const gameDto = { relations: { cover: true } };

const gameOneKey = ["game", 1, gameDto];
const gameOnePersonalizedKey = [
  "game",
  1,
  gameDto,
  { coverContext: { viewer: "viewer", owner: null, mode: "any" } },
];
const gameAllKey = ["game", "all", [1], { cover: true }];
const optionsKey = ["game-cover", 1, "options"];
const choiceKey = ["game-cover", 1, "mine", "viewer"];
const filteredLibraryKey = [
  "collection-entries",
  "all",
  "viewer",
  0,
  20,
  undefined,
  undefined,
  undefined,
  { hasCustomCover: true },
];
const filteredCollectionKey = [
  "collection-entries",
  "collection-id",
  0,
  20,
  undefined,
  undefined,
  undefined,
  { hasCustomCover: true },
];
const filteredFavoritesKey = [
  "collection-entries",
  "favorites",
  "viewer",
  0,
  20,
  undefined,
  { hasCustomCover: true },
];
const unfilteredLibraryKey = [
  "collection-entries",
  "all",
  "viewer",
  0,
  20,
  undefined,
  undefined,
  undefined,
];
const otherGameKey = ["game", 2, gameDto];
const unrelatedKey = ["userProfile", "viewer"];

const filteredKeys = [
  filteredLibraryKey,
  filteredCollectionKey,
  filteredFavoritesKey,
];
const untouchedKeys = [unfilteredLibraryKey, otherGameKey, unrelatedKey];
const gameKeys = [
  gameOneKey,
  gameOnePersonalizedKey,
  gameAllKey,
  optionsKey,
  choiceKey,
];

function seedQueries(client: QueryClient) {
  for (const key of [...gameKeys, ...filteredKeys, ...untouchedKeys]) {
    client.setQueryData(key, { seeded: true });
  }
}

function expectInvalidated(client: QueryClient, keys: unknown[][]) {
  for (const key of keys) {
    expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  }
}

function expectUntouched(client: QueryClient, keys: unknown[][]) {
  for (const key of keys) {
    expect(client.getQueryState(key)?.isInvalidated).toBe(false);
  }
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  signOut();
});

describe("useGameCoverChoice", () => {
  it("reads the signed-in viewer's stored choice", async () => {
    signIn("viewer");
    const findMine = vi
      .spyOn(GameCoverService, "gameCoverControllerFindMineV1")
      .mockResolvedValue({ coverOptionId: 12 });
    const client = createClient();

    const { result } = renderHook(() => useGameCoverChoice(1), {
      wrapper: createWrapper(client),
    });

    await waitFor(() =>
      expect(result.current.data).toEqual({ coverOptionId: 12 }),
    );
    expect(findMine).toHaveBeenCalledWith(1);
    expect(
      client.getQueryState(["game-cover", 1, "mine", "viewer"]),
    ).toBeDefined();
  });

  it("stays disabled while signed out", async () => {
    signOut();
    const findMine = vi.spyOn(
      GameCoverService,
      "gameCoverControllerFindMineV1",
    );
    const client = createClient();

    const { result } = renderHook(() => useGameCoverChoice(1), {
      wrapper: createWrapper(client),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
    expect(findMine).not.toHaveBeenCalled();
  });
});

describe("cover choice mutations", () => {
  it("stores the option id and invalidates the cover queries after PUT", async () => {
    signIn("viewer");
    const setMine = vi
      .spyOn(GameCoverService, "gameCoverControllerSetMineV1")
      .mockResolvedValue({ coverOptionId: 18 });
    const client = createClient();
    seedQueries(client);

    const { result } = renderHook(() => useSetGameCoverChoice(1), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.mutate(18));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(setMine).toHaveBeenCalledWith(1, { coverOptionId: 18 });
    expect(client.getQueryState(choiceKey)?.data).toEqual({
      coverOptionId: 18,
    });
    expectInvalidated(client, [...gameKeys, ...filteredKeys]);
    expectUntouched(client, untouchedKeys);
  });

  it("clears the choice and invalidates the cover queries after DELETE", async () => {
    signIn("viewer");
    const removeMine = vi
      .spyOn(GameCoverService, "gameCoverControllerRemoveMineV1")
      .mockResolvedValue({});
    const client = createClient();
    seedQueries(client);
    client.setQueryData(choiceKey, { coverOptionId: 12 });

    const { result } = renderHook(() => useClearGameCoverChoice(1), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(removeMine).toHaveBeenCalledWith(1);
    expect(client.getQueryState(choiceKey)?.data).toEqual({
      coverOptionId: null,
    });
    expectInvalidated(client, [...gameKeys, ...filteredKeys]);
    expectUntouched(client, untouchedKeys);
  });
});
