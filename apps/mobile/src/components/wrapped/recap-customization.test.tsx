// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@repo/wrapper/server";
import { RecapBackgroundControl } from "../../../../../packages/ui/src/components/wrapped/RecapBackgroundControl";
import { RecapCustomizePanel } from "../../../../../packages/ui/src/components/wrapped/RecapCustomizePanel";
import { RecapAuraCard } from "../../../../../packages/ui/src/components/wrapped/card/RecapAuraCard";
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
  RECAP_BACKDROP_OPACITY,
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
      imageUrl,
      style,
    }: {
      game?: { id: number };
      imageUrl?: string;
      style?: React.CSSProperties;
    }) => {
      mocks.backdropGames.push(game?.id);
      return (
        <div
          data-testid={"backdrop"}
          data-game={game?.id}
          data-opacity={style?.opacity}
          data-image={imageUrl}
          data-blur={style?.filter}
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

const igdb = (id: string, size: string) =>
  `https://images.igdb.com/igdb/image/upload/t_${size}/${id}.jpg`;
/** A game with two artworks, a screenshot and a cover. */
const gameWithImages = (id: number) =>
  ({
    id,
    name: `Game ${id}`,
    artworks: [{ url: igdb("art1", "thumb") }, { url: igdb("art2", "thumb") }],
    screenshots: [{ url: igdb("shot1", "thumb") }],
    cover: { url: igdb("cover1", "thumb") },
  }) as unknown as Game;

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
  topGameSharePercent: 50,
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
      backdropImageUrl: null,
      backdropBlur: null,
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
    expect(backdrop.getAttribute("data-opacity")).toBe(
      String(RECAP_BACKDROP_OPACITY.poster),
    );
  });

  it.each([
    ["Poster", RecapPosterCard],
    ["Dash", RecapDashCard],
    ["Bento", RecapBentoCard],
    ["Aura", RecapAuraCard],
    ["Feed summary", RecapSummaryCard],
  ])("%s draws the chosen official image", (_, Card) => {
    renderCard(
      <Card
        {...props(custom({ backdropImageUrl: igdb("art2", "1080p") }))}
        games={[gameWithImages(1), ...games.slice(1)]}
      />,
    );

    expect(screen.getByTestId("backdrop").getAttribute("data-image")).toBe(
      igdb("art2", "1080p"),
    );
  });

  it("ignores an image that is not one of the game's official images", () => {
    renderCard(
      <RecapPosterCard
        {...props(custom({ backdropImageUrl: igdb("other", "1080p") }))}
        games={[gameWithImages(1), ...games.slice(1)]}
      />,
    );

    expect(screen.getByTestId("backdrop").hasAttribute("data-image")).toBe(
      false,
    );
  });

  it.each([
    ["Poster", RecapPosterCard, 35],
    ["Dash", RecapDashCard, 35],
    ["Bento", RecapBentoCard, 50],
  ])("%s blurs the art by its default or by the user's choice", (_, Card, px) => {
    const standard = renderCard(<Card {...props()} />);
    expect(screen.getByTestId("backdrop").getAttribute("data-blur")).toBe(
      `blur(${px}px)`,
    );
    standard.unmount();

    renderCard(<Card {...props(custom({ backdropBlur: 70 }))} />);
    expect(screen.getByTestId("backdrop").getAttribute("data-blur")).toBe(
      "blur(70px)",
    );
  });

  it("Poster paints the accent and leaves the comparison out by default", () => {
    const { container } = renderCard(
      <RecapPosterCard {...props(custom({ accent: "violet" }))} />,
    );

    expect(container.innerHTML).toContain("rgb(139, 124, 246)");
    expect(container.innerHTML).not.toContain("rgb(241, 80, 37)");
    expect(container.textContent).not.toContain("▲");
  });

  it.each([
    ["Poster", RecapPosterCard],
    ["Dash", RecapDashCard],
    ["Bento", RecapBentoCard],
    ["Aura", RecapAuraCard],
    ["Feed summary", RecapSummaryCard],
  ])(
    "%s draws a photo instead of the cover art, under the overlay",
    (_, Card) => {
      const { container } = renderCard(
        <Card
          {...props()}
          media={{ photoSrc: "data:image/jpeg;base64,AAAA", overlayOpacity: 0.4 }}
        />,
      );

      expect(screen.queryByTestId("backdrop")).toBeNull();
      expect(container.querySelector('img[src^="data:image/jpeg"]')).not.toBeNull();
    },
  );

  it.each([
    ["Bento", RecapBentoCard],
    ["Aura", RecapAuraCard],
    ["Feed summary", RecapSummaryCard],
  ])("%s darkens the photo evenly by the chosen overlay", (_, Card) => {
    const { container } = renderCard(
      <Card {...props()} media={{ photoSrc: "data:image/jpeg;base64,AAAA", overlayOpacity: 0.4 }} />,
    );

    expect(container.innerHTML).toContain("rgba(15, 14, 13, 0.4)");
  });

  it.each([
    ["Poster", RecapPosterCard],
    ["Dash", RecapDashCard],
    ["Bento", RecapBentoCard],
    ["Aura", RecapAuraCard],
    ["Feed summary", RecapSummaryCard],
  ])("%s leaves the media area to the clip in a video export", (_, Card) => {
    const { container } = renderCard(<Card {...props()} media={{ video: true }} />);

    expect(screen.queryByTestId("backdrop")).toBeNull();
    expect(container.querySelector("img[src]")).toBeNull();
    // The card itself is transparent; the encoder draws the ground and clip.
    expect(container.querySelector("div")!.style.background).toBe("transparent");
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

    expect(container.textContent).toContain("▲");
    expect(container.textContent).toContain("100%");
  });

  it.each([
    ["Dash", RecapDashCard],
    ["Bento", RecapBentoCard],
    ["Aura", RecapAuraCard],
    ["Feed summary", RecapSummaryCard],
  ])(
    "%s hides the comparison by default and shows it when asked",
    (_, Card) => {
      const hidden = renderCard(<Card {...props()} />);
      expect(hidden.container.textContent).not.toContain("▲");
      hidden.unmount();

      const shown = renderCard(
        <Card {...props(custom({ showComparison: true }))} />,
      );
      expect(shown.container.textContent).toContain("▲");
      expect(shown.container.textContent).toContain("100%");
    },
  );

  it.each([
    ["Dash", RecapDashCard],
    ["Bento", RecapBentoCard],
    ["Aura", RecapAuraCard],
    ["Feed summary", RecapSummaryCard],
  ])("%s shows the chosen extra figure", (_, Card) => {
    const { container } = renderCard(
      <Card {...props(custom({ extraStat: "started" }))} />,
    );

    expect(container.textContent).toContain("mobile.wrapped.card.started");
    expect(container.textContent).not.toContain("mobile.wrapped.card.finished");
  });

  it("Bento draws the art at the chosen opacity", () => {
    renderCard(<RecapBentoCard {...props(custom({ backdropOpacity: 0.5 }))} />);

    const backdrop = screen.getByTestId("backdrop");
    expect(backdrop.getAttribute("data-opacity")).toBe("0.5");
    expect(backdrop.getAttribute("data-game")).toBe("1");
  });
});

