// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ComponentProps, useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExploreView } from "../../../../../packages/ui/src/components/explore/view/ExploreView";
import type { ExploreViewValue } from "../../../../../packages/ui/src/components/explore/util/exploreValue";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import { MobileExplorePeriodSelect } from "../explore/MobileExplorePeriodSelect";
import { setupDom } from "../mcp/testUtils";

const state = vi.hoisted(() => ({ request: vi.fn(), games: vi.fn() }));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@ionic/react", () => ({
  IonSelect: ({
    onIonChange,
  }: {
    onIonChange: (event: { detail: { value: string } }) => void;
  }) => (
    <button onClick={() => onIonChange({ detail: { value: "all" } })}>
      Period
    </button>
  ),
  IonSelectOption: () => null,
}));
vi.mock(
  "../../../../../packages/ui/src/components/explore/shelf/TrendingShelf",
  () => ({
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
  }),
);
vi.mock("../../../../../packages/ui/src/components/game/view/GameView", () => {
  function GameView({ children }: import("react").PropsWithChildren) {
    return <div>{children}</div>;
  }
  GameView.Content = function Content({
    items,
  }: {
    items?: { id: number; name: string }[];
  }) {
    return <div>{items?.map((game) => game.name)}</div>;
  };
  GameView.LoadingSkeletons = function LoadingSkeletons() {
    return null;
  };
  return { GameView };
});
vi.mock(
  "../../../../../packages/ui/src/components/feed/SimpleInfiniteLoader",
  () => ({ SimpleInfiniteLoader: () => null }),
);
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGamesResource",
  () => ({
    useGamesResource: () => ({
      data: [
        { id: 12, name: "RPG" },
        { id: 31, name: "Adventure" },
      ],
    }),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/statistics/hooks/useInfiniteTrendingGames",
  () => ({
    useInfiniteTrendingGames: (dto: unknown) => {
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
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGamesByPages",
  () => ({
    useGamesByPages: (pages: number[][] | undefined) => {
      state.games(pages);
      return {
        data: [
          { id: 3, name: "3" },
          { id: 1, name: "1" },
          { id: 2, name: "2" },
        ],
        isFetching: false,
      };
    },
  }),
);

beforeEach(() => setupDom());
afterEach(() => {
  cleanup();
  state.request.mockClear();
  state.games.mockClear();
});

type Presenters = ComponentProps<typeof UIProvider>["presenters"];

const Screen = () => {
  const [value, setValue] = useState<ExploreViewValue>({
    period: "month" as ExploreViewValue["period"],
  });
  return <ExploreView value={value} onChange={setValue} />;
};

const renderScreen = (presenters: Presenters = {}) =>
  render(
    <MantineProvider>
      <UIProvider
        hooks={{} as ComponentProps<typeof UIProvider>["hooks"]}
        presenters={{
          ExplorePeriodSelect: MobileExplorePeriodSelect,
          ...presenters,
        }}
      >
        <Screen />
      </UIProvider>
    </MantineProvider>,
  );

it("shows category shelves by default without loading the flat grid", () => {
  renderScreen();
  expect(screen.getAllByTestId("shelf").map((el) => el.textContent)).toEqual([
    "explore.sections.topOverall",
    "RPG",
    "Adventure",
  ]);
  expect(state.games).not.toHaveBeenCalled();
  expect(state.request).not.toHaveBeenCalled();
});

it("opens the filtered ranking for a genre and keeps order and period", () => {
  const page = renderScreen();
  fireEvent.click(screen.getByRole("button", { name: "RPG", pressed: false }));
  expect(state.request).toHaveBeenLastCalledWith(
    expect.objectContaining({ criteria: { genres: [12] }, limit: 48 }),
  );
  expect(screen.queryAllByTestId("shelf")).toHaveLength(0);
  expect(page.container.textContent).toContain("213");
  fireEvent.click(screen.getByText("Period"));
  expect(state.request).toHaveBeenLastCalledWith(
    expect.objectContaining({ period: "all", criteria: { genres: [12] } }),
  );
  fireEvent.click(screen.getByRole("button", { name: "explore.filters.all" }));
  expect(screen.getAllByTestId("shelf")).toHaveLength(3);
});

it("opens the full overall ranking from the top shelf", () => {
  const page = renderScreen();
  fireEvent.click(screen.getByText("Period"));
  fireEvent.click(
    screen.getByRole("button", { name: "explore.sections.topOverall" }),
  );

  expect(state.request).toHaveBeenLastCalledWith({
    period: "all",
    limit: 48,
  });
  expect(page.container.textContent).toContain("213");
  expect(screen.queryAllByTestId("shelf")).toHaveLength(0);
});

it("hands the filters and the selection to a theme's explore", () => {
  renderScreen({
    ExploreTrendingGames: ({ filters, results, filtered }) => (
      <div data-testid="theme" data-filtered={String(filtered)}>
        {filters}
        {filtered && results}
      </div>
    ),
  });
  const theme = screen.getByTestId("theme");
  expect(theme.dataset.filtered).toBe("false");

  fireEvent.click(screen.getByRole("button", { name: "RPG" }));

  expect(theme.dataset.filtered).toBe("true");
  expect(screen.getByText("Period")).toBeTruthy();
  expect(theme.textContent).toContain("213");
});
