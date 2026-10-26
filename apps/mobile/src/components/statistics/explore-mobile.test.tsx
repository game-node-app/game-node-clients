// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExploreGamesPageView } from "../explore/ExploreGamesPageView";
const state = vi.hoisted(() => ({ request: vi.fn(), games: vi.fn() }));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@ionic/react", async () => {
  const React = await import("react");
  return {
    IonSelect: ({ onIonChange }: any) =>
      React.createElement(
        "button",
        { onClick: () => onIonChange({ detail: { value: "all" } }) },
        "Period",
      ),
    IonSelectOption: () => null,
  };
});
vi.mock("@mantine/core", async () => {
  const React = await import("react");
  const actual = await vi.importActual<any>("@mantine/core");
  const C = ({ children }: any) => React.createElement("div", null, children);
  return { ...actual, Flex: C, Stack: C };
});
vi.mock("@repo/ui", async () => {
  const React = await import("react");
  const C: any = ({ children }: any) =>
    React.createElement("div", null, children);
  C.Content = ({ items, children }: any) =>
    React.createElement(
      "div",
      null,
      items?.map((game: any) =>
        React.createElement("span", { key: game.id }, game.name),
      ),
      children,
    );
  C.LoadingSkeletons = () => null;
  return {
    GameView: C,
    SimpleInfiniteLoader: () => null,
    useInfiniteTrendingGames: (dto: any) => {
      state.request(dto);
      return {
        data: {
          pages: [
            { items: [{ sourceId: 2 }, { sourceId: 1 }] },
            { items: [{ sourceId: 1 }, { sourceId: 3 }] },
          ],
        },
        isFetching: false,
      };
    },
    useGames: (dto: any) => {
      state.games(dto);
      return {
        data: [
          { id: 3, name: "3" },
          { id: 1, name: "1" },
          { id: 2, name: "2" },
        ],
        isFetching: false,
      };
    },
  };
});
afterEach(() => {
  cleanup();
  state.request.mockClear();
  state.games.mockClear();
});

it("preserves first ranked order and updates period", () => {
  const page = render(<ExploreGamesPageView />);
  expect(page.container.textContent).toBe("Period213");
  expect(state.games).toHaveBeenLastCalledWith(
    expect.objectContaining({ gameIds: [2, 1, 3] }),
  );
  fireEvent.click(screen.getByText("Period"));
  expect(state.request).toHaveBeenLastCalledWith(
    expect.objectContaining({ period: "all", limit: 48 }),
  );
});
