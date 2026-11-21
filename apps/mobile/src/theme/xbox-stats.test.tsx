// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import { XboxProfileStatsView } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxProfileStatsView";
import { XboxStatsRanking } from "../../../../packages/ui/src/theme/themes/xbox/screens/XboxStatsRanking";
import { setupDom } from "../components/mcp/testUtils";

interface DistributionItem {
  criteriaId: number;
  criteriaName: string;
  count: number;
  finishedCount: number;
}

const state = vi.hoisted(() => ({
  profile: undefined as Record<string, unknown> | undefined,
  overview: undefined as Record<string, number> | undefined,
  viewerId: "u1" as string | undefined,
  distributions: {} as Record<string, DistributionItem[]>,
}));

vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({
      data: state.profile,
      isLoading: false,
      queryKey: ["userProfile", "u1"],
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useProfileMetricsOverview",
  () => ({
    useProfileMetricsOverview: () => ({
      data: state.overview,
      isLoading: false,
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useProfileMetricsDistributionByType",
  () => ({
    useProfileMetricsDistributionByType: (_userId: string, by: string) => ({
      data: { distribution: state.distributions[by] ?? [] },
      isLoading: false,
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/profile/hooks/useProfileMetricsDistributionByYear",
  () => ({
    useProfileMetricsDistributionByYear: (_userId: string, by: string) => ({
      data: {
        distribution:
          by === "playtime"
            ? [{ year: 2025, count: 7200 }]
            : [{ year: 2025, count: 4, reviewedCount: 2 }],
      },
      isLoading: false,
    }),
  }),
);
vi.mock(
  "../../../../packages/ui/src/components/user-level/hooks/useUserLevel",
  () => ({
    useUserLevel: () => ({
      data: { currentLevel: 3, currentLevelExp: 50, levelUpExpCost: 100 },
    }),
  }),
);
vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => state.viewerId,
}));
vi.mock(
  "../../../../packages/ui/src/components/library/view/LibraryHiddenState",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../packages/ui/src/components/library/view/LibraryHiddenState")
      >();
    const React = await import("react");
    return {
      ...actual,
      LibraryHiddenState: () =>
        React.createElement(
          "div",
          { "data-testid": "library-hidden-state" },
          "Library hidden",
        ),
    };
  },
);
vi.mock("@mantine/charts", () => ({
  LineChart: ({
    data,
    series,
  }: {
    data: Array<Record<string, number>>;
    series: Array<{ name: string }>;
  }) => (
    <div
      data-testid={"line-chart"}
      data-series={series.map((item) => item.name).join(",")}
      data-counts={data.map((item) => item.count).join(",")}
    />
  ),
}));

const baseProfile = {
  userId: "u1",
  username: "alice",
  canViewLibrary: true,
  libraryVisibility: "public",
  feed: [],
  isSupporter: false,
  supporterPreferences: null,
  banner: null,
  bannerVideo: null,
  avatar: null,
  createdAt: "2024-03-04T00:00:00.000Z",
};

const overview = {
  totalGames: 20,
  totalCollections: 3,
  totalFinishedGames: 10,
  totalFinishedGamesInYear: 4,
  totalPlayedGames: 12,
  totalPlayedGamesInYear: 4,
  totalEstimatedPlaytime: 7200,
};

const hooks = {
  useRouter: () => ({
    pathname: "/profile/u1/stats",
    back: vi.fn(),
    push: async () => {},
    query: new URLSearchParams(),
  }),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <I18nProvider language="en">
    <MantineProvider>
      <UIProvider hooks={hooks}>{children}</UIProvider>
    </MantineProvider>
  </I18nProvider>
);

const renderRanking = () =>
  render(<XboxStatsRanking userId={"u1"} by={"genre"} title={"Genres"} />, {
    wrapper,
  });

beforeEach(() => {
  setupDom();
  state.profile = { ...baseProfile };
  state.overview = { ...overview };
  state.viewerId = "u1";
  state.distributions = {
    genre: [
      { criteriaId: 1, criteriaName: "Adventure", count: 5, finishedCount: 2 },
      { criteriaId: 2, criteriaName: "RPG", count: 10, finishedCount: 5 },
      { criteriaId: 3, criteriaName: "Puzzle", count: 2, finishedCount: 0 },
      { criteriaId: 4, criteriaName: "Unplayed", count: 0, finishedCount: 0 },
    ],
    platform: [
      { criteriaId: 1, criteriaName: "PC", count: 8, finishedCount: 4 },
    ],
    status: [
      { criteriaId: 1, criteriaName: "Playing", count: 3, finishedCount: 0 },
    ],
    theme: [],
    mode: [],
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Xbox ranked distributions", () => {
  it("sorts bars by count and sizes them against the largest entry", () => {
    renderRanking();

    const ranks = screen.getAllByTestId("xbox-stats-rank");

    expect(ranks.map((rank) => rank.getAttribute("data-criteria"))).toEqual([
      "RPG",
      "Adventure",
      "Puzzle",
    ]);

    const widths = ranks.map(
      (rank) => within(rank).getByTestId("xbox-stats-rank-total").style.width,
    );
    expect(widths).toEqual(["100%", "50%", "20%"]);

    const finishedWidths = ranks.map(
      (rank) =>
        within(rank).getByTestId("xbox-stats-rank-finished").style.width,
    );
    expect(finishedWidths).toEqual(["50%", "40%", "0%"]);
  });

  it("omits the finished share for the status distribution", () => {
    render(<XboxStatsRanking userId={"u1"} by={"status"} title={"Status"} />, {
      wrapper,
    });

    expect(screen.queryByTestId("xbox-stats-rank-finished")).toBeNull();
    expect(screen.queryByText("Finished games")).toBeNull();
    const rank = screen.getAllByTestId("xbox-stats-rank")[0];
    expect(within(rank).getByText("3")).toBeTruthy();
  });

  it("collapses long distributions behind the show-more control", () => {
    state.distributions.genre = Array.from({ length: 8 }, (_, index) => ({
      criteriaId: index,
      criteriaName: `Genre ${index}`,
      count: 20 - index,
      finishedCount: 0,
    }));

    renderRanking();

    expect(screen.getAllByTestId("xbox-stats-rank")).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: /Show more/ }));
    expect(screen.getAllByTestId("xbox-stats-rank")).toHaveLength(8);
  });
});

describe("Xbox stats page", () => {
  it("renders the headline strip, five ranked breakdowns and the year chart", () => {
    render(<XboxProfileStatsView userId={"u1"} />, { wrapper });

    const strip = screen.getByTestId("xbox-stats-overview");
    expect(within(strip).getByText("20")).toBeTruthy();
    expect(within(strip).getByText("3")).toBeTruthy();
    expect(within(strip).getByText("50%")).toBeTruthy();

    for (const by of ["platform", "status", "genre", "theme", "mode"]) {
      expect(screen.getByTestId(`xbox-stats-ranking-${by}`)).toBeTruthy();
    }

    expect(screen.getByTestId("line-chart").getAttribute("data-series")).toBe(
      "count,reviewedCount",
    );
    expect(screen.getByRole("tab", { name: "Finish year" })).toBeTruthy();
  });

  it("switches the year chart to playtime hours from the pill tabs", () => {
    render(<XboxProfileStatsView userId={"u1"} />, { wrapper });

    fireEvent.click(screen.getByRole("tab", { name: "Playtime" }));

    const chart = screen.getByTestId("line-chart");
    expect(chart.getAttribute("data-series")).toBe("count");
    expect(chart.getAttribute("data-counts")).toBe("2");
  });

  it("renders the shared hidden state and no numbers for a private library", () => {
    state.viewerId = "u2";
    state.profile = {
      ...baseProfile,
      canViewLibrary: false,
      libraryVisibility: "private",
    };

    render(<XboxProfileStatsView userId={"u1"} />, { wrapper });

    expect(screen.getByTestId("library-hidden-state")).toBeTruthy();
    expect(screen.queryByTestId("xbox-stats-overview")).toBeNull();
    expect(screen.queryByTestId("line-chart")).toBeNull();
    expect(screen.queryByTestId("xbox-stats-ranking-genre")).toBeNull();
  });

  it("keeps cached statistics hidden when the profile is unavailable", () => {
    state.profile = undefined;
    render(<XboxProfileStatsView userId={"u1"} />, { wrapper });

    expect(screen.queryByTestId("xbox-stats-overview")).toBeNull();
    expect(screen.queryByTestId("line-chart")).toBeNull();
  });
});