describe("RecapCustomizePanel", () => {
  const renderPanel = (value: RecapCustomization) => {
    const onChange = vi.fn();
    render(
      <MantineProvider>
        <RecapCustomizePanel value={value} onChange={onChange} />
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
});

describe("RecapBackgroundControl", () => {
  const ranked = [game(1), game(2)];

  const renderControl = (
    overrides: Partial<React.ComponentProps<typeof RecapBackgroundControl>> = {},
  ) => {
    const handlers = {
      onChange: vi.fn(),
      onReset: vi.fn(),
      onCustomChange: vi.fn(),
      onPickPhoto: vi.fn(),
      onRemovePhoto: vi.fn(),
      onPickVideo: vi.fn(),
      onOverlayChange: vi.fn(),
    };
    const base = {
      value: "art" as const,
      games: ranked,
      custom: DEFAULT_RECAP_CUSTOMIZATION,
      defaultOpacity: 0.32,
      defaultBlur: 35,
      photoUrl: null,
      photoLoading: false,
      videoSupported: true,
      videoFile: null,
      videoUrl: null,
      videoMaxSeconds: 15,
      overlay: 0.5,
      ...handlers,
    };
    const props = { ...base, ...overrides };
    const view = render(
      <MantineProvider>
        <RecapBackgroundControl {...props} />
      </MantineProvider>,
    );
    return { ...handlers, view, props };
  };

  const choice = (background: string) =>
    screen.getByRole("radio", {
      name: `mobile.wrapped.background.${background}`,
    });

  it("offers the art, a photo and a clip, and marks the current one", () => {
    renderControl({ value: "photo" });

    expect(choice("art").getAttribute("aria-checked")).toBe("false");
    expect(choice("photo").getAttribute("aria-checked")).toBe("true");
    expect(choice("video").getAttribute("aria-checked")).toBe("false");
  });

  it("changes what fills the background", () => {
    const { onChange } = renderControl();

    fireEvent.click(choice("video"));

    expect(onChange).toHaveBeenCalledWith("video");
  });

  it("shows the art controls only for the art, with the template's opacity", () => {
    const { view, props } = renderControl();

    expect(screen.getByDisplayValue("32%")).toBeTruthy();
    expect(screen.queryByText("mobile.wrapped.custom.resetOpacity")).toBeNull();
    expect(screen.queryByText("mobile.wrapped.custom.overlay")).toBeNull();

    view.rerender(
      <MantineProvider>
        <RecapBackgroundControl {...props} value={"photo"} />
      </MantineProvider>,
    );

    expect(screen.queryByDisplayValue("32%")).toBeNull();
  });

  it("offers the game's official images and picks one", () => {
    const { onCustomChange } = renderControl({
      games: [gameWithImages(1)],
    });

    const options = screen.getAllByRole("radio", {
      name: /mobile\.wrapped\.background\.imageOption/,
    });
    // Two artworks and a screenshot (the cover comes with a loaded game).
    expect(options).toHaveLength(3);
    // The automatic image (the first one) is the one in use.
    expect(options[0].getAttribute("aria-checked")).toBe("true");

    fireEvent.click(options[2]);

    expect(onCustomChange).toHaveBeenCalledWith(
      expect.objectContaining({ backdropImageUrl: igdb("shot1", "1080p") }),
    );
  });

  it("marks the image the user picked", () => {
    renderControl({
      games: [gameWithImages(1)],
      custom: custom({ backdropImageUrl: igdb("art2", "1080p") }),
    });

    const options = screen.getAllByRole("radio", {
      name: /mobile\.wrapped\.background\.imageOption/,
    });
    expect(options[1].getAttribute("aria-checked")).toBe("true");
    expect(options[0].getAttribute("aria-checked")).toBe("false");
  });

  it("starts over with the new game's images when the game changes", async () => {
    const user = userEvent.setup();
    const { onCustomChange } = renderControl({
      games: [gameWithImages(1), gameWithImages(2)],
      custom: custom({ backdropImageUrl: igdb("art2", "1080p") }),
    });

    await user.click(
      screen.getAllByLabelText("mobile.wrapped.custom.backdropGame")[0],
    );
    await user.click(
      await screen.findByRole("option", { name: "Game 2", hidden: true }),
    );

    expect(onCustomChange).toHaveBeenCalledWith(
      expect.objectContaining({ backdropGameId: 2, backdropImageUrl: null }),
    );
  });

  it("does not offer a picker for a game with a single image", () => {
    renderControl({ games: [game(1)] });

    expect(
      screen.queryByRole("radio", {
        name: /mobile\.wrapped\.background\.imageOption/,
      }),
    ).toBeNull();
  });

  it("shows the template's blur until the user sets one", () => {
    const { onCustomChange } = renderControl({
      games: [gameWithImages(1)],
    });

    expect(screen.getByDisplayValue("35%")).toBeTruthy();

    fireEvent.change(
      screen.getByRole("textbox", { name: "mobile.wrapped.custom.blur (%)" }),
      { target: { value: "60" } },
    );
    fireEvent.blur(
      screen.getByRole("textbox", { name: "mobile.wrapped.custom.blur (%)" }),
    );

    expect(onCustomChange).toHaveBeenCalledWith(
      expect.objectContaining({ backdropBlur: 60 }),
    );
  });

  it("offers to reset an opacity the user changed", () => {
    const { onCustomChange } = renderControl({
      custom: custom({ backdropOpacity: 0.8 }),
    });

    expect(screen.getByDisplayValue("80%")).toBeTruthy();

    fireEvent.click(screen.getByText("mobile.wrapped.custom.resetOpacity"));

    expect(onCustomChange).toHaveBeenCalledWith(
      expect.objectContaining({ backdropOpacity: null }),
    );
  });

  it("asks for a photo first, then offers replace, remove and the overlay", () => {
    const empty = renderControl({ value: "photo" });

    expect(
      screen.getByRole("button", { name: /mobile\.wrapped\.photo\.pick/ }),
    ).toBeTruthy();
    // The overlay only matters once there is something to darken.
    expect(screen.queryByDisplayValue("50%")).toBeNull();

    empty.view.rerender(
      <MantineProvider>
        <RecapBackgroundControl
          {...empty.props}
          value={"photo"}
          photoUrl={"data:image/jpeg;base64,AAAA"}
        />
      </MantineProvider>,
    );

    expect(
      screen.getByRole("button", { name: "mobile.wrapped.media.replace" }),
    ).toBeTruthy();
    expect(screen.getByDisplayValue("50%")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "mobile.wrapped.photo.remove" }),
    );
    expect(empty.onRemovePhoto).toHaveBeenCalledTimes(1);
  });

  it("shows the clip's name with replace and remove once one is picked", () => {
    const { onPickVideo } = renderControl({
      value: "video",
      videoFile: new File(["x"], "clip.mp4", { type: "video/mp4" }),
      videoUrl: "blob:clip",
    });

    expect(screen.getByText("clip.mp4")).toBeTruthy();
    expect(screen.getByDisplayValue("50%")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "mobile.wrapped.video.remove" }),
    );
    expect(onPickVideo).toHaveBeenCalledWith(null);
  });

  it("explains when the browser cannot export a clip", () => {
    renderControl({ value: "video", videoSupported: false });

    expect(screen.getByText("mobile.wrapped.video.unsupported")).toBeTruthy();
  });

  it("restores everything", () => {
    const { onReset } = renderControl();

    fireEvent.click(screen.getByText("mobile.wrapped.custom.reset"));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
