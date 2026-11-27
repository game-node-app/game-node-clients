// @vitest-environment jsdom
import React from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import type { Game } from "@repo/wrapper/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { setupDom } from "../components/mcp/testUtils";
import HomePage from "../pages/home";

const state = vi.hoisted(() => ({
  userId: undefined as string | undefined,
  games: [] as Game[],
  genres: [] as Array<{ id: number; name: string }>,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/components/general/AppPage.tsx", () => ({
  AppPage: ({
    children,
    withSearch,
  }: {
    children?: ReactNode;
    withSearch?: boolean;
  }) => (
    <div data-testid="app-page" data-with-search={String(withSearch)}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/home/HomeActivityShelf", () => ({
  HomeActivityShelf: ({ title }: { title: string }) => (
    <span data-slot="activity">{title}</span>
  ),
}));

vi.mock("@ionic/react", () => ({
  IonRefresher: ({ children }: { children?: ReactNode }) => <>{children}</>,
  IonRefresherContent: () => null,
  IonSelect: ({ "aria-label": label }: { "aria-label"?: string }) => (
    <button type="button">{label}</button>
  ),
  IonSelectOption: () => null,
}));

vi.mock("@repo/ui", async () => {
  const React = await import("react");

  const Probe = (props: Record<string, unknown>) =>
    React.createElement(
      "div",
      { "data-testid": "presenter" },
      React.createElement(
        "div",
        { "data-slot": "search" },
        props.search as ReactNode,
      ),
      React.createElement(
        "div",
        { "data-slot": "extras" },
        props.extras as ReactNode,
      ),
      React.createElement(
        "div",
        { "data-slot": "filters" },
        props.filters as ReactNode,
      ),
      React.createElement(
        "div",
        { "data-slot": "results" },
        props.filtered ? (props.results as ReactNode) : null,
      ),
      React.createElement("span", {
        "data-filtered": String(!!props.filtered),
      }),
    );

  const GameView = ({ children }: { children?: ReactNode }) =>
    React.createElement("div", null, children);
  const GameViewContent = ({
    items,
    children,
  }: {
    items?: Game[];
    children?: ReactNode;
  }) =>
    React.createElement(
      "div",
      null,
      items?.map((game) =>
        React.createElement("span", { key: game.id }, game.name),
      ),
      children,
    );
  GameViewContent.displayName = "GameView.Content";
  GameView.Content = GameViewContent;
  const GameViewLoadingSkeletons = () => null;
  GameViewLoadingSkeletons.displayName = "GameView.LoadingSkeletons";
  GameView.LoadingSkeletons = GameViewLoadingSkeletons;

  return {
    BackToTopButton: () => null,
    buildPresenterComponent: () => Probe,
    cn: (...classes: Array<string | false>) =>
      classes.filter(Boolean).join(" "),
    CenteredErrorMessage: ({ message }: { message: string }) =>
      React.createElement("div", null, message),
    ExploreTrendingGames: () => null,
    GameView,
    HomeEventsSection: () =>
      React.createElement("span", { "data-slot": "events" }, "events"),
    HomeView: () => null,
    RecentBlogPostsCarousel: () => null,
    RecommendationCarousel: () => null,
    ReleaseStrip: () => null,
    SimpleInfiniteLoader: () => null,
    TrendingGamesList: () => null,
    TrendingReviewCarousel: () => null,
    useGames: (dto: { gameIds?: number[] }) => ({
      data: (dto.gameIds ?? [])
        .map((id) => state.games.find((game) => game.id === id))
        .filter(Boolean),
      isLoading: false,
      isFetching: false,
    }),
    useGamesByPages: (pages: number[][] | undefined) => ({
      data: (pages ?? [])
        .flat()
        .map((id) => state.games.find((game) => game.id === id))
        .filter(Boolean),
      isLoading: false,
      isFetching: false,
    }),
    useGamesResource: () => ({ data: state.genres }),
    useInfiniteTrendingGames: () => ({
      data: {
        pages: [{ items: state.games.map((game) => ({ sourceId: game.id })) }],
      },
      isFetching: false,
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    }),
    useUserId: () => state.userId,
  };
});

vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => state.userId,
}));
vi.mock(
  "../../../../packages/ui/src/components/playtime/hooks/usePlaytimeForUser",
  () => ({
    usePlaytimeForUser: () => ({ data: { data: [] }, isError: false }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/recommendation/hook/useRecommendations",
  () => ({
    useRecommendations: () => ({ data: { gameIds: [] }, isError: false }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/statistics/hooks/useTrendingGames",
  () => ({
    useTrendingGames: () => ({
      data: { items: state.games.map((game) => ({ sourceId: game.id })) },
      isError: false,
    }),
  }),
);
vi.mock("../../../../packages/ui/src/components/game/hooks/useGame", () => ({
  useGame: () => ({ data: { videos: [] } }),
}));
vi.mock(
  "../../../../packages/ui/src/components/game/hooks/useGamesResource",
  () => ({ useGamesResource: () => ({ data: state.genres }) }),
);
vi.mock("../../../../packages/ui/src/components/game/hooks/useGames", () => ({
  useGames: (dto: { gameIds?: number[] }) => ({
    data: (dto.gameIds ?? [])
      .map((id) => state.games.find((game) => game.id === id))
      .filter(Boolean),
    isLoading: false,
    isFetching: false,
  }),
}));
vi.mock(
  "../../../../packages/ui/src/theme/experiences/console/ConsoleReviewRow",
  () => ({ ConsoleReviewRow: () => null }),
);

const game = (id: number) =>
  ({
    id,
    name: `Game ${id}`,
    aggregatedRating: 90,
    artworks: [],
    screenshots: [],
    cover: { url: `https://cdn.example/co${id}.jpg` },
    platforms: [],
  }) as unknown as Game;

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

const makeWrapper = (presenters: Record<string, React.ComponentType> = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MantineProvider>
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <UIProvider
          hooks={hooks}
          presenters={{ Link: LinkPresenter, ...presenters }}
        >
          {children}
        </UIProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
  return Wrapper;
};

const Slot = ({ label }: { label: string }) => (
  <span data-slot={label}>{label}</span>
);

const renderHomePage = () =>
  render(<HomePage />, {
    wrapper: makeWrapper({
      HomeReleases: () => <Slot label="releases" />,
      RecentBlogPostsCarousel: () => <Slot label="blog" />,
    }),
  });

beforeEach(() => {
  setupDom();
  state.userId = undefined;
  state.games = [1, 2, 3].map((id) => game(id));
  state.genres = [{ id: 12, name: "RPG" }];
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("mobile home caller under the console experience", () => {
  it("keeps native search and hands events/activity to the console composition", async () => {
    renderHomePage();

    const extras = await screen.findByText("events");
    expect(extras).toBeTruthy();
    expect(screen.getByTestId("app-page").dataset.withSearch).toBe("true");
    expect(screen.getByText("home.recentActivity")).toBeTruthy();
    expect(screen.getByText("home.lastReviews")).toBeTruthy();
    expect(document.querySelector("[data-slot='search']")?.textContent).toBe(
      "",
    );
    // the caller passes each platform-only section once
    expect(screen.getAllByText("events")).toHaveLength(1);
    expect(document.querySelectorAll("[data-slot='activity']")).toHaveLength(2);
  });
});
