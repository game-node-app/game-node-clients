// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCalendarDays,
  ReleaseCalendar,
  useUpcomingReleasesByDay,
} from "../../../../packages/ui/src/components/home/ReleaseCalendar";
import { ReleaseStrip } from "../../../../packages/ui/src/components/home/ReleaseStrip";
import { getReleaseDay } from "../../../../packages/ui/src/components/game/util/getLocalizedFirstReleaseDate";
import { setupDom } from "./mcp/testUtils";

const state = vi.hoisted(() => ({
  query: {
    data: undefined as { data: Game[] } | undefined,
    isLoading: false,
    isError: false,
  },
  ownEntry: vi.fn(() => ({ data: null })),
}));
vi.mock(
  "../../../../packages/ui/src/components/game/hooks/useGamesByCollectionType",
  () => ({
    useGamesByCollectionType: () => state.query,
  }),
);
vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => undefined,
}));
vi.mock(
  "../../../../packages/ui/src/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId",
  () => ({
    useOwnCollectionEntryForGameId: state.ownEntry,
  }),
);
vi.mock("../../../../packages/ui/src/util", () => ({
  Link: (props: import("react").ComponentProps<"a">) => <a {...props} />,
}));

const game = (id: number, date?: string) =>
  ({
    id,
    name: `Game ${id}`,
    firstReleaseDate: date,
    summary: `Summary ${id}`,
  }) as Game;
const releases = [
  game(1, "2026-11-03T00:00:00.000Z"),
  game(2, "2026-11-03T00:00:00.000Z"),
  game(3, "2026-11-04T00:00:00.000Z"),
  game(4),
];
const wrapper = ({ children }: import("react").PropsWithChildren) => (
  <I18nProvider language="en">
    <MantineProvider>{children}</MantineProvider>
  </I18nProvider>
);

beforeEach(() => {
  setupDom();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-03T12:00:00Z"));
  state.query = { data: { data: releases }, isLoading: false, isError: false };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("release calendar", () => {
  it.each([
    ["2026-11-01", "2026-11-01", "2026-12-05"],
    ["2024-02-01", "2024-01-28", "2024-03-02"],
    ["2026-08-01", "2026-07-26", "2026-09-05"],
  ])("covers %s with complete Sunday-first weeks", (month, start, end) => {
    const days = getCalendarDays(dayjs(month));
    expect(days.length % 7).toBe(0);
    expect(days[0].format("YYYY-MM-DD")).toBe(start);
    expect(days.at(-1)?.format("YYYY-MM-DD")).toBe(end);
    expect(days.every((day, index) => day.day() === index % 7)).toBe(true);
    expect(days.filter((day) => day.isSame(month, "month"))).toHaveLength(
      dayjs(month).daysInMonth(),
    );
  });

  it("groups UTC release dates on their intended day and skips undated games", () => {
    expect(
      getReleaseDay(releases[0].firstReleaseDate!).format("YYYY-MM-DD"),
    ).toBe("2026-11-03");
    const { result } = renderHook(useUpcomingReleasesByDay);
    expect([...result.current.gamesByDay.keys()]).toEqual([
      "2026-11-03",
      "2026-11-04",
    ]);
    expect(
      result.current.gamesByDay.get("2026-11-03")?.map((game) => game.id),
    ).toEqual([1, 2]);
  });

  it("selects a release day and cycles through that day's games", () => {
    render(<ReleaseCalendar />, { wrapper });
    const agenda = document.querySelector(
      '[aria-live="polite"]',
    ) as HTMLElement;
    expect(within(agenda).getByRole("link").getAttribute("href")).toBe(
      "/game/1",
    );
    fireEvent.click(screen.getByRole("button", { name: "Next game" }));
    expect(within(agenda).getByRole("link").getAttribute("href")).toBe(
      "/game/2",
    );
    fireEvent.click(screen.getByRole("button", { name: "Next game" }));
    expect(within(agenda).getByRole("link").getAttribute("href")).toBe(
      "/game/1",
    );
    fireEvent.click(screen.getByRole("button", { name: "Previous game" }));
    expect(within(agenda).getByRole("link").getAttribute("href")).toBe(
      "/game/2",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Wednesday, November 4, 1 games/i }),
    );
    expect(within(agenda).getByRole("link").getAttribute("href")).toBe(
      "/game/3",
    );
    expect(screen.queryByRole("button", { name: "Next game" })).toBeNull();
    expect(
      (
        screen.getByRole("button", {
          name: /November 5, 0 games/i,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("opens the monthly calendar from the weekly strip without querying a guest's library", async () => {
    render(<ReleaseStrip />, { wrapper });
    const toggle = screen.getByRole("button", { name: "View calendar" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(
      screen
        .getByRole("button", { name: "Hide calendar" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      await screen.findByRole("region", { name: "Release calendar" }),
    ).toBeTruthy();
    expect(state.ownEntry).toHaveBeenCalledWith(1, false);
    fireEvent.click(screen.getByRole("button", { name: "Hide calendar" }));
    expect(
      screen
        .getByRole("button", { name: "View calendar" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("handles loading, an empty response and a failed request", () => {
    state.query = { data: undefined, isLoading: true, isError: false };
    const view = render(<ReleaseStrip />, { wrapper });
    expect(screen.getByRole("region", { name: "Upcoming" })).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
    state.query = { data: { data: [] }, isLoading: false, isError: false };
    view.rerender(<ReleaseStrip />);
    expect(screen.queryByRole("region")).toBeNull();
    state.query = { data: undefined, isLoading: false, isError: true };
    view.rerender(<ReleaseStrip />);
    expect(screen.queryByRole("region")).toBeNull();
  });
});
