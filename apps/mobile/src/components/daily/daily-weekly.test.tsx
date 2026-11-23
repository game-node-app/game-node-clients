// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import {
  DailyPlayResponseDto,
  DailyPuzzleResultSummaryDto,
  DailyService,
  DailyWeeklyDto,
  DailyWeeklyRankingRowDto,
} from "@repo/wrapper/server";
import { DailyWeeklyCard } from "../../../../../packages/ui/src/components/daily/weekly/DailyWeeklyCard";
import { DailyWeeklyFriendsRanking } from "../../../../../packages/ui/src/components/daily/weekly/DailyWeeklyFriendsRanking";
import { DailyWeeklyView } from "../../../../../packages/ui/src/components/daily/weekly/DailyWeeklyView";
import {
  playResponse,
  renderDaily,
  stubMatchMedia,
  todayResponse,
} from "./dailyTestUtils";

/**
 * Always ahead of the clock: a fixed date turns into a past one, the countdown
 * then reads as expired and invalidates the Daily queries mid-test.
 */
const FAR_FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const mocks = vi.hoisted(() => ({ userId: "me" as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.userId }),
);
vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({
      data: mocks.userId ? { user: { id: mocks.userId } } : null,
      isPending: false,
    }),
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

const weekly = (overrides: Partial<DailyWeeklyDto> = {}): DailyWeeklyDto => ({
  id: 90,
  number: 3,
  mode: DailyWeeklyDto.mode.COVER,
  maxAttempts: 6,
  endsAt: FAR_FUTURE,
  ...overrides,
});

const friend = (
  userId: string,
  status: DailyWeeklyRankingRowDto.status,
  attempts: number,
): DailyWeeklyRankingRowDto => ({
  avatar: null,
  userId,
  username: `name-${userId}`,
  supporterBadge: false,
  status,
  attempts,
  finishedAt: null,
});

const { WON, LOST, IN_PROGRESS } = DailyWeeklyRankingRowDto.status;

