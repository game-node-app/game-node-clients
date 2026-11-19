// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ExploreGamesPageView } from "../explore/ExploreGamesPageView";
const state = vi.hoisted(() => ({ request: vi.fn(), games: vi.fn() }));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/components/explore/TrendingShelf", () => ({
  TrendingShelf: ({
    title,
    onSeeAll,
  }: {
    title: string;
    onSeeAll?: () => void;
  }) => (
    <button data-testid="shelf" onClick={onSeeAll}>
      {title}
    </button>
  ),
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
  const Button = ({
    children,
    onClick,
    ...rest
  }: import("react").PropsWithChildren<{
    onClick?: () => void;
    role?: string;
    "aria-selected"?: boolean;
  }>) =>
    React.createElement(
      "button",
      { onClick, role: rest.role, "aria-selected": rest["aria-selected"] },
      children,
    );
  return { ...actual, Flex: C, Stack: C, Button };
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
    useGamesResource: () => ({
      data: [
        { id: 12, name: "RPG" },
        { id: 31, name: "Adventure" },
      ],
    }),
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

it("shows category shelves by default without loading the flat grid", () => {
  render(<ExploreGamesPageView />);
  expect(screen.getAllByTestId("shelf").map((el) => el.textContent)).toEqual([
    "explore.sections.topOverall",
    "RPG",
    "Adventure",
  ]);
  expect(state.games).toHaveBeenLastCalledWith(
    expect.objectContaining({ gameIds: [2, 1, 3] }),
  );
});

it("opens the filtered ranking for a genre and keeps order and period", () => {
  const page = render(<ExploreGamesPageView />);
  fireEvent.click(screen.getByRole("tab", { name: "RPG" }));
  expect(state.request).toHaveBeenLastCalledWith(
    expect.objectContaining({ criteria: { genres: [12] }, limit: 48 }),
  );
  expect(screen.queryAllByTestId("shelf")).toHaveLength(0);
  expect(page.container.textContent).toContain("213");
  fireEvent.click(screen.getByText("Period"));
  expect(state.request).toHaveBeenLastCalledWith(
    expect.objectContaining({ period: "all", criteria: { genres: [12] } }),
  );
  fireEvent.click(screen.getByRole("tab", { name: "explore.filters.all" }));
  expect(screen.getAllByTestId("shelf")).toHaveLength(3);
});
