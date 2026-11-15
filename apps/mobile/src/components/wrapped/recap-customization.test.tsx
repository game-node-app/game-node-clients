// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@repo/wrapper/server";
import { RecapCustomizePanel } from "../../../../../packages/ui/src/components/wrapped/RecapCustomizePanel";
import { RecapBentoCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapBentoCard";
import { RecapDashCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapDashCard";
import { RecapPosterCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapPosterCard";
import { RecapSummaryCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapSummaryCard";
import {
  DEFAULT_RECAP_CUSTOMIZATION,
  getBackdropOpacity,
  getRecapAccent,
  getRecapExtraStat,
  pickBackdropGame,
  RECAP_ACCENTS,
  type RecapCustomization,
} from "../../../../../packages/ui/src/components/wrapped/card/recapCustomization";

const mocks = vi.hoisted(() => ({
  backdropGames: [] as (number | undefined)[],
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

// The cards only need to report which game's art they draw, and how visible it is.
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCover",
  () => ({
    RecapCover: () => <div data-testid={"cover"} />,
    RecapBackdrop: ({
      game,
      style,
    }: {
      game?: { id: number };
      style?: React.CSSProperties;
    }) => {
      mocks.backdropGames.push(game?.id);
      return (
        <div
          data-testid={"backdrop"}
          data-game={game?.id}
          data-opacity={style?.opacity}
        />
      );
    },
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapPlatformMark",
  () => ({ RecapPlatformMark: () => <span /> }),
);
vi.mock(
  "../../../../../packages/ui/src/components/general/GameNodeLogo",
  () => ({
    GameNodeLogo: () => <span />,
  }),
);

const game = (id: number) => ({ id, name: `Game ${id}` }) as unknown as Game;
const games = [1, 2, 3, 4, 5].map(game);

const summary = {
  period: "week",
  current: { totalPlaytimeSeconds: 7200, totalGames: 3 },
  previous: { totalPlaytimeSeconds: 3600, totalGames: 1 },
  topGames: [1, 2, 3, 4, 5].map((gameId) => ({
    gameId,
    totalPlaytimeSeconds: 100,
  })),
  topGenre: null,
  topPlatform: { id: 6, name: "PC", totalPlaytimeSeconds: 100 },
  playedInPeriod: 6,
  finishedInPeriod: 3,
  reviewedInPeriod: 7,
} as never;

const figures = {
  hours: 2,
  games: 3,
  changePercent: 100,
  hasActivity: true,
};

const props = (custom?: RecapCustomization) => ({
  format: "story" as const,
  userId: "user-1",
  username: "Ana",
  period: "week" as const,
  periodText: "Last 7 days",
  summary,
  figures,
  games,
  custom,
});

const custom = (patch: Partial<RecapCustomization>): RecapCustomization => ({
  ...DEFAULT_RECAP_CUSTOMIZATION,
  ...patch,
});

const renderCard = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

beforeEach(() => {
  mocks.backdropGames = [];
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

afterEach(cleanup);

describe("customization helpers", () => {
  it("defaults keep the template look and hide the comparison", () => {
    expect(DEFAULT_RECAP_CUSTOMIZATION).toEqual({
      backdropGameId: null,
      backdropOpacity: null,
      accent: "brand",
      extraStat: "finished",
      showComparison: false,
    });
    expect(getRecapAccent()).toBe(RECAP_ACCENTS.brand);
    expect(getRecapAccent(custom({ accent: "violet" }))).toBe("#8B7CF6");
  });

  it("picks the chosen backdrop game while it is ranked, else the top game", () => {
    const ranked = [{ game: game(1) }, { game: game(2) }, { game: game(3) }];

    expect(pickBackdropGame(ranked)?.id).toBe(1);
    expect(pickBackdropGame(ranked, custom({ backdropGameId: 3 }))?.id).toBe(3);
    expect(pickBackdropGame(ranked, custom({ backdropGameId: 99 }))?.id).toBe(
      1,
    );
    expect(pickBackdropGame([], custom({ backdropGameId: 3 }))).toBeUndefined();
  });

  it("uses the template opacity until the user sets one, and clamps it", () => {
    expect(getBackdropOpacity(0.32)).toBe(0.32);
    expect(getBackdropOpacity(0.32, custom({ backdropOpacity: 0.7 }))).toBe(
      0.7,
    );
    expect(getBackdropOpacity(0.32, custom({ backdropOpacity: 0 }))).toBe(0);
    expect(getBackdropOpacity(0.32, custom({ backdropOpacity: 4 }))).toBe(1);
    expect(getBackdropOpacity(0.32, custom({ backdropOpacity: -1 }))).toBe(0);
  });

  it("maps the extra figure to its label and value", () => {
    expect(getRecapExtraStat(summary)).toEqual({
      labelKey: "mobile.wrapped.card.finished",
      value: "3",
    });
    expect(
      getRecapExtraStat(summary, custom({ extraStat: "reviewed" })),
    ).toEqual({
      labelKey: "mobile.wrapped.card.reviewed",
      value: "7",
    });
    expect(
      getRecapExtraStat(summary, custom({ extraStat: "started" })),
    ).toEqual({
      labelKey: "mobile.wrapped.card.started",
      value: "6",
    });
  });
});

describe("customization in the cards", () => {
  it("Poster draws the chosen game's art at the chosen opacity", () => {
    renderCard(
      <RecapPosterCard
        {...props(custom({ backdropGameId: 4, backdropOpacity: 0.6 }))}
      />,
    );

    const backdrop = screen.getByTestId("backdrop");
    expect(backdrop.getAttribute("data-game")).toBe("4");
    expect(backdrop.getAttribute("data-opacity")).toBe("0.6");
  });

  it("Poster keeps the top game and its default opacity without choices", () => {
    renderCard(<RecapPosterCard {...props()} />);

    const backdrop = screen.getByTestId("backdrop");
    expect(backdrop.getAttribute("data-game")).toBe("1");
    expect(backdrop.getAttribute("data-opacity")).toBe("0.32");
  });

  it("Poster paints the accent and leaves the comparison out by default", () => {
    const { container } = renderCard(
      <RecapPosterCard {...props(custom({ accent: "violet" }))} />,
    );

    expect(container.innerHTML).toContain("rgb(139, 124, 246)");
    expect(container.innerHTML).not.toContain("rgb(241, 80, 37)");
    expect(container.textContent).not.toContain(
      "mobile.wrapped.card.comparison",
    );
  });

  it("Poster shows the chosen extra figure", () => {
    const { container } = renderCard(
      <RecapPosterCard {...props(custom({ extraStat: "reviewed" }))} />,
    );

    expect(container.textContent).toContain("mobile.wrapped.card.reviewed");
    expect(container.textContent).toContain("7");
  });

  it("Poster shows the comparison only when asked", () => {
    const { container } = renderCard(
      <RecapPosterCard {...props(custom({ showComparison: true }))} />,
    );

    expect(container.textContent).toContain("mobile.wrapped.card.comparison");
    expect(container.textContent).toContain("+100%");
  });

  it.each([
    ["Dash", RecapDashCard],
    ["Bento", RecapBentoCard],
    ["Feed summary", RecapSummaryCard],
  ])(
    "%s hides the comparison by default and shows it when asked",
    (_, Card) => {
      const hidden = renderCard(<Card {...props()} />);
      expect(hidden.container.textContent).not.toContain("vsPrevious");
      hidden.unmount();

      const shown = renderCard(
        <Card {...props(custom({ showComparison: true }))} />,
      );
      expect(shown.container.textContent).toContain(
        'mobile.wrapped.card.vsPrevious:{"percent":"+100"}',
      );
    },
  );

  it.each([
    ["Dash", RecapDashCard],
    ["Bento", RecapBentoCard],
    ["Feed summary", RecapSummaryCard],
  ])("%s shows the chosen extra figure", (_, Card) => {
    const { container } = renderCard(
      <Card {...props(custom({ extraStat: "started" }))} />,
    );

    expect(container.textContent).toContain("mobile.wrapped.card.started");
    expect(container.textContent).not.toContain("mobile.wrapped.card.finished");
  });

  it("Bento shows the art as the opposite of its accent overlay", () => {
    const { container } = renderCard(
      <RecapBentoCard {...props(custom({ backdropOpacity: 0.5 }))} />,
    );

    expect(container.innerHTML).toContain("opacity: 0.5");
    expect(screen.getByTestId("backdrop").getAttribute("data-game")).toBe("1");
  });
});

describe("RecapCustomizePanel", () => {
  const ranked = [
    { id: 1, name: "Game 1" },
    { id: 2, name: "Game 2" },
  ];

  const renderPanel = (
    value: RecapCustomization,
    options: { hasBackdrop?: boolean } = {},
  ) => {
    const onChange = vi.fn();
    render(
      <MantineProvider>
        <RecapCustomizePanel
          value={value}
          onChange={onChange}
          games={ranked}
          hasBackdrop={options.hasBackdrop ?? true}
          defaultOpacity={0.32}
        />
      </MantineProvider>,
    );
    return onChange;
  };

  it("picks an accent color", () => {
    const onChange = renderPanel(DEFAULT_RECAP_CUSTOMIZATION);

    fireEvent.click(screen.getByTestId("recap-accent-teal"));

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_RECAP_CUSTOMIZATION,
      accent: "teal",
    });
  });

  it("marks the current accent as pressed", () => {
    renderPanel(custom({ accent: "gold" }));

    expect(
      screen.getByTestId("recap-accent-gold").getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByTestId("recap-accent-brand").getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("toggles the comparison", () => {
    const onChange = renderPanel(DEFAULT_RECAP_CUSTOMIZATION);

    fireEvent.click(
      screen.getByLabelText("mobile.wrapped.custom.showComparison"),
    );

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_RECAP_CUSTOMIZATION,
      showComparison: true,
    });
  });

  it("changes the extra figure", () => {
    const onChange = renderPanel(DEFAULT_RECAP_CUSTOMIZATION);

    fireEvent.click(
      screen.getByLabelText("mobile.wrapped.custom.extra.reviewed"),
    );

    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_RECAP_CUSTOMIZATION,
      extraStat: "reviewed",
    });
  });

  it("shows the art controls only for templates with art", () => {
    renderPanel(DEFAULT_RECAP_CUSTOMIZATION, { hasBackdrop: false });

    expect(screen.queryByText("mobile.wrapped.custom.opacity")).toBeNull();
    expect(
      screen.queryByLabelText("mobile.wrapped.custom.backdropGame"),
    ).toBeNull();
  });

  it("shows the template's opacity until the user sets one, then offers a reset", () => {
    const { rerender } = render(
      <MantineProvider>
        <RecapCustomizePanel
          value={DEFAULT_RECAP_CUSTOMIZATION}
          onChange={vi.fn()}
          games={ranked}
          hasBackdrop
          defaultOpacity={0.32}
        />
      </MantineProvider>,
    );
    expect(screen.getByText("32%")).toBeTruthy();
    expect(screen.queryByText("mobile.wrapped.custom.resetOpacity")).toBeNull();

    const onChange = vi.fn();
    rerender(
      <MantineProvider>
        <RecapCustomizePanel
          value={custom({ backdropOpacity: 0.8 })}
          onChange={onChange}
          games={ranked}
          hasBackdrop
          defaultOpacity={0.32}
        />
      </MantineProvider>,
    );
    expect(screen.getByText("80%")).toBeTruthy();

    fireEvent.click(screen.getByText("mobile.wrapped.custom.resetOpacity"));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ backdropOpacity: null }),
    );
  });

  it("restores every choice", () => {
    const onChange = renderPanel(
      custom({ accent: "pink", extraStat: "started", showComparison: true }),
    );

    fireEvent.click(screen.getByText("mobile.wrapped.custom.reset"));

    expect(onChange).toHaveBeenCalledWith(DEFAULT_RECAP_CUSTOMIZATION);
  });
});