beforeEach(() => {
  mocks.userId = "me";
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("DailyWeeklyFriendsRanking", () => {
  it("lists friends in the server's order with attempts or not guessed", async () => {
    vi.spyOn(
      DailyService,
      "dailyControllerFindWeeklyRankingV1",
    ).mockResolvedValue({
      weekly: weekly(),
      data: [
        friend("ana", WON, 1),
        friend("me", WON, 3),
        friend("bia", LOST, 6),
        friend("caio", IN_PROGRESS, 2),
      ],
    });
    const { container } = renderDaily(<DailyWeeklyFriendsRanking />);

    await screen.findByText("name-ana");
    const names = [...container.querySelectorAll("a[href^='/profile/']")]
      .map((link) => link.textContent)
      .join("|");
    expect(names.indexOf("name-ana")).toBeLessThan(names.indexOf("name-me"));
    expect(names.indexOf("name-me")).toBeLessThan(names.indexOf("name-bia"));
    expect(names.indexOf("name-bia")).toBeLessThan(names.indexOf("name-caio"));

    expect(screen.getByText("daily.weekly.friends.attemptsOne:1")).toBeTruthy();
    expect(screen.getByText("daily.weekly.friends.attempts:3")).toBeTruthy();
    expect(screen.getByText("daily.weekly.friends.notGuessed")).toBeTruthy();
    expect(screen.getByText("daily.status.inProgress")).toBeTruthy();
    expect(container.querySelector("[data-viewer]")?.textContent).toContain(
      "#2",
    );
    expect(screen.queryByText("daily.weekly.friends.invite")).toBeNull();
  });

  it("invites to follow people when only the viewer is listed", async () => {
    vi.spyOn(
      DailyService,
      "dailyControllerFindWeeklyRankingV1",
    ).mockResolvedValue({ weekly: weekly(), data: [friend("me", WON, 2)] });
    renderDaily(<DailyWeeklyFriendsRanking />);

    expect(await screen.findByText("daily.weekly.friends.invite")).toBeTruthy();
  });

  it("does not request the friends ranking for guests", async () => {
    mocks.userId = undefined;
    const spy = vi.spyOn(DailyService, "dailyControllerFindWeeklyRankingV1");
    renderDaily(<DailyWeeklyFriendsRanking />);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("DailyWeeklyCard", () => {
  const summary = (
    status: DailyPuzzleResultSummaryDto.status,
    attempts: number,
  ) => ({ status, attempts });

  it.each([
    ["not started", undefined, null],
    [
      "in progress",
      summary(DailyPuzzleResultSummaryDto.status.IN_PROGRESS, 2),
      "daily.status.inProgress",
    ],
    [
      "won",
      summary(DailyPuzzleResultSummaryDto.status.WON, 4),
      "daily.status.won:4",
    ],
    [
      "lost",
      summary(DailyPuzzleResultSummaryDto.status.LOST, 6),
      "daily.status.lost",
    ],
  ])("shows the account's %s status", (_, result, label) => {
    const { container } = renderDaily(
      <DailyWeeklyCard weekly={weekly({ result })} />,
    );

    expect(screen.getByText("daily.weekly.titleNumber:3")).toBeTruthy();
    expect(container.querySelector("a[href='/daily/weekly']")).not.toBeNull();
    if (label) expect(screen.getByText(label)).toBeTruthy();
    else expect(container.querySelector(".mantine-Badge-root")).toBeNull();
  });

  it("uses the device's play for guests", () => {
    mocks.userId = undefined;
    localStorage.setItem(
      "gamenode-daily-results",
      JSON.stringify({
        90: {
          puzzleId: 90,
          mode: "cover",
          number: 3,
          date: "2026-11-17",
          guesses: [1, 2],
          hintAt: null,
          status: "won",
          attempts: 2,
          finishedAt: "2026-11-17T10:00:00.000Z",
          results: ["wrong", "correct"],
          kind: "weekly",
        },
      }),
    );
    renderDaily(<DailyWeeklyCard weekly={weekly()} />);

    expect(screen.getByText("daily.status.won:2")).toBeTruthy();
  });
});

describe("DailyWeeklyView", () => {
  it("shows the no-challenge state when there is no weekly", async () => {
    vi.spyOn(DailyService, "dailyControllerFindTodayV1").mockResolvedValue(
      todayResponse({ weekly: null }),
    );
    const play = vi.spyOn(DailyService, "dailyControllerPlayV1");
    renderDaily(<DailyWeeklyView />);

    expect(await screen.findByText("daily.weekly.none")).toBeTruthy();
    expect(play).not.toHaveBeenCalled();
  });

  it("stores a guest's finished weekly as kind weekly, without a ranking card", async () => {
    mocks.userId = undefined;
    vi.spyOn(DailyService, "dailyControllerFindTodayV1").mockResolvedValue(
      todayResponse({ weekly: weekly() }),
    );
    vi.spyOn(DailyService, "dailyControllerPlayV1").mockResolvedValue(
      playResponse({
        puzzleId: 90,
        number: 3,
        attempts: 1,
        status: DailyPlayResponseDto.status.WON,
        feedback: [
          {
            gameId: 7,
            name: "Right game",
            result: "correct" as never,
            commonGenres: [],
            commonPlatforms: [],
          } as never,
        ],
      }),
    );
    const ranking = vi.spyOn(
      DailyService,
      "dailyControllerFindWeeklyRankingV1",
    );
    const { container } = renderDaily(<DailyWeeklyView />);

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem("gamenode-daily-results") ?? "{}",
      );
      expect(stored[90]?.kind).toBe("weekly");
      expect(stored[90]?.status).toBe("won");
    });
    expect(screen.getByText("daily.weekly.titleNumber:3")).toBeTruthy();
    expect(
      await screen.findByText("daily.weekly.friends.signInTitle"),
    ).toBeTruthy();
    expect(container.querySelector("[data-counted]")).toBeNull();
    expect(ranking).not.toHaveBeenCalled();
  });
});
