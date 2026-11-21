// @vitest-environment jsdom
import React from "react";
import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import type { BlogArticleDto, Game } from "@repo/wrapper/server";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from "@testing-library/react";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import type { LinkComponentProps } from "../../../../packages/ui/src/util";
import { ConsoleReleaseStrip } from "../../../../packages/ui/src/theme/experiences/console/ConsoleReleaseStrip";
import {
  DAY_KEY,
  getCalendarDays,
  useUpcomingReleasesByDay,
} from "../../../../packages/ui/src/theme/experiences/console/ConsoleReleaseCalendar";
import { ConsoleExplore } from "../../../../packages/ui/src/theme/experiences/console/ConsoleExplore";
import {
  ConsoleBlogSection,
  ConsoleBlogItem,
} from "../../../../packages/ui/src/theme/experiences/console/ConsoleBlogSection";
import { getReleaseDay } from "../../../../packages/ui/src/components/game/util/getLocalizedFirstReleaseDate";
import { setupDom } from "../components/mcp/testUtils";

const state = vi.hoisted(() => ({
  games: [] as Game[],
  trendingIds: [] as number[],
  trendingCalls: [] as Array<Record<string, unknown>>,
  genres: [] as Array<{ id: number; name: string }>,
  releases: undefined as { data: Game[] } | undefined,
  releasesError: false,
  releasesLoading: false,
}));

