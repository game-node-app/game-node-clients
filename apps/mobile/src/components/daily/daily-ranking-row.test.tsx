// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import type { DailyRankingRowDto } from "@repo/wrapper/server";
import { DailyRankingRow } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingRow";
import { DailyRankingPodium } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingPodium";
import { renderDaily, stubMatchMedia } from "./dailyTestUtils";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && "points" in options ? `${key}:${options.points}` : key,
    i18n: { language: "en" },
  }),
}));

stubMatchMedia();
afterEach(cleanup);

const row = (
  overrides: Partial<DailyRankingRowDto> = {},
): DailyRankingRowDto => ({
  position: 4,
  positionChange: 3,
  avatar: null,
  userId: "user-4",
  username: "luiz8bit",
  supporterBadge: true,
  points: 1899,
  winRate: 85,
  modePoints: { cover: 96, artwork: 88, keywords: 72, specs: 120.4 },
  currentStreak: 30,
  ...overrides,
});

describe("DailyRankingRow", () => {
  it("shows the per-mode points and streak in the overall ranking", () => {
    renderDaily(<DailyRankingRow row={row()} mode={null} />);
    expect(screen.getByText("#4")).toBeTruthy();
    expect(screen.getByText("1,899")).toBeTruthy();
    const byMode = screen.getByLabelText("daily.ranking.columns.byMode");
    expect(within(byMode).getByText("120.4")).toBeTruthy();
    expect(within(byMode).getByText("96")).toBeTruthy();
    expect(screen.getByText("30")).toBeTruthy();
    expect(screen.getByText("85%")).toBeTruthy();
    expect(screen.getByLabelText("daily.ranking.change.up")).toBeTruthy();
    expect(screen.getByTestId("supporter-badge")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/profile/user-4",
    );
  });

  it("shows wins, average attempts and best streak in a mode ranking", () => {
    renderDaily(
      <DailyRankingRow
        row={row({
          modePoints: undefined,
          currentStreak: undefined,
          points: 50,
          wins: 7,
          averageAttempts: 2.6,
          bestStreak: 12,
        })}
        mode={"cover"}
      />,
    );
    expect(screen.queryByLabelText("daily.ranking.columns.byMode")).toBeNull();
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("2.6")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("uses dashes for missing values and hides the badge when off", () => {
    renderDaily(
      <DailyRankingRow
        row={row({
          supporterBadge: false,
          positionChange: 0,
          modePoints: { cover: 10 },
        })}
        mode={null}
      />,
    );
    const byMode = screen.getByLabelText("daily.ranking.columns.byMode");
    expect(within(byMode).getAllByText("–")).toHaveLength(3);
    expect(screen.queryByTestId("supporter-badge")).toBeNull();
    expect(screen.getByLabelText("daily.ranking.change.same")).toBeTruthy();
  });

  it("dashes a missing average and marks new players and the viewer", () => {
    renderDaily(
      <DailyRankingRow
        row={row({
          averageAttempts: null,
          wins: 0,
          bestStreak: 0,
          positionChange: "new",
        })}
        mode={"specs"}
        isViewer
      />,
    );
    expect(screen.getByText("daily.ranking.change.new")).toBeTruthy();
    expect(screen.getByText("daily.ranking.you")).toBeTruthy();
    // The viewer pill replaces the supporter badge.
    expect(screen.queryByTestId("supporter-badge")).toBeNull();
    expect(screen.getAllByText("–").length).toBeGreaterThan(0);
  });
});

describe("DailyRankingPodium", () => {
  const places = (container: HTMLElement) =>
    [...container.querySelectorAll("[data-place]")].map((element) => ({
      place: element.getAttribute("data-place"),
      open: element.textContent?.includes("daily.ranking.openSpot"),
    }));

  it("orders three players 2-1-3", () => {
    const { container } = renderDaily(
      <DailyRankingPodium
        rows={[1, 2, 3].map((position) =>
          row({ position, userId: `u${position}`, username: `p${position}` }),
        )}
        isOverall
      />,
    );
    expect(places(container)).toEqual([
      { place: "2", open: false },
      { place: "1", open: false },
      { place: "3", open: false },
    ]);
    expect(screen.getAllByText("daily.ranking.points:1,899").length).toBe(3);
  });

  it("fills missing places with open spots", () => {
    const one = renderDaily(
      <DailyRankingPodium rows={[row({ position: 1 })]} isOverall />,
    );
    expect(places(one.container)).toEqual([
      { place: "2", open: true },
      { place: "1", open: false },
      { place: "3", open: true },
    ]);
    one.unmount();

    const two = renderDaily(
      <DailyRankingPodium
        rows={[row({ position: 1 }), row({ position: 2, userId: "u2" })]}
        isOverall
      />,
    );
    expect(places(two.container).map(({ open }) => open)).toEqual([
      false,
      false,
      true,
    ]);
    two.unmount();

    const none = renderDaily(<DailyRankingPodium rows={[]} isOverall />);
    expect(screen.getAllByText("daily.ranking.openSpot")).toHaveLength(3);
    none.unmount();
  });
});
