// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@repo/wrapper/server";
import { RecapCardPreview } from "../../../../../packages/ui/src/components/wrapped/card/RecapCardPreview";
import { RecapAuraCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapAuraCard";
import { RecapBentoCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapBentoCard";
import { RecapDashCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapDashCard";
import { RecapPosterCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapPosterCard";
import { RecapSummaryCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapSummaryCard";

const mocks = vi.hoisted(() => ({ width: 0 }));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
  }),
}));

vi.mock("@mantine/hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mantine/hooks")>();
  return {
    ...actual,
    useElementSize: () => ({
      ref: { current: null },
      width: mocks.width,
      height: 0,
    }),
  };
});

vi.mock(
  "../../../../../packages/ui/src/components/game/figure/GameFigureImage",
  () => ({
    GameFigureImage: ({
      game,
      children,
    }: {
      game?: Game;
      children?: React.ReactNode;
    }) => (
      <figure data-testid={"cover"}>
        {game?.name}
        {children}
      </figure>
    ),
  }),
);

// The summary templates draw covers through `RecapCover` (it needs the
// cover hook, i.e. a query client, which is not under test here).
vi.mock(
  "../../../../../packages/ui/src/components/wrapped/card/RecapCover",
  () => ({
    RecapCover: ({ game }: { game?: Game }) => (
      <figure data-testid={"cover"}>{game?.name}</figure>
    ),
    RecapBackdrop: () => null,
  }),
);

const game = (id: number) => ({ id, name: `Game ${id}` }) as unknown as Game;

const summary = (overrides: Record<string, unknown> = {}) =>
  ({
    period: "week",
    current: { totalPlaytimeSeconds: 7200, totalGames: 3 },
    previous: { totalPlaytimeSeconds: 3600, totalGames: 1 },
    topGames: [1, 2, 3, 4, 5].map((gameId) => ({
      gameId,
      totalPlaytimeSeconds: 100,
    })),
    topGenre: { id: 1, name: "RPG", totalPlaytimeSeconds: 100 },
    topPlatform: { id: 6, name: "PC", totalPlaytimeSeconds: 100 },
    playedInPeriod: 0,
    finishedInPeriod: 0,
    reviewedInPeriod: 0,
    ...overrides,
  }) as never;

const figures = (changePercent: number | null) => ({
  hours: 2,
  games: 3,
  changePercent,
  topGameSharePercent: 50,
  hasActivity: true,
});

const renderCard = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  mocks.width = 0;
});

describe("RecapCardPreview", () => {
  const renderPreview = (format: "story" | "feed") => {
    const cardRef = React.createRef<HTMLDivElement>();
    renderCard(
      <RecapCardPreview format={format} cardRef={cardRef}>
        <span>content</span>
      </RecapCardPreview>,
    );
    return screen.getByTestId("recap-card");
  };

  it("keeps the card at its native size while the preview shrinks", () => {
    mocks.width = 800;

    const card = renderPreview("feed");
    const scaler = card.parentElement!;
    const frame = scaler.parentElement!;

    expect(card.style.width).toBe("1600px");
    expect(card.style.height).toBe("900px");
    expect(scaler.style.transform).toBe("scale(0.5)");
    expect(frame.style.width).toBe("800px");
    expect(frame.style.height).toBe("450px");
  });

  it("limits a Story preview in height", () => {
    mocks.width = 1500;

    const card = renderPreview("story");

    expect(card.style.width).toBe("1080px");
    expect(card.style.height).toBe("1920px");
    expect(card.parentElement!.style.transform).toBe("scale(0.375)");
  });
});

