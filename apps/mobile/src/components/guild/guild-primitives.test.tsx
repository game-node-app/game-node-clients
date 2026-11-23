// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import type { GuildLicenseDto } from "@repo/wrapper/server";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import guildClasses from "../../../../../packages/ui/src/components/guild/guild.module.css";
import {
  GUILD_ASSETS,
  type GuildAssetName,
} from "../../../../../packages/ui/src/components/guild/scene/assets";
import { CategoryTag } from "../../../../../packages/ui/src/components/guild/scene/CategoryTag";
import { GameChip } from "../../../../../packages/ui/src/components/guild/scene/GameChip";
import { GuildFonts } from "../../../../../packages/ui/src/components/guild/scene/GuildFonts";
import { GuildIcon } from "../../../../../packages/ui/src/components/guild/scene/GuildIcon";
import {
  PixelButton,
  type PixelButtonVariant,
} from "../../../../../packages/ui/src/components/guild/scene/PixelButton";
import { RankStamp } from "../../../../../packages/ui/src/components/guild/scene/RankStamp";
import { GuildLicenseCard } from "../../../../../packages/ui/src/components/guild/view/GuildLicenseCard";

function renderWithProvider(ui: ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

function renderWithI18n(ui: ReactElement) {
  return render(
    <I18nProvider language="en">
      <MantineProvider>{ui}</MantineProvider>
    </I18nProvider>,
  );
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
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
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("GUILD_ASSETS", () => {
  it("maps every exported SVG to its public path and intrinsic size", () => {
    const names = Object.keys(GUILD_ASSETS) as GuildAssetName[];

    expect(names).toHaveLength(31);
    expect(new Set(names.map((name) => GUILD_ASSETS[name].src)).size).toBe(
      names.length,
    );

    for (const name of names) {
      const asset = GUILD_ASSETS[name];

      expect(asset.src).toBe(`/img/guild/${name}.svg`);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
    }

    // Sizes come from the Figma SVG roots; the pins are 16x16 exports even
    // though the card renders them at 12 px (design D4).
    expect(GUILD_ASSETS.lantern).toMatchObject({ width: 48, height: 66 });
    expect(GUILD_ASSETS["lina-body"]).toMatchObject({
      width: 192,
      height: 204,
    });
    expect(GUILD_ASSETS.pin).toMatchObject({ width: 16, height: 16 });
  });
});

describe("GuildFonts", () => {
  it("declares both pixel typefaces from the apps' public/font", () => {
    const { container } = render(<GuildFonts />);
    const css = container.querySelector("style")?.textContent ?? "";

    expect(css).toContain("font-family:'Guild Pixel'");
    expect(css).toContain("font-family:'Guild Stamp'");
    expect(css).toContain("/font/PixelifySans-Variable.ttf");
    expect(css).toContain("/font/Silkscreen-Regular.ttf");
    expect(css).toContain("/font/Silkscreen-Bold.ttf");
    expect(css).toContain("font-display:swap");
  });
});

describe("GuildIcon", () => {
  it("renders the artwork with explicit intrinsic width/height on the pixel grid", () => {
    const { container } = render(<GuildIcon name="lantern" />);
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("src", "/img/guild/lantern.svg");
    expect(image).toHaveAttribute("width", "48");
    expect(image).toHaveAttribute("height", "66");
    expect(image?.style.imageRendering).toBe("pixelated");
    expect(image?.className).toContain(guildClasses.pixelated);
  });

  it("scales by width keeping the artwork ratio and keeps alt for Lina", () => {
    render(<GuildIcon name="alert-icon" size={28} alt="Lina" />);

    const image = screen.getByAltText("Lina");

    expect(image).toHaveAttribute("width", "28");
    expect(image).toHaveAttribute("height", "44");
    expect(image).toHaveStyle({ imageRendering: "pixelated" });
  });
});

describe("PixelButton", () => {
  const VARIANTS: PixelButtonVariant[] = ["primary", "ghost", "ghost-dark"];

  it.each(VARIANTS)("renders the %s variant and a native button", (variant) => {
    renderWithProvider(
      <PixelButton variant={variant} onClick={() => undefined}>
        Aceitar
      </PixelButton>,
    );

    const button = screen.getByRole("button", { name: "Aceitar" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-variant", variant);
    expect(button.className).toContain(guildClasses.pixelButton);
    expect(button.className).toContain(
      {
        primary: guildClasses.pixelButtonPrimary,
        ghost: guildClasses.pixelButtonGhost,
        "ghost-dark": guildClasses.pixelButtonGhostDark,
      }[variant],
    );
  });

  it("applies the small size and full width classes", () => {
    renderWithProvider(
      <PixelButton size="sm" fullWidth>
        Agora não
      </PixelButton>,
    );

    const button = screen.getByRole("button", { name: "Agora não" });

    expect(button.className).toContain(guildClasses.pixelButtonSm);
    expect(button.className).toContain(guildClasses.pixelButtonFullWidth);
  });

  it("forwards the disabled state", () => {
    renderWithProvider(<PixelButton disabled>Entregar</PixelButton>);

    expect(screen.getByRole("button", { name: "Entregar" })).toBeDisabled();
  });
});

describe("RankStamp", () => {
  it("renders the rank seal with the requested size", () => {
    render(<RankStamp rank="C" />);

    const stamp = screen.getByText("C").parentElement;

    expect(stamp).toHaveAttribute("data-rank", "C");
    expect(stamp?.className).toContain(guildClasses.rankStamp);
    expect(stamp?.style.getPropertyValue("--guild-rank-stamp-size")).toBe(
      "46px",
    );
    expect(screen.getByText("RANK")).toBeInTheDocument();
  });

  it("accepts the licence card's larger stamp", () => {
    render(<RankStamp rank="S" size={52} />);

    expect(
      screen
        .getByText("S")
        .parentElement?.style.getPropertyValue("--guild-rank-stamp-size"),
    ).toBe("52px");
  });
});

describe("CategoryTag", () => {
  it.each([
    ["library", "Da sua biblioteca", guildClasses.categoryTagLibrary],
    ["event", "Evento curado · 9 dias", guildClasses.categoryTagEvent],
    ["weekly", "Semanal", guildClasses.categoryTagWeekly],
    ["gamenode", "Uso do GameNode", guildClasses.categoryTagGamenode],
    ["goal", "Meta", guildClasses.categoryTagGoal],
  ] as const)(
    "renders the %s variant with its own class",
    (category, label, variantClass) => {
      render(<CategoryTag category={category}>{label}</CategoryTag>);

      const tag = screen.getByText(label);

      expect(tag).toHaveAttribute("data-category", category);
      expect(tag.className).toContain(guildClasses.categoryTag);
      expect(tag.className).toContain(variantClass);
    },
  );
});

describe("GameChip", () => {
  it("renders a 16x20 pixelated cover, name and meta", () => {
    const { container } = render(
      <GameChip
        gameId={1029}
        name="Hollow Knight"
        coverUrl={"/img/games/hollow-knight.png"}
        meta="desde 2023"
      />,
    );

    const chip = screen.getByText("Hollow Knight").closest("[data-game-id]");
    const cover = container.querySelector("img");

    expect(chip).toHaveAttribute("data-game-id", "1029");
    expect(cover).toHaveAttribute("src", "/img/games/hollow-knight.png");
    expect(cover).toHaveAttribute("width", "16");
    expect(cover).toHaveAttribute("height", "20");
    expect(cover?.style.imageRendering).toBe("pixelated");
    expect(screen.getByText("desde 2023")).toBeInTheDocument();
  });

  it("falls back to an empty cover tile when the game has no cover", () => {
    const { container } = render(<GameChip name="Celeste" />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-empty-cover]")).toBeInTheDocument();
    expect(screen.getByText("Celeste")).toBeInTheDocument();
  });
});

describe("GuildLicenseCard frames", () => {
  const LICENSE: GuildLicenseDto = {
    licenseNumber: 47,
    rank: "C" as GuildLicenseDto["rank"],
    xp: 1240,
    currentRankMinXp: 800,
    nextRank: "B" as GuildLicenseDto["nextRank"],
    nextRankXp: 2000,
    xpToNextRank: 760,
    memberSince: "2024-05-01T00:00:00.000Z",
    equippedTitleKey: null,
    equippedFrameKey: null,
    stats: { finishedGames: 12, backlogGames: 30, reviewsCount: 4 },
  };

  /** The five `avatar_frame` starter keys of hand-off table 11.4. */
  const FRAME_CLASSES = [
    ["frame_parchment_seal", guildClasses.licenseFrameParchment],
    ["frame_lantern_glow", guildClasses.licenseFrameLantern],
    ["frame_ember_rune", guildClasses.licenseFrameEmber],
    ["frame_moonlit_ivy", guildClasses.licenseFrameIvy],
    ["frame_gilded_compass", guildClasses.licenseFrameGilded],
  ] as const;

  function renderFrame(frameKey: string | null): HTMLElement | null {
    const { container } = renderWithI18n(
      <GuildLicenseCard license={{ ...LICENSE, equippedFrameKey: frameKey }} />,
    );

    return container.querySelector<HTMLElement>("[data-frame]");
  }

  it.each(FRAME_CLASSES)(
    "gives %s its own frame class",
    (frameKey, frameClass) => {
      const frame = renderFrame(frameKey);

      expect(frame).toHaveAttribute("data-frame", frameKey);
      expect(frame?.className).toContain(guildClasses.licenseFrame);
      expect(frame?.className).toContain(frameClass);
    },
  );

  it("renders each starter frame with a distinct class", () => {
    const renderedClasses = FRAME_CLASSES.map(
      ([frameKey]) => renderFrame(frameKey)?.className ?? "",
    );

    expect(new Set(renderedClasses).size).toBe(FRAME_CLASSES.length);
    expect(
      new Set(FRAME_CLASSES.map(([, frameClass]) => frameClass)).size,
    ).toBe(FRAME_CLASSES.length);
  });

  it("keeps the generic frame for an unknown key", () => {
    const frame = renderFrame("frame_from_the_future");

    expect(frame).toHaveAttribute("data-frame", "frame_from_the_future");
    expect(frame?.className).toContain(guildClasses.licenseFrameGeneric);
  });
});
