// @vitest-environment jsdom
import React from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import type { Game } from "@repo/wrapper/server";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { ConsoleHome } from "../../../../packages/ui/src/theme/experiences/console/ConsoleHome";
import { setupDom } from "../components/mcp/testUtils";

const state = vi.hoisted(() => ({
  userId: undefined as string | undefined,
  games: [] as Game[],
  usePlaytimeForUser: vi.fn(),
  useRecommendations: vi.fn(),
}));

vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => state.userId,
}));
vi.mock(
  "../../../../packages/ui/src/components/playtime/hooks/usePlaytimeForUser",
  () => ({ usePlaytimeForUser: state.usePlaytimeForUser }),
);
vi.mock(
  "../../../../packages/ui/src/components/recommendation/hook/useRecommendations",
  () => ({ useRecommendations: state.useRecommendations }),
);
vi.mock(
  "../../../../packages/ui/src/components/statistics/hooks/useTrendingGames",
  () => ({
    useTrendingGames: () => ({
      data: { items: [1, 2, 3].map((sourceId) => ({ sourceId })) },
      isError: false,
    }),
  }),
);
vi.mock("../../../../packages/ui/src/components/game/hooks/useGames", () => ({
  useGames: (dto: { gameIds?: number[] }) => ({
    data: (dto.gameIds ?? [])
      .map((id) => state.games.find((game) => game.id === id))
      .filter(Boolean),
    isLoading: false,
  }),
}));
vi.mock("../../../../packages/ui/src/components/game/hooks/useGame", () => ({
  useGame: (id: number | undefined) => ({
    data: id ? { videos: [{ videoId: "trailer-1" }] } : null,
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
    artworks: [
      {
        url: `https://images.igdb.com/igdb/image/upload/t_1080p/art${id}.jpg`,
        width: 1920,
        height: 1080,
      },
    ],
    screenshots: [],
    cover: {
      url: `https://images.igdb.com/igdb/image/upload/t_cover_big/co${id}.jpg`,
    },
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

const PresenterSlots = {
  HomeReleases: () => <span data-slot="home-releases">home-releases</span>,
  RecentBlogPostsCarousel: () => <span data-slot="blog">blog</span>,
};

const makeWrapper = (presenters: Record<string, React.ComponentType> = {}) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider language="en">
      <MantineProvider>
        <UIProvider
          hooks={hooks}
          presenters={{ Link: LinkPresenter, ...presenters }}
        >
          {children}
        </UIProvider>
      </MantineProvider>
    </I18nProvider>
  );
  return Wrapper;
};

const wrapper = makeWrapper(PresenterSlots);

beforeEach(() => {
  setupDom();
  state.userId = undefined;
  state.games = [game(1), game(2), game(3)];
  state.usePlaytimeForUser.mockReturnValue({
    data: { data: [{ gameId: 2 }] },
    isError: false,
  });
  state.useRecommendations.mockReturnValue({
    data: { gameIds: [3] },
    isError: false,
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("console home", () => {
  it("omits account rows when signed out", async () => {
    render(<ConsoleHome />, { wrapper });

    expect(
      await screen.findByRole("heading", { name: "Trending Games" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Recently Played" }),
    ).toBeNull();
    expect(
      screen.queryByRole("heading", {
        name: "Based on your played games",
      }),
    ).toBeNull();
    expect(state.usePlaytimeForUser).not.toHaveBeenCalled();
    expect(state.useRecommendations).not.toHaveBeenCalled();
  });

  it("shows the playtime and recommendation rows when signed in", async () => {
    state.userId = "user-1";
    render(<ConsoleHome />, { wrapper });

    expect(
      await screen.findByRole("heading", { name: "Recently Played" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Based on your played games" }),
    ).toBeTruthy();
    expect(state.usePlaytimeForUser).toHaveBeenCalled();
    expect(state.useRecommendations).toHaveBeenCalledWith("played", 10);
  });

  it("updates the hero art and title when a tile gets focus", async () => {
    render(<ConsoleHome />, { wrapper });

    const tile = await screen.findByRole("link", { name: "Game 2" });
    fireEvent.focus(tile);

    expect(
      screen.getByRole("heading", { level: 2, name: "Game 2" }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(
        document
          .querySelector("[data-console-backdrop]")
          ?.getAttribute("style"),
      ).toContain("art2.jpg"),
    );
  });

  it("shows the search slot under the hero row", async () => {
    render(<ConsoleHome search={<span>search-slot</span>} />, { wrapper });

    const search = await screen.findByLabelText("Search games");
    expect(search.textContent).toBe("search-slot");
    expect(search.closest("[data-console-hero]")).toBeTruthy();
  });

  it("renders releases and blog through their presenters", async () => {
    render(<ConsoleHome />, { wrapper });

    expect(await screen.findByText("home-releases")).toBeTruthy();
    expect(screen.getByText("blog")).toBeTruthy();
  });

  it("lets a theme screen pack override the releases and blog presenters", async () => {
    render(<ConsoleHome />, {
      wrapper: makeWrapper({
        HomeReleases: () => <span>override-releases</span>,
        RecentBlogPostsCarousel: () => <span>override-blog</span>,
      }),
    });

    expect(await screen.findByText("override-releases")).toBeTruthy();
    expect(screen.getByText("override-blog")).toBeTruthy();
    expect(screen.queryByText("home-releases")).toBeNull();
    expect(screen.queryByText("blog")).toBeNull();
  });

  it("keeps platform-only sections available through the extras slot", async () => {
    render(<ConsoleHome extras={<span>events-and-activity</span>} />, {
      wrapper,
    });

    expect(await screen.findByText("events-and-activity")).toBeTruthy();
  });

  it("starts the trailer only after the focus settles", async () => {
    vi.useFakeTimers();
    render(<ConsoleHome />, { wrapper });

    await act(async () => {});
    expect(document.querySelector("[data-console-trailer]")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(2999);
    });
    expect(document.querySelector("[data-console-trailer]")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(2);
    });
    expect(document.querySelector("[data-console-trailer]")).toBeTruthy();
    expect(document.querySelector("iframe")?.getAttribute("src")).toContain(
      "trailer-1",
    );
  });

  it("does not start the trailer under reduced motion", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    vi.useFakeTimers();
    render(<ConsoleHome />, { wrapper });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(document.querySelector("[data-console-trailer]")).toBeNull();
  });

  it("waits for the trailer again after A -> B -> A", async () => {
    vi.useFakeTimers();
    render(<ConsoleHome />, { wrapper });

    await act(async () => {});
    await act(async () => {
      vi.advanceTimersByTime(3001);
    });
    expect(document.querySelector("[data-console-trailer]")).toBeTruthy();

    fireEvent.focus(screen.getByRole("link", { name: "Game 2" }));
    await act(async () => {});
    expect(document.querySelector("[data-console-trailer]")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.focus(screen.getByRole("link", { name: "Game 1" }));
    await act(async () => {});
    expect(document.querySelector("[data-console-trailer]")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(2999);
    });
    expect(document.querySelector("[data-console-trailer]")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(2);
    });
    expect(document.querySelector("[data-console-trailer]")).toBeTruthy();
  });
});
