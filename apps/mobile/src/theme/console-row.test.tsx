// @vitest-environment jsdom
import React from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { getNextRovingIndex } from "../../../../packages/ui/src/theme/experiences/console/consoleRowNavigation";
import { ConsoleGameRow } from "../../../../packages/ui/src/theme/experiences/console/ConsoleGameRow";
import { setupDom } from "../components/mcp/testUtils";

const state = vi.hoisted(() => ({
  games: [] as Array<Pick<Game, "id" | "name" | "cover">>,
}));

vi.mock("../../../../packages/ui/src/components/game/hooks/useGames", () => ({
  useGames: () => ({ data: state.games, isLoading: false }),
}));

const game = (id: number) =>
  ({
    id,
    name: `Game ${id}`,
    cover: {
      url: `https://images.igdb.com/igdb/image/upload/t_cover_big/co${id}.jpg`,
    },
  }) as Pick<Game, "id" | "name" | "cover">;

const LinkPresenter = ({ href, children, ...rest }: LinkComponentProps) => (
  <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
    {children as ReactNode}
  </a>
);

const hooks = {
  useRouter: () => ({
    pathname: "/",
    back: vi.fn(),
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider language="en">
    <MantineProvider>
      <UIProvider hooks={hooks} presenters={{ Link: LinkPresenter }}>
        {children}
      </UIProvider>
    </MantineProvider>
  </I18nProvider>
);

beforeEach(() => {
  setupDom();
  state.games = [game(1), game(2), game(3)];
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("console row navigation", () => {
  it("moves the roving index with the arrow, Home and End keys", () => {
    expect(getNextRovingIndex(1, "ArrowRight", 3)).toBe(2);
    expect(getNextRovingIndex(1, "ArrowLeft", 3)).toBe(0);
    expect(getNextRovingIndex(2, "ArrowRight", 3)).toBe(2);
    expect(getNextRovingIndex(0, "ArrowLeft", 3)).toBe(0);
    expect(getNextRovingIndex(1, "Home", 3)).toBe(0);
    expect(getNextRovingIndex(1, "End", 3)).toBe(2);
    expect(getNextRovingIndex(1, "Enter", 3)).toBeNull();
    expect(getNextRovingIndex(0, "ArrowRight", 0)).toBeNull();
  });

  it("focuses the next tile and scrolls it into view", async () => {
    render(
      <ConsoleGameRow
        title={"Trending Games"}
        gameIds={[1, 2, 3]}
        onFocusGame={() => {}}
      />,
      { wrapper },
    );

    const tiles = await screen.findAllByRole("link");
    const row = document.querySelector("[data-console-row]") as HTMLElement;
    const scroll = vi.mocked(HTMLElement.prototype.scrollIntoView);
    scroll.mockClear();

    tiles[0].focus();
    fireEvent.keyDown(row, { key: "ArrowRight" });

    expect(document.activeElement).toBe(tiles[1]);
    expect(scroll).toHaveBeenCalledWith(
      expect.objectContaining({
        block: "nearest",
        inline: "nearest",
      }),
    );
  });

  it("keeps the column when moving between rows", async () => {
    render(
      <>
        <ConsoleGameRow
          title={"First Row"}
          gameIds={[1, 2, 3]}
          onFocusGame={() => {}}
        />
        <ConsoleGameRow
          title={"Second Row"}
          gameIds={[1, 2, 3]}
          onFocusGame={() => {}}
        />
      </>,
      { wrapper },
    );

    await screen.findAllByRole("link");
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>("[data-console-row]"),
    );
    const firstRowTiles = within(rows[0]).getAllByRole("link");
    const secondRowTiles = within(rows[1]).getAllByRole("link");

    firstRowTiles[1].focus();
    fireEvent.keyDown(rows[0], { key: "ArrowDown" });
    expect(document.activeElement).toBe(secondRowTiles[1]);

    fireEvent.keyDown(rows[1], { key: "ArrowUp" });
    expect(document.activeElement).toBe(firstRowTiles[1]);
  });

  it("renders tiles and reports the focused game", async () => {
    const onFocusGame = vi.fn();
    render(
      <ConsoleGameRow
        title={"Trending Games"}
        gameIds={[1, 2, 3]}
        onFocusGame={onFocusGame}
      />,
      { wrapper },
    );

    const tiles = await screen.findAllByRole("link");
    await waitFor(() =>
      expect(onFocusGame).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 }),
        true,
      ),
    );

    onFocusGame.mockClear();
    tiles[1].focus();
    expect(onFocusGame).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2 }),
    );

    fireEvent.keyDown(document.querySelector("[data-console-row]")!, {
      key: "ArrowRight",
    });
    expect(document.activeElement).toBe(tiles[2]);
  });
});
