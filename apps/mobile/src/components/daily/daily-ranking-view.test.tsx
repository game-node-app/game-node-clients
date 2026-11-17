// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  ApiError,
  DailyService,
  type DailyRankingResponseDto,
  type DailyRankingRowDto,
} from "@repo/wrapper/server";
import { DailyRankingView } from "../../../../../packages/ui/src/components/daily/ranking/DailyRankingView";
import { renderDaily, stubMatchMedia } from "./dailyTestUtils";

const mocks = vi.hoisted(() => ({ userId: "me" as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.userId }),
);

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${Object.values(options).join(",")}` : key,
    i18n: { language: "en" },
  }),
}));

stubMatchMedia();

const row = (
  position: number,
  overrides: Partial<DailyRankingRowDto> = {},
) => ({
  position,
  positionChange: null,
  avatar: null,
  userId: `user-${position}`,
  username: `player${position}`,
  supporterBadge: false,
  points: 1000 - position,
  winRate: 80,
  currentStreak: 2,
  modePoints: { cover: 1 },
  ...overrides,
});

const response = (
  overrides: Partial<DailyRankingResponseDto> = {},
  count = 10,
): DailyRankingResponseDto => ({
  pointsToTop100: 38,
  period: "week" as never,
  mode: null,
  scope: "all" as never,
  endsAt: "2026-11-23T03:00:00.000Z",
  totalPlayers: 3812,
  viewer: row(142, { userId: "me", username: "me" }),
  data: Array.from({ length: count }, (_, index) => row(index + 1)),
  pagination: {
    hasNextPage: true,
    totalItems: 3812,
    limit: 20,
    offset: 0,
  } as never,
  ...overrides,
});

const spy = () => vi.spyOn(DailyService, "dailyControllerFindRankingV1");

beforeEach(() => {
  mocks.userId = "me";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DailyRankingView", () => {
  it("switches columns and the request with the mode", async () => {
    const find = spy().mockImplementation((async (
      _period: string,
      mode?: string,
    ) => response({ mode: (mode ?? null) as never })) as never);
    renderDaily(<DailyRankingView />);

    await screen.findByText("player4");
    expect(find).toHaveBeenLastCalledWith("week", undefined, "all", 0, 20);
    expect(screen.getByText("daily.ranking.columns.byMode")).toBeTruthy();

    const [modes] = screen.getAllByRole("group", {
      name: "daily.ranking.filters.mode",
    });
    fireEvent.click(within(modes).getByRole("button", { name: /cover/ }));

    await waitFor(() =>
      expect(find).toHaveBeenLastCalledWith("week", "cover", "all", 0, 20),
    );
    await screen.findByText("daily.ranking.columns.wins");
    expect(screen.queryByText("daily.ranking.columns.byMode")).toBeNull();
  });

  it("pins the viewer below the loaded rows", async () => {
    spy().mockResolvedValue(response() as never);
    renderDaily(<DailyRankingView />);

    await screen.findByText("daily.ranking.yourPosition");
    // The pinned row and the summary tile.
    expect(screen.getAllByText("#142")).toHaveLength(2);
    expect(screen.getByText("daily.ranking.summary.gap:38")).toBeTruthy();
    expect(screen.getByText("daily.ranking.showing:4,10,3,812")).toBeTruthy();
  });

  it("highlights the viewer in the list instead of pinning", async () => {
    spy().mockResolvedValue(
      response({
        viewer: row(6, { userId: "user-6" }),
        pointsToTop100: null,
      }) as never,
    );
    const { container } = renderDaily(<DailyRankingView />);

    await screen.findByText("player6");
    expect(screen.queryByText("daily.ranking.yourPosition")).toBeNull();
    const highlighted = container.querySelectorAll("[data-viewer]");
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].textContent).toContain("player6");
  });

  it("shows the early banner on a quiet Today", async () => {
    spy().mockResolvedValue(
      response(
        {
          totalPlayers: 2,
          viewer: null,
          pagination: { hasNextPage: false } as never,
        },
        2,
      ) as never,
    );
    renderDaily(<DailyRankingView initialFilters={{ period: "today" }} />);

    await screen.findByText("daily.ranking.early.title:2");
    expect(screen.getByText("daily.ranking.emptyTable")).toBeTruthy();
    expect(screen.getByText("daily.ranking.openSpot")).toBeTruthy();
    expect(screen.queryByText("daily.ranking.loadMore")).toBeNull();
  });

  it("shows the sign-in card to guests and never asks for following", async () => {
    mocks.userId = undefined;
    const find = spy().mockResolvedValue(response({ viewer: null }) as never);
    renderDaily(<DailyRankingView initialFilters={{ scope: "following" }} />);

    await screen.findByText("daily.ranking.signIn.title");
    expect(find).toHaveBeenCalledWith("week", undefined, "all", 0, 20);
    expect(find).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "following",
      expect.anything(),
      expect.anything(),
    );
    expect(screen.queryByText("daily.ranking.summary.title.week")).toBeNull();
  });

  it("retries after an error", async () => {
    const find = spy()
      .mockRejectedValueOnce(
        new ApiError(
          { method: "GET", url: "" },
          { url: "", ok: false, status: 500, statusText: "", body: {} },
          "fail",
        ),
      )
      .mockResolvedValue(response() as never);
    renderDaily(<DailyRankingView />);

    fireEvent.click(await screen.findByText("actions.retry"));
    await screen.findByText("player4");
    expect(find).toHaveBeenCalledTimes(2);
  });
});
