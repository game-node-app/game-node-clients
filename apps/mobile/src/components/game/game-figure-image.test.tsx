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
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Game, GameRepositoryService } from "@repo/wrapper/server";
import { GameFigureImage } from "../../../../../packages/ui/src/components/game/figure/GameFigureImage";
import { GAME_COVER_PLACEHOLDER } from "../../../../../packages/ui/src/components/game/hooks/useGameCoverImage";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { LinkComponentProps } from "../../../../../packages/ui/src/util/link";

const IGDB_URL = "https://images.igdb.com/igdb/image/upload";

const igdbUrl = (name: string) => `${IGDB_URL}/t_cover_big/${name}.jpg`;

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

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

const PresenterLink = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...rest}>
    {children}
  </a>
);

const renderFigure = (onError?: React.ReactEventHandler<HTMLImageElement>) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <UIProvider
        presenters={{ Link: PresenterLink }}
        hooks={{
          useRouter: () => ({
            pathname: "",
            back: () => {},
            push: async () => {},
            query: new URLSearchParams(),
          }),
        }}
      >
        <MantineProvider>
          <GameFigureImage
            game={personalizedGame}
            imageProps={onError ? { onError } : undefined}
          />
        </MantineProvider>
      </UIProvider>
    </QueryClientProvider>,
  );
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("falls back to the default cover and calls the caller's onError", async () => {
  const findOne = vi
    .spyOn(GameRepositoryService, "gameRepositoryControllerFindOneByIdV1")
    .mockResolvedValue(defaultGame);
  const callerOnError = vi.fn();
  renderFigure(callerOnError);
  const image = screen.getByAltText("Cover game");

  expect(image.getAttribute("src")).toContain("chosen.jpg");

  fireEvent.error(image);

  await waitFor(() =>
    expect(image.getAttribute("src")).toContain("default.jpg"),
  );
  expect(callerOnError).toHaveBeenCalledTimes(1);
  expect(findOne).toHaveBeenCalledTimes(1);
});

it("shows the placeholder after both images fail, still composing onError", async () => {
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindOneByIdV1",
  ).mockResolvedValue(defaultGame);
  const callerOnError = vi.fn();
  renderFigure(callerOnError);
  const image = screen.getByAltText("Cover game");

  fireEvent.error(image);
  await waitFor(() =>
    expect(image.getAttribute("src")).toContain("default.jpg"),
  );

  fireEvent.error(image);

  expect(image.getAttribute("src")).toBe(GAME_COVER_PLACEHOLDER);
  expect(callerOnError).toHaveBeenCalledTimes(2);
});
