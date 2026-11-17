// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameRepositoryService } from "@repo/wrapper/server";
import { RecapCalendarSection } from "../../../../../packages/ui/src/components/recap/year/RecapCalendarSection";
import { RecapCommunitySection } from "../../../../../packages/ui/src/components/recap/year/RecapCommunitySection";
import { RecapTopGamesSection } from "../../../../../packages/ui/src/components/recap/year/RecapTopGamesSection";
import { UIProvider } from "../../../../../packages/ui/src/context/UIProvider";
import {
  buildDailyPlaytime,
  buildGame,
  buildPlatform,
  buildPlayedGame,
  buildTopGame,
  buildYearRecap,
  RECAP_YEAR,
} from "./year-recap-fixture";

vi.mock("../../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: { useSession: () => ({ data: null, isPending: false }) },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));

function renderWithProviders(node: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(node, {
    wrapper: ({ children }) => (
      <MantineProvider>
        <QueryClientProvider client={client}>
          <UIProvider
            hooks={{
              useRouter: () => ({
                pathname: `/recap/${RECAP_YEAR}/user-1`,
                back: () => {},
                push: async () => {},
                query: new URLSearchParams(),
              }),
            }}
          >
            {children}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    ),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindAllByIdsV1",
  ).mockResolvedValue([buildGame(1, "Nioh 3"), buildGame(2, "Marathon")]);
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("RecapTopGamesSection", () => {
  it("omits the finish date and the rating when they are null", async () => {
    const platform = buildPlatform(167, "PlayStation 5", "PS5");
    const recap = buildYearRecap({
      topGames: [
        buildTopGame({
          gameId: 1,
          share: 0.21,
          finishedAt: null,
          rating: null,
        }),
        buildTopGame({
          gameId: 2,
          platformIds: [167],
          share: 0.1,
          totalPlaytimeSeconds: 40 * 3_600,
        }),
      ],
      playedGames: [buildPlayedGame({ gameId: 1, platformId: 167, platform })],
    });

    renderWithProviders(
      <RecapTopGamesSection year={RECAP_YEAR} recap={recap} />,
    );

    await waitFor(() => expect(screen.getAllByText("Nioh 3").length).toBe(1));

    expect(
      screen.getByText(
        `recap.page.topGames.share:${JSON.stringify({
          game: "Nioh 3",
          percent: "21%",
        })}`,
      ),
    ).toBeTruthy();
    // The hours show in the stats row and in the top-5 row of the same game.
    expect(
      screen.getAllByText(
        `events.card.recap.hours:${JSON.stringify({ hours: "86" })}`,
      ),
    ).toHaveLength(2);
    expect(screen.getByText("recap.page.topGames.hoursLabel")).toBeTruthy();
    expect(screen.queryByText("recap.page.topGames.finishedLabel")).toBeNull();
    expect(screen.queryByText("recap.page.topGames.ratingLabel")).toBeNull();
    expect(screen.getByText("PS5")).toBeTruthy();
    expect(screen.getAllByTestId("recap-top-game-row")).toHaveLength(2);
  });

  it("is omitted when the Recap has no top games", () => {
    renderWithProviders(
      <RecapTopGamesSection year={RECAP_YEAR} recap={buildYearRecap()} />,
    );

    expect(screen.queryByTestId("recap-top-games")).toBeNull();
  });
});

describe("RecapCalendarSection", () => {
  it("is omitted when an old Recap has calendar: null", () => {
    renderWithProviders(
      <RecapCalendarSection year={RECAP_YEAR} recap={buildYearRecap()} />,
    );

    expect(screen.queryByTestId("recap-calendar")).toBeNull();
  });

  it("maps each square to its UTC day and shows the month, streak and weekday cards", () => {
    const recap = buildYearRecap({
      calendar: {
        monthlyPlaytimeSeconds: Array.from({ length: 12 }, (_, index) =>
          index === 2 ? 71 * 3_600 : 0,
        ),
        topMonth: { month: 3, playtimeSeconds: 71 * 3_600 },
        longestStreak: {
          start: "2026-03-01",
          end: "2026-03-23",
          days: 23,
        },
        topWeekday: { weekday: 6, share: 0.18 },
        weekendShare: 0.31,
      },
      dailyPlaytimeSeconds: buildDailyPlaytime(RECAP_YEAR, {
        0: 7_200,
        40: 3_600,
      }),
    });

    renderWithProviders(
      <RecapCalendarSection year={RECAP_YEAR} recap={recap} />,
    );

    const grid = screen.getByTestId("recap-calendar-grid");
    const firstDay = grid.querySelector('[data-recap-day="0"]');
    const lastDay = grid.querySelector('[data-recap-day="364"]');

    // 2026-01-01 is UTC Thursday, regardless of the runner's time zone.
    expect(firstDay?.getAttribute("data-utc-date")).toBe("2026-01-01");
    expect(firstDay?.getAttribute("data-weekday")).toBe("4");
    expect(lastDay?.getAttribute("data-utc-date")).toBe("2026-12-31");
    expect(grid.querySelectorAll("[data-recap-day]")).toHaveLength(365);

    expect(
      screen.getByText(
        `recap.page.calendar.topMonth:${JSON.stringify({
          month: "March",
          hours: "71",
        })}`,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        `recap.page.calendar.streakValue:${JSON.stringify({ days: 23 })}`,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        `recap.page.calendar.weekdayFact:${JSON.stringify({
          percent: "31%",
        })}`,
      ),
    ).toBeTruthy();
    expect(screen.getByText("Saturday")).toBeTruthy();
  });
});

describe("RecapCommunitySection", () => {
  it("is omitted when communityHighlights is null", () => {
    renderWithProviders(<RecapCommunitySection recap={buildYearRecap()} />);

    expect(screen.queryByTestId("recap-community")).toBeNull();
  });

  it("shows the minority and in-tune cards with 0–10 ratings", async () => {
    const recap = buildYearRecap({
      communityHighlights: {
        minority: {
          gameId: 1,
          userRating: 4.5,
          communityAverage: 3.2,
          reviewCount: 100,
          beyondShare: 0.12,
          sameRangeCount: 500,
        },
        inTune: {
          gameId: 2,
          userRating: 4.75,
          communityAverage: 4.65,
          reviewCount: 200,
          beyondShare: 0.4,
          sameRangeCount: 2_140,
        },
      },
    });

    renderWithProviders(<RecapCommunitySection recap={recap} />);

    await waitFor(() => expect(screen.getByText("Nioh 3")).toBeTruthy());

    expect(
      screen.getByText(
        `recap.page.community.beyond:${JSON.stringify({
          percent: "12%",
          rating: "9",
        })}`,
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        `recap.page.community.sameTone:${JSON.stringify({
          count: "2,140",
        })}`,
      ),
    ).toBeTruthy();
    expect(screen.getByText("9.0")).toBeTruthy();
    expect(screen.getByText("9.5")).toBeTruthy();
  });
});
