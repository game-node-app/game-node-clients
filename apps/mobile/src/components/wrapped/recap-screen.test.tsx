// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WrappedRecapScreen } from "../../../../../packages/ui/src/components/wrapped/WrappedRecapScreen";
import { getCoverGridCellWidth } from "../../../../../packages/ui/src/components/wrapped/card/RecapCoverGridCard";
import {
  getRecapPreviewScale,
  RECAP_CARD_FORMATS,
} from "../../../../../packages/ui/src/components/wrapped/card/recapCardFormats";

const mocks = vi.hoisted(() => ({
  summary: undefined as unknown,
  playtime: undefined as unknown,
  summaryPeriods: [] as string[],
  toBlob: vi.fn(),
  notifyError: vi.fn(),
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

vi.mock("html-to-image", () => ({ toBlob: mocks.toBlob }));

vi.mock("../../../../../packages/ui/src/components", () => ({
  CenteredLoading: () => <div data-testid={"loading"} />,
  DetailsBox: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TextLink: ({ children }: { children: React.ReactNode }) => (
    <a href={"/x"}>{children}</a>
  ),
  useUserId: () => "user-1",
  useUserProfile: () => ({ data: { username: "Tester" } }),
  useGames: () => ({ data: [], isLoading: false }),
  usePlaytimeForUser: () => ({
    data: mocks.playtime,
    isLoading: false,
  }),
}));

// The video export is a supporter feature; the screen only reads the status.
vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterStatus",
  () => ({ useSupporterStatus: () => ({ data: { isSupporter: false } }) }),
);
vi.mock(
  "../../../../../packages/ui/src/components/supporter/util/useSupporterEntryHref",
  () => ({ useSupporterEntryHref: () => "/supporter" }),
);

vi.mock("../../../../../packages/ui/src/util", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../../packages/ui/src/util")
    >();
  return { ...actual, createErrorNotification: mocks.notifyError };
});

vi.mock(
  "../../../../../packages/ui/src/components/wrapped/hooks/useRecapSummary",
  () => ({
    useRecapSummary: (period: string) => {
      mocks.summaryPeriods.push(period);
      return { data: mocks.summary, isLoading: false };
    },
  }),
);

// The preview only adds scaling (covered by `getRecapPreviewScale`), and the
// templates need avatars and profile queries that are not under test here.
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCardPreview",
  () => ({
    RecapCardPreview: ({
      cardRef,
      children,
    }: {
      cardRef: React.RefObject<HTMLDivElement>;
      children: React.ReactNode;
    }) => <div ref={cardRef}>{children}</div>,
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapSummaryCard",
  () => ({
    RecapSummaryCard: ({ format }: { format: string }) => (
      <div data-testid={"summary-card"}>{format}</div>
    ),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapPosterCard",
  () => ({
    RecapPosterCard: ({ format }: { format: string }) => (
      <div data-testid={"summary-card"}>{format}</div>
    ),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapDashCard",
  () => ({
    RecapDashCard: ({ format }: { format: string }) => (
      <div data-testid={"summary-card"}>{format}</div>
    ),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapBentoCard",
  () => ({
    RecapBentoCard: ({ format }: { format: string }) => (
      <div data-testid={"summary-card"}>{format}</div>
    ),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCoverGridCard",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../../../packages/ui/src/components/wrapped/card/RecapCoverGridCard")
      >();
    return {
      ...actual,
      RecapCoverGridCard: () => <div data-testid={"cover-grid-card"} />,
    };
  },
);

const summary = (seconds: number) => ({
  period: "week",
  current: { totalPlaytimeSeconds: seconds, totalGames: seconds > 0 ? 2 : 0 },
  previous: { totalPlaytimeSeconds: 3600, totalGames: 1 },
  topGames: [],
  topGenre: null,
  topPlatform: null,
  playedInPeriod: 0,
  finishedInPeriod: 0,
  reviewedInPeriod: 0,
});

function renderScreen(onShare = vi.fn(async () => {})) {
  render(
    <MantineProvider>
      <QueryClientProvider client={new QueryClient()}>
        <WrappedRecapScreen onShare={onShare} />
      </QueryClientProvider>
    </MantineProvider>,
  );
  return onShare;
}

const clickGenerate = async () => {
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "mobile.wrapped.buttons.generate" }),
    );
  });
};

beforeEach(() => {
  mocks.summary = summary(7200);
  mocks.playtime = { data: [], pagination: { totalItems: 0 } };
  mocks.summaryPeriods = [];
  mocks.toBlob.mockReset();
  mocks.toBlob.mockResolvedValue(new Blob(["x"], { type: "image/jpeg" }));
  mocks.notifyError.mockReset();

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    writable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
});

afterEach(() => {
  cleanup();
});

describe("getRecapPreviewScale", () => {
  it("fits the card to the container width", () => {
    expect(getRecapPreviewScale(540, "feed")).toBeCloseTo(540 / 1600);
  });

  it("limits the height so a Story card does not take the whole page", () => {
    expect(getRecapPreviewScale(1500, "story")).toBeCloseTo(720 / 1920);
  });

  it("never scales the card up", () => {
    expect(getRecapPreviewScale(5000, "feed", 5000)).toBe(1);
  });

  it("does not scale before the container is measured", () => {
    expect(getRecapPreviewScale(0, "story")).toBe(1);
  });
});

describe("getCoverGridCellWidth", () => {
  it("fills the Story width for a 3 column grid", () => {
    expect(getCoverGridCellWidth("story", 3, 3)).toBe(328);
  });

  it("shrinks cells so every row fits the Feed height", () => {
    const width = getCoverGridCellWidth("feed", 4, 2);
    const cellHeight = (width * 354) / 264;

    expect(cellHeight * 2).toBeLessThanOrEqual(
      RECAP_CARD_FORMATS.feed.height - 48 * 2 - 120,
    );
  });
});

describe("WrappedRecapScreen", () => {
  it("shows the summary card for the default week period", () => {
    renderScreen();

    expect(screen.getByTestId("summary-card").textContent).toBe("story");
    expect(mocks.summaryPeriods.at(-1)).toBe("week");
  });

  it("loads the summary again when another period is picked", () => {
    renderScreen();

    fireEvent.click(screen.getByLabelText("explore.periods.month"));

    expect(mocks.summaryPeriods.at(-1)).toBe("month");
  });

  it("switches to the cover grid template", () => {
    mocks.playtime = { data: [], pagination: { totalItems: 1 } };
    renderScreen();

    fireEvent.click(screen.getByLabelText("mobile.wrapped.templates.covers"));

    expect(screen.getByTestId("cover-grid-card")).toBeTruthy();
    expect(screen.queryByTestId("summary-card")).toBeNull();
  });

  it("exports at the native Story size and shares the file", async () => {
    const onShare = renderScreen();

    await clickGenerate();

    await waitFor(() => expect(onShare).toHaveBeenCalledTimes(1));
    expect(mocks.toBlob).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1080, height: 1920, pixelRatio: 1 }),
    );
    const file = (onShare.mock.calls[0] as unknown as [File])[0];
    expect(file).toBeInstanceOf(File);
    expect(file.name).toMatch(/^gamenode-recap-\d+\.jpeg$/);
  });

  it("exports at the Feed size when Feed is selected", async () => {
    renderScreen();

    fireEvent.click(screen.getByLabelText("mobile.wrapped.formats.feed"));
    await clickGenerate();

    await waitFor(() => expect(mocks.toBlob).toHaveBeenCalledTimes(1));
    expect(mocks.toBlob).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1600, height: 900, pixelRatio: 1 }),
    );
  });

  it("reports an error and keeps the page when sharing fails", async () => {
    const failure = new Error("share unavailable");
    const onShare = vi.fn(async () => {
      throw failure;
    });
    renderScreen(onShare);

    await clickGenerate();

    await waitFor(() => expect(mocks.notifyError).toHaveBeenCalled());
    expect(mocks.notifyError.mock.calls[0][0]).toBe(failure);
    expect(screen.getByTestId("summary-card")).toBeTruthy();
  });

  it("explains an empty period and disables sharing", () => {
    mocks.summary = summary(0);
    renderScreen();

    expect(
      screen.getByText(/mobile\.wrapped\.messages\.noPlaytime/),
    ).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "mobile.wrapped.buttons.generate",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
