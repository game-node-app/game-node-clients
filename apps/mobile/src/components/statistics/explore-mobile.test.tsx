// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ExploreGamesPageView } from "../explore/ExploreGamesPageView";
const state = vi.hoisted(() => ({ request: vi.fn(), games: vi.fn() }));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@ionic/react", async () => {
  const React = await import("react");
  return {
    IonSelect: ({
      onIonChange,
    }: {
      onIonChange: (event: { detail: { value: string } }) => void;
    }) =>
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
  const actual =
    await vi.importActual<typeof import("@mantine/core")>("@mantine/core");
  const C = ({ children }: import("react").PropsWithChildren) =>
    React.createElement("div", null, children);
  return { ...actual, Flex: C, Stack: C };
});
vi.mock("@repo/ui", async () => {
  const React = await import("react");
  const C = ({ children }: import("react").PropsWithChildren) =>
    React.createElement("div", null, children);
  C.Content = function MockContent({
    items,
    children,
  }: import("react").PropsWithChildren<{
    items?: import("@repo/wrapper/server").Game[];
  }>) {
    return React.createElement(
      "div",
      null,
      items?.map((game: import("@repo/wrapper/server").Game) =>
        React.createElement("span", { key: game.id }, game.name),
      ),
      children,
    );
  };
  C.LoadingSkeletons = function MockLoadingSkeletons() {
    return null;
  };
  return {
    GameView: C,
    SimpleInfiniteLoader: () => null,
    useInfiniteTrendingGames: (
      dto: Parameters<typeof import("@repo/ui").useInfiniteTrendingGames>[0],
    ) => {
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
    useGames: (dto: Parameters<typeof import("@repo/ui").useGames>[0]) => {
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
