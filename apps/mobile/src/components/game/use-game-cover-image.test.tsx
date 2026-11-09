// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Game, GameRepositoryService } from "@repo/wrapper/server";
import { SearchGame } from "../../../../../packages/ui/src/components/game/search/utils/types";
import {
  GAME_COVER_PLACEHOLDER,
  useGameCoverImage,
} from "../../../../../packages/ui/src/components/game/hooks/useGameCoverImage";
import { ImageSize } from "../../../../../packages/ui/src/components/game/util/getSizedImageUrl";

const IGDB_URL = "https://images.igdb.com/igdb/image/upload";

const igdbUrl = (name: string, size = "cover_big") =>
  `${IGDB_URL}/t_${size}/${name}.jpg`;

const personalizedGame: Game = {
  id: 42,
  name: "Cover game",
  source: Game.source.MYSQL,
  cover: { url: igdbUrl("chosen") },
} as unknown as Game;

const defaultGame: Game = {
  id: 42,
  name: "Cover game",
  source: Game.source.MYSQL,
  cover: { url: igdbUrl("default") },
} as unknown as Game;

const searchGame: SearchGame = {
  id: 7,
  name: "Search game",
  source: "manticore",
  coverUrl: igdbUrl("search"),
};

const createClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const createWrapper = (client: QueryClient) => {
  return function QueryClientWrapper({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("fetches the default cover once when the shown cover fails", async () => {
  const client = createClient();
  const findOne = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
    .mockResolvedValue(defaultGame);
  const { result } = renderHook(
    () => useGameCoverImage(personalizedGame, ImageSize.COVER_BIG),
    { wrapper: createWrapper(client) },
  );

  expect(result.current.src).toBe(igdbUrl("chosen"));

  act(() => result.current.onError());

  await waitFor(() => expect(result.current.src).toBe(igdbUrl("default")));
  expect(findOne).toHaveBeenCalledTimes(1);
  expect(findOne).toHaveBeenCalledWith(42, {
    relations: { cover: true },
  });
});

it("shows the placeholder after the default cover also fails", async () => {
  const client = createClient();
  const findOne = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
    .mockResolvedValue(defaultGame);
  const { result } = renderHook(
    () => useGameCoverImage(personalizedGame, ImageSize.COVER_BIG),
    { wrapper: createWrapper(client) },
  );

  act(() => result.current.onError());
  await waitFor(() => expect(result.current.src).toBe(igdbUrl("default")));

  act(() => result.current.onError());

  expect(result.current.src).toBe(GAME_COVER_PLACEHOLDER);
  expect(findOne).toHaveBeenCalledTimes(1);
});

it("does not retry a failed URL", async () => {
  const client = createClient();
  const findOne = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
    .mockResolvedValue(defaultGame);
  // The game has no alternative: the unpersonalized read returns the same URL.
  const onlyCoverGame = {
    ...personalizedGame,
    cover: { url: igdbUrl("default") },
  } as Game;
  const { result } = renderHook(
    () => useGameCoverImage(onlyCoverGame, ImageSize.COVER_BIG),
    { wrapper: createWrapper(client) },
  );

  act(() => result.current.onError());
  await waitFor(() => expect(result.current.src).toBe(GAME_COVER_PLACEHOLDER));

  act(() => result.current.onError());

  expect(result.current.src).toBe(GAME_COVER_PLACEHOLDER);
  expect(findOne).toHaveBeenCalledTimes(1);
});

it("resets the failure when a new URL arrives", async () => {
  const client = createClient();
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindOneByIdV1",
  ).mockResolvedValue(defaultGame);
  const { result, rerender } = renderHook(
    ({ game }: { game: Game }) => useGameCoverImage(game, ImageSize.COVER_BIG),
    {
      initialProps: { game: personalizedGame },
      wrapper: createWrapper(client),
    },
  );

  act(() => result.current.onError());
  await waitFor(() => expect(result.current.src).toBe(igdbUrl("default")));

  const nextGame = {
    ...personalizedGame,
    cover: { url: igdbUrl("chosentwo") },
  } as Game;
  rerender({ game: nextGame });

  await waitFor(() => expect(result.current.src).toBe(igdbUrl("chosentwo")));

  act(() => result.current.onError());
  await waitFor(() => expect(result.current.src).toBe(igdbUrl("default")));
});

it("goes straight to the placeholder for search results", async () => {
  const client = createClient();
  const findOne = vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindOneByIdV1",
  );
  const { result } = renderHook(
    () => useGameCoverImage(searchGame, ImageSize.COVER_BIG),
    { wrapper: createWrapper(client) },
  );

  expect(result.current.src).toBe(igdbUrl("search"));

  act(() => result.current.onError());

  expect(result.current.src).toBe(GAME_COVER_PLACEHOLDER);
  expect(findOne).not.toHaveBeenCalled();
});
