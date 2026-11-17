// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import type { DailyRankingRowDto } from "@repo/wrapper/server";
import { DailyRankingViewerSummary } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingViewerSummary";
import { DailyRankingSignInCard } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingSignInCard";
import { DailyRankingFilters } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingFilters";
import { DailyRankingEarlyBanner } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingEarlyBanner";
import { DailyRankingScoring } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingScoring";
import { renderDaily, stubMatchMedia } from "./dailyTestUtils";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${Object.values(options).join(",")}` : key,
    i18n: { language: "en" },
  }),
}));

stubMatchMedia();
afterEach(cleanup);

const viewer: DailyRankingRowDto = {
  position: 142,
  positionChange: 12,
  avatar: null,
  userId: "me",
  username: "me",
  supporterBadge: false,
  points: 1084,
  winRate: 84,
  currentStreak: 5,
};

describe("DailyRankingViewerSummary", () => {
  it("shows position, points, streak and the gap to the top 100", () => {
    renderDaily(
      <DailyRankingViewerSummary
        viewer={viewer}
        pointsToTop100={38}
        period={"week"}
        isOverall
      />,
    );
    expect(screen.getByText("daily.ranking.summary.title.week")).toBeTruthy();
    expect(screen.getByText("#142")).toBeTruthy();
    expect(screen.getByText("1,084")).toBeTruthy();
    expect(
      screen.getByText("daily.ranking.summary.streakValue:5"),
    ).toBeTruthy();
    expect(screen.getByText("daily.ranking.summary.gap:38")).toBeTruthy();
  });

  it("hides the gap inside the top 100", () => {
    renderDaily(
      <DailyRankingViewerSummary
        viewer={{ ...viewer, position: 12 }}
        pointsToTop100={null}
        period={"month"}
        isOverall
      />,
    );
    expect(screen.queryByText(/daily\.ranking\.summary\.gap/)).toBeNull();
  });

  it("invites a signed-in player without a row to play", () => {
    renderDaily(
      <DailyRankingViewerSummary
        viewer={null}
        pointsToTop100={null}
        period={"today"}
        isOverall
      />,
    );
    expect(screen.getByText("daily.ranking.summary.empty")).toBeTruthy();
    expect(screen.queryByText("daily.ranking.summary.position")).toBeNull();
  });
});

describe("DailyRankingSignInCard", () => {
  it("links both actions to the auth page and back", () => {
    renderDaily(<DailyRankingSignInCard redirectTo={"/daily/ranking"} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/auth?redirectTo=%2Fdaily%2Franking",
      "/auth?redirectTo=%2Fdaily%2Franking",
    ]);
    expect(screen.getByText("daily.ranking.signIn.create")).toBeTruthy();
    expect(screen.getByText("daily.ranking.signIn.signIn")).toBeTruthy();
  });
});

describe("DailyRankingFilters", () => {
  const filters = { period: "week", mode: null, scope: "all" } as const;

  it("disables people I follow while signed out", () => {
    renderDaily(
      <DailyRankingFilters
        filters={filters}
        onChange={() => {}}
        signedIn={false}
      />,
    );
    for (const button of screen.getAllByRole("button", {
      name: /daily\.ranking\.scopes\.following/,
    })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it("changes mode and period", () => {
    const onChange = vi.fn();
    renderDaily(
      <DailyRankingFilters filters={filters} onChange={onChange} signedIn />,
    );
    const [modes] = screen.getAllByRole("group", {
      name: "daily.ranking.filters.mode",
    });
    fireEvent.click(within(modes).getByRole("button", { name: /cover/ }));
    expect(onChange).toHaveBeenLastCalledWith({ ...filters, mode: "cover" });

    const [periods] = screen.getAllByRole("group", {
      name: "daily.ranking.filters.period",
    });
    fireEvent.click(
      within(periods).getByRole("button", {
        name: "daily.ranking.periods.today",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith({ ...filters, period: "today" });

    const [scopes] = screen.getAllByRole("group", {
      name: "daily.ranking.filters.scope",
    });
    fireEvent.click(
      within(scopes).getByRole("button", {
        name: "daily.ranking.scopes.following",
      }),
    );
    expect(onChange).toHaveBeenLastCalledWith({
      ...filters,
      scope: "following",
    });
  });
});

describe("DailyRankingEarlyBanner and scoring", () => {
  it("counts today's players and links to the Daily", () => {
    renderDaily(<DailyRankingEarlyBanner totalPlayers={2} />);
    expect(screen.getByText("daily.ranking.early.title:2")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/daily");
  });

  it("toggles the scoring rules", () => {
    renderDaily(<DailyRankingScoring defaultOpened={false} />);
    const toggle = screen.getByRole("button", {
      name: /daily\.ranking\.scoring\.title/,
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("daily.ranking.points:6")).toBeTruthy();
  });
});
