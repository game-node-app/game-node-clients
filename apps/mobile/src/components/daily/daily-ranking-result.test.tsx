// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  DailyService,
  type DailyRankingSummaryDto,
} from "@repo/wrapper/server";
import { DailyRankingResultCard } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingResultCard";
import { useDailyPlay } from "../../../../../packages/ui/src/components/daily/hooks/useDailyPlay";
import {
  createTestQueryClient,
  playResponse,
  renderDaily,
  stubMatchMedia,
} from "./dailyTestUtils";

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "me" } }, isPending: false }),
  },
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${Object.values(options).join(",")}` : key,
    i18n: { language: "en" },
  }),
}));

stubMatchMedia();
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const summary = (
  overrides: Partial<DailyRankingSummaryDto> = {},
): DailyRankingSummaryDto => ({
  counted: true,
  pointsEarned: 4,
  bonusEarned: 0,
  weekPoints: 1084,
  weekPosition: 142,
  previousWeekPosition: 154,
  pointsToTop100: 38,
  ...overrides,
});

describe("DailyRankingResultCard", () => {
  it("shows a move up with the week and the gap", () => {
    renderDaily(<DailyRankingResultCard ranking={summary()} />);
    expect(
      screen.getByText(
        "daily.ranking.result.points:4 · daily.ranking.result.rose:142",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "daily.ranking.result.week:1,084 daily.ranking.summary.gap:38",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/daily/ranking",
    );
  });

  it("says entered without a previous position", () => {
    renderDaily(
      <DailyRankingResultCard
        ranking={summary({ previousWeekPosition: null, pointsToTop100: null })}
      />,
    );
    expect(
      screen.getByText(
        "daily.ranking.result.points:4 · daily.ranking.result.entered:142",
      ),
    ).toBeTruthy();
    expect(screen.getByText("daily.ranking.result.week:1,084")).toBeTruthy();
  });

  it("says unchanged when the position stayed", () => {
    renderDaily(
      <DailyRankingResultCard
        ranking={summary({ previousWeekPosition: 142 })}
      />,
    );
    expect(
      screen.getByText(
        "daily.ranking.result.points:4 · daily.ranking.result.same:142",
      ),
    ).toBeTruthy();
  });

  it("adds the bonus to the points and names it", () => {
    renderDaily(
      <DailyRankingResultCard
        ranking={summary({ bonusEarned: 2, pointsToTop100: null })}
      />,
    );
    expect(
      screen.getByText(/^daily\.ranking\.result\.points:6 · /),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "daily.ranking.result.week:1,084 daily.ranking.result.bonus:2",
      ),
    ).toBeTruthy();
  });

  it("explains an archive play does not score", () => {
    const { container } = renderDaily(
      <DailyRankingResultCard
        ranking={summary({ counted: false, pointsEarned: 0 })}
      />,
    );
    expect(screen.getByText("daily.ranking.result.notCounted")).toBeTruthy();
    expect(container.querySelector("[data-counted=false]")).toBeTruthy();
  });

  it("renders nothing without a ranking block", () => {
    const { container } = renderDaily(
      <DailyRankingResultCard ranking={undefined} />,
    );
    expect(container.querySelector("[data-counted]")).toBeNull();
    expect(screen.queryByText("daily.ranking.result.see")).toBeNull();
  });
});

describe("ranking refresh after a daily play", () => {
  it("invalidates ranking queries but not practice rounds", async () => {
    const client = createTestQueryClient();
    const rankingKey = ["daily", "ranking", "list", { period: "week" }, "me"];
    const panelKey = ["daily", "ranking", "panel", "me", "week", 3];
    const practiceKey = ["daily", "practice", "cover", "me"];
    client.setQueryData(rankingKey, { pages: [] });
    client.setQueryData(panelKey, { data: [] });
    client.setQueryData(practiceKey, { roundId: "r1" });
    vi.spyOn(DailyService, "dailyControllerPlayV1").mockResolvedValue(
      playResponse() as never,
    );

    const { result } = renderHook(() => useDailyPlay(1), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    act(() => result.current.guess(42));
    await waitFor(() =>
      expect(client.getQueryState(rankingKey)?.isInvalidated).toBe(true),
    );
    expect(client.getQueryState(panelKey)?.isInvalidated).toBe(true);
    expect(client.getQueryState(practiceKey)?.isInvalidated).toBe(false);
  });
});