vi.mock(
  "../../../../packages/ui/src/components/game/hooks/useGamesByCollectionType",
  () => ({
    useGamesByCollectionType: () => ({
      data: state.releases,
      isLoading: state.releasesLoading,
      isError: state.releasesError,
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
vi.mock(
  "../../../../packages/ui/src/components/statistics/hooks/useTrendingGames",
  () => ({
    useTrendingGames: (dto: Record<string, unknown>) => {
      state.trendingCalls.push(dto);
      return {
        data: {
          items: state.trendingIds.map((sourceId) => ({ sourceId })),
        },
        isError: false,
      };
    },
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/game/hooks/useGamesResource",
  () => ({
    useGamesResource: () => ({ data: state.genres }),
  }),
);
vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => undefined,
}));
vi.mock(
  "../../../../packages/ui/src/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId",
  () => ({ useOwnCollectionEntryForGameId: () => ({ data: null }) }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({ useUserProfile: () => ({ data: { username: "Tester" } }) }),
);

const game = (id: number, overrides: Partial<Game> = {}) =>
  ({
    id,
    name: `Game ${id}`,
    aggregatedRating: 100 - id * 10,
    artworks: [],
    screenshots: [],
    cover: {
      url: `https://images.igdb.com/igdb/image/upload/t_cover_big/co${id}.jpg`,
    },
    platforms: [],
    ...overrides,
  }) as unknown as Game;

const post = (id: string): BlogArticleDto =>
  ({
    id,
    title: `Post ${id}`,
    excerpt: `Excerpt ${id}`,
    profileUserId: "user-1",
    cover: { url: `https://cdn.example/cover-${id}.jpg`, alt: `Post ${id}` },
    publishedAt: "2026-11-01T00:00:00.000Z",
    tags: [],
    review: null,
  }) as unknown as BlogArticleDto;

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
  state.games = [1, 2, 3, 4, 5].map((id) => game(id));
  state.trendingIds = [1, 2, 3, 4, 5];
  state.trendingCalls = [];
  state.genres = [{ id: 31, name: "Adventure" }];
  state.releases = undefined;
  state.releasesError = false;
  state.releasesLoading = false;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("console release calendar", () => {
  it("covers a month in complete Sunday-first weeks", () => {
    expect(getCalendarDays(dayjs("2026-11-01")).length % 7).toBe(0);
    expect(getCalendarDays(dayjs("2026-11-01"))[0].format(DAY_KEY)).toBe(
      "2026-11-01",
    );
    expect(getCalendarDays(dayjs("2024-02-01")).at(-1)?.format(DAY_KEY)).toBe(
      "2024-03-02",
    );
  });

  it("groups UTC release dates on their intended day and skips undated games", () => {
    expect(getReleaseDay("2026-11-03T00:00:00.000Z").format(DAY_KEY)).toBe(
      "2026-11-03",
    );
    state.releases = {
      data: [
        game(1, { firstReleaseDate: "2026-11-03T00:00:00.000Z" }),
        game(2, { firstReleaseDate: "2026-11-03T00:00:00.000Z" }),
        game(3, { firstReleaseDate: "2026-11-04T00:00:00.000Z" }),
        game(4),
      ],
    };

    const { result } = renderHook(useUpcomingReleasesByDay, { wrapper });
    expect([...result.current.gamesByDay.keys()]).toEqual([
      "2026-11-03",
      "2026-11-04",
    ]);
    expect(
      result.current.gamesByDay.get("2026-11-03")?.map((game) => game.id),
    ).toEqual([1, 2]);
  });

  it("opens the month calendar from the weekly strip", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-03T12:00:00Z"));
    state.releases = {
      data: [game(1, { firstReleaseDate: "2026-11-03T00:00:00.000Z" })],
    };

    render(<ConsoleReleaseStrip />, { wrapper });

    // seven days (today + 6) are the week timeline
    const week = document.querySelector('[aria-label="Upcoming"]');
    expect(week?.querySelectorAll("time")).toHaveLength(7);
    expect(screen.getByText("Today")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "View calendar" }));
    expect(screen.getByRole("button", { name: "Hide calendar" })).toBeTruthy();
    expect(
      await screen.findByRole("region", { name: "Release calendar" }),
    ).toBeTruthy();
  });
});

describe("console explore", () => {
  it("renders a trending row and up to three best-rated cards per category", () => {
    render(<ConsoleExplore />, { wrapper });

    expect(
      screen.getByRole("heading", { name: "Trending games" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Adventure" })).toBeTruthy();

    const cards = Array.from(
      document.querySelectorAll("[data-console-top-rated]"),
    );
    // two sections (overall + the one mocked genre) × up to three cards
    expect(cards).toHaveLength(6);

    const firstSectionCards = cards.slice(0, 3);
    expect(firstSectionCards.map((card) => card.textContent)).toEqual([
      expect.stringContaining("Game 1"),
      expect.stringContaining("Game 2"),
      expect.stringContaining("Game 3"),
    ]);
    expect(
      within(firstSectionCards[0] as HTMLElement).getByText("Top rated"),
    ).toBeTruthy();
  });

  it("keeps the platform filters above the console sections", () => {
    render(<ConsoleExplore filters={<span>filters-slot</span>} />, {
      wrapper,
    });
    expect(screen.getByText("filters-slot")).toBeTruthy();
  });

  it("uses the platform query (period and criteria) for every category", () => {
    render(
      <ConsoleExplore
        dto={{
          period: StatisticsRankingsRequestDto.period.WEEK,
          criteria: { platforms: [6] },
          limit: 20,
        }}
      />,
      { wrapper },
    );

    expect(state.trendingCalls).toHaveLength(2);
    expect(state.trendingCalls[0]).toMatchObject({
      period: StatisticsRankingsRequestDto.period.WEEK,
      criteria: { platforms: [6] },
      limit: 12,
    });
    expect(state.trendingCalls[1]).toMatchObject({
      period: StatisticsRankingsRequestDto.period.WEEK,
      criteria: { platforms: [6], genres: [31] },
      limit: 12,
    });
  });

  it("keeps filters and paginated platform results when filtered", () => {
    render(
      <ConsoleExplore
        filters={<span>filters-slot</span>}
        results={<span>results-slot</span>}
        filtered
      />,
      { wrapper },
    );

    expect(screen.getByText("filters-slot")).toBeTruthy();
    expect(screen.getByText("results-slot")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: "Trending games" }),
    ).toBeNull();
    expect(document.querySelector("[data-console-top-rated]")).toBeNull();
    expect(state.trendingCalls).toHaveLength(0);
  });
});

describe("console blog section", () => {
  it("renders up to four same-size tiles that link to their articles", () => {
    render(
      <ConsoleBlogSection
        posts={[post("a"), post("b"), post("c"), post("d"), post("e")]}
        isLoading={false}
        isError={false}
        onRetry={() => {}}
      />,
      { wrapper },
    );

    const links = within(
      document.querySelector("[data-console-blog-section]") as HTMLElement,
    ).getAllByRole("link");
    // the "See more" link plus four post tiles
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/blog",
      "/blog/post/a",
      "/blog/post/b",
      "/blog/post/c",
      "/blog/post/d",
    ]);
  });

  it("renders the compact item used by the Xbox feed side column", () => {
    render(<ConsoleBlogItem post={post("a")} />, { wrapper });
    expect(screen.getByRole("link").getAttribute("href")).toBe("/blog/post/a");
    expect(screen.getByText("Post a")).toBeTruthy();
  });
});