describe("recap summary templates", () => {
  const games = [1, 2, 3, 4, 5].map(game);
  const props = (overrides: Record<string, unknown> = {}) => ({
    format: "story" as const,
    userId: "user-1",
    username: "Ana",
    period: "week" as const,
    periodText: "Last 7 days",
    summary: summary(),
    figures: figures(100),
    games,
    ...overrides,
  });

  it("Feed shows the hours, the comparison, the stats and five covers", () => {
    const { container } = renderCard(
      <RecapSummaryCard {...props({ format: "feed" })} />,
    );

    expect(container.textContent).toContain("2");
    // The comparison is opt-in.
    expect(container.textContent).not.toContain("▲");
    expect(container.textContent).toContain("RPG");
    expect(container.textContent).toContain("PC");
    // Finished games only take a row when there is something to show.
    expect(container.textContent).not.toContain(
      "mobile.wrapped.card.finished",
    );
    expect(container.textContent).toContain("Last 7 days");
    // The top game plus the next four.
    expect(screen.getAllByTestId("cover")).toHaveLength(5);
    expect(screen.getAllByTestId("cover")[0].textContent).toBe("Game 1");
  });

  it("Feed falls back to a dash without a top platform or comparison", () => {
    const { container } = renderCard(
      <RecapSummaryCard
        {...props({
          format: "feed",
          summary: summary({ topPlatform: null }),
          figures: figures(null),
        })}
      />,
    );

    expect(container.textContent).not.toContain("PC");
    expect(container.textContent).toContain("-");
    expect(container.textContent).not.toContain("▲");
  });

  it("Poster shows the platform icon next to its name", () => {
    const { container } = renderCard(
      <RecapPosterCard
        {...props({
          summary: summary({
            topPlatform: {
              id: 167,
              name: "PlayStation 5",
              totalPlaytimeSeconds: 1,
            },
          }),
        })}
      />,
    );

    // The card only has room for the short name.
    expect(container.textContent).toContain("PS5");
    expect(
      container.querySelector('img[src$="/v1/public/icons/ps5.png"]'),
    ).not.toBeNull();
  });

  it("Poster headlines the user name and lists the ranked games", () => {
    const { container } = renderCard(<RecapPosterCard {...props()} />);

    expect(container.textContent).toContain("Ana");
    expect(container.textContent).toContain("mobile.wrapped.card.wrapped");
    expect(container.textContent).toContain("RPG");
    // The comparison is opt-in.
    expect(container.textContent).not.toContain("▲");
    // Finished games only take a column when there is something to show.
    expect(container.textContent).not.toContain(
      "mobile.wrapped.card.finished",
    );
    // How much of the period the top game took, and the games played.
    expect(container.textContent).toContain(
      'mobile.wrapped.card.topGameShare:{"percent":50}',
    );
    expect(container.textContent).toContain(
      'mobile.wrapped.card.playedAcross:{"count":3}',
    );
    // The top game plus the next four.
    expect(screen.getAllByTestId("cover")).toHaveLength(5);
  });

  it("Dash builds the sentence from the period and shows the top five", () => {
    const { container } = renderCard(<RecapDashCard {...props()} />);

    expect(container.textContent).toContain("Last 7 days");
    expect(container.textContent).toContain("mobile.wrapped.card.youPlayed");
    // Three covers on the podium and the fourth and fifth in the list.
    expect(screen.getAllByTestId("cover")).toHaveLength(5);
  });

  it("Aura shows the top covers, the hours sentence and the tiles", () => {
    const { container } = renderCard(<RecapAuraCard {...props()} />);

    expect(container.textContent).toContain("Game 1");
    expect(container.textContent).toContain("Game 2");
    expect(container.textContent).toContain("Ana");
    expect(container.textContent).toContain(
      'mobile.wrapped.card.playedAcross:{"count":3}',
    );
    expect(screen.getAllByTestId("cover")).toHaveLength(4);
  });

  it("Bento shows the top game, the figures and the list", () => {
    const { container } = renderCard(<RecapBentoCard {...props()} />);

    expect(container.textContent).toContain("Game 1");
    expect(container.textContent).toContain("Ana");
    expect(container.textContent).toContain("PC");
    expect(screen.getAllByTestId("cover")).toHaveLength(5);
  });
});
