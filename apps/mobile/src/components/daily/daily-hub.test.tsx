// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import {
  DailyService,
  type DailyRankingResponseDto,
} from "@repo/wrapper/server";
import { DailyRankingPanel } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingPanel";
import { DailyHomeView } from "../../../../../packages/ui/src/components/daily/view/DailyHomeView";
import { renderDaily, stubMatchMedia, todayResponse } from "./dailyTestUtils";

const mocks = vi.hoisted(() => ({ userId: "me" as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.userId }),
);
vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
}));
vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${Object.values(options).join(",")}` : key,
    i18n: { language: "en" },
  }),
}));

stubMatchMedia();

const row = (position: number, userId = `user-${position}`) => ({
  position,
  positionChange: null,
  avatar: null,
  userId,
  username: `player${position}`,
  supporterBadge: false,
  points: 2400 - position * 100,
  winRate: 80,
});

const ranking = (
  overrides: Partial<DailyRankingResponseDto> = {},
): DailyRankingResponseDto => ({
  pointsToTop100: null,
  period: "week" as never,
  mode: null,
  scope: "all" as never,
  endsAt: null,
  totalPlayers: 3,
  viewer: null,
  data: [row(1), row(2), row(3)],
  pagination: { hasNextPage: false } as never,
  ...overrides,
});

beforeEach(() => {
  mocks.userId = "me";
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("DailyRankingPanel", () => {
  it("shows the top three and the signed-in viewer's position and change", async () => {
    vi.spyOn(DailyService, "dailyControllerFindRankingV1").mockResolvedValue(
      ranking({ viewer: { ...row(142, "me"), positionChange: 12 } }) as never,
    );
    renderDaily(<DailyRankingPanel />);

    await screen.findByText("player1");
    expect(screen.getByText("player3")).toBeTruthy();
    expect(
      screen.getByText("daily.ranking.panel.youChange:142,+12"),
    ).toBeTruthy();
    expect(screen.queryByText("daily.ranking.panel.invite")).toBeNull();
    expect(
      screen
        .getByText("daily.ranking.panel.seeAll")
        .closest("a")
        ?.getAttribute("href"),
    ).toBe("/daily/ranking");
  });

  it("shows no position to guests", async () => {
    mocks.userId = undefined;
    vi.spyOn(DailyService, "dailyControllerFindRankingV1").mockResolvedValue(
      ranking() as never,
    );
    renderDaily(<DailyRankingPanel />);

    await screen.findByText("player1");
    expect(screen.queryByText(/daily\.ranking\.panel\.you/)).toBeNull();
  });

  it("invites to play when fewer than three played", async () => {
    vi.spyOn(DailyService, "dailyControllerFindRankingV1").mockResolvedValue(
      ranking({ data: [row(1, "me")], viewer: row(1, "me") }) as never,
    );
    const { container } = renderDaily(<DailyRankingPanel />);

    await screen.findByText("daily.ranking.panel.invite");
    expect(screen.getByText("daily.ranking.panel.you:1")).toBeTruthy();
    expect(container.querySelectorAll("[data-viewer]")).toHaveLength(1);
  });
});

describe("DailyHomeView", () => {
  beforeEach(() => {
    vi.spyOn(DailyService, "dailyControllerFindRankingV1").mockResolvedValue(
      ranking() as never,
    );
    vi.spyOn(DailyService, "dailyControllerFindResultsV1").mockResolvedValue({
      data: [],
    } as never);
  });

  it("leaves the weekly section out when there is no challenge", async () => {
    vi.spyOn(DailyService, "dailyControllerFindTodayV1").mockResolvedValue(
      todayResponse({ weekly: null }) as never,
    );
    renderDaily(<DailyHomeView />);

    await screen.findByText("daily.practice.section");
    expect(screen.getByText("daily.ranking.panel.title")).toBeTruthy();
    expect(screen.queryByText("daily.weekly.section")).toBeNull();
    expect(
      screen
        .getAllByRole("link")
        .some((link) => link.getAttribute("href") === "/daily/specs/practice"),
    ).toBe(true);
  });

  it("shows the weekly challenge with the player's status", async () => {
    vi.spyOn(DailyService, "dailyControllerFindTodayV1").mockResolvedValue(
      todayResponse({
        weekly: {
          id: 99,
          number: 7,
          mode: "specs" as never,
          maxAttempts: 10,
          endsAt: "2026-11-23T03:00:00.000Z",
          result: { status: "won", attempts: 4 } as never,
        },
      }) as never,
    );
    renderDaily(<DailyHomeView />);

    await screen.findByText("daily.weekly.section");
    expect(screen.getByText("daily.weekly.titleNumber:7")).toBeTruthy();
    expect(screen.getByText("daily.status.won:4")).toBeTruthy();
    expect(
      screen
        .getByText("daily.weekly.titleNumber:7")
        .closest("a")
        ?.getAttribute("href"),
    ).toBe("/daily/weekly");
  });
});
