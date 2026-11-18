// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JournalService, JournalEntryStatusDto } from "@repo/wrapper/server";
import { afterEach, expect, it, vi } from "vitest";
import { JournalHeatmap } from "../../../../../packages/ui/src/components/journal/heatmap/view/JournalHeatmap";

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => undefined }),
);

vi.mock("@repo/locales", () => ({
  useI18nContext: () => ({ language: "en" }),
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : `${key}:${options.count}`,
  }),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("counts January journal entries in January and switches to the selected year", async () => {
  vi.setSystemTime(new Date(2026, 0, 3, 12));
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });

  const entry = {
    collectionEntryId: "entry",
    gameId: 1,
    status: JournalEntryStatusDto.status.FINISHED,
  };
  const getJournal = vi
    .spyOn(JournalService, "journalControllerGetJournalOverviewV1")
    .mockResolvedValue({
      years: [
        {
          year: 2026,
          months: [
            {
              month: 0,
              days: [
                { day: 1, entries: [entry] },
                { day: 2, entries: [entry] },
              ],
            },
          ],
        },
        {
          year: 2025,
          months: [{ month: 0, days: [{ day: 1, entries: [entry] }] }],
        },
      ],
    });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <MantineProvider>
        <JournalHeatmap userId="u1" />
      </MantineProvider>
    </QueryClientProvider>,
  );

  expect(
    await screen.findByText("profile.overview.rollingTotal:2"),
  ).toBeTruthy();
  expect(screen.getAllByText("profile.overview.days:2")).toHaveLength(2);
  expect(screen.getByRole("img")).toBeTruthy();

  fireEvent.click(screen.getByRole("radio", { name: "2025" }));

  expect(screen.getByText("profile.overview.yearTotal:1")).toBeTruthy();
  expect(screen.getByText("profile.overview.days:1")).toBeTruthy();
  expect(getJournal).toHaveBeenCalledTimes(1);
});
