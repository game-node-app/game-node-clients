// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import guildClasses from "../../../../../packages/ui/src/components/guild/guild.module.css";
import { GuildScene } from "../../../../../packages/ui/src/components/guild/scene/GuildScene";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) => (key === "guild.scene.boardSign" ? "PEDIDOS" : key),
  }),
}));

function imageSources(container: HTMLElement): string[] {
  return [...container.querySelectorAll("img")].map(
    (image) => image.getAttribute("src") ?? "",
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("GuildScene desktop (1280 x 360 stage)", () => {
  it("renders the wall board, shelf, counter, Lina and the dialogue slot", () => {
    const { container } = render(
      <GuildScene
        variant="desktop"
        pose="neutral"
        isTalking={false}
        showAlert
        dialogue={<div>Lina fala</div>}
      />,
    );

    const scene = container.querySelector('[data-variant="desktop"]');

    expect(scene?.className).toContain(guildClasses.sceneDesktop);
    expect(
      container.querySelector(`[class~="${guildClasses.sceneStageDesktop}"]`),
    ).not.toBeNull();

    expect(imageSources(container)).toEqual(
      expect.arrayContaining([
        "/img/guild/lina-body.svg",
        "/img/guild/lina-braids.svg",
        "/img/guild/lina-eyes-closed.svg",
        "/img/guild/lantern.svg",
        "/img/guild/lantern-glow.svg",
        "/img/guild/alert-bubble.svg",
        "/img/guild/mug.svg",
        "/img/guild/milk.svg",
        "/img/guild/plant.svg",
        "/img/guild/bell.svg",
        "/img/guild/ledger.svg",
        "/img/guild/inkpot.svg",
        "/img/guild/stamp.svg",
      ]),
    );

    expect(container.querySelectorAll("[data-paper]")).toHaveLength(6);
    expect(screen.getByText("PEDIDOS")).toBeInTheDocument();

    const dialogueSlot = container.querySelector("[data-scene-dialogue]");

    expect(dialogueSlot).toContainElement(screen.getByText("Lina fala"));
  });

  it("keeps the Lina sprite on the pixel grid at 6x", () => {
    render(
      <GuildScene
        variant="desktop"
        pose="neutral"
        isTalking={false}
        showAlert={false}
      />,
    );

    const lina = screen.getByAltText("Lina");

    expect(lina).toHaveAttribute("width", "192");
    expect(lina).toHaveAttribute("height", "204");
    expect(lina.style.imageRendering).toBe("pixelated");
  });
});

describe("GuildScene mobile (390 x 280 composition)", () => {
  it("renders the compact scene and never overlays the dialogue", () => {
    const { container } = render(
      <GuildScene
        variant="mobile"
        pose="happy"
        isTalking={false}
        showAlert={false}
        dialogue={<div>Não deve aparecer</div>}
      />,
    );

    const scene = container.querySelector('[data-variant="mobile"]');

    expect(scene?.className).toContain(guildClasses.sceneMobile);
    expect(
      container.querySelector(`[class~="${guildClasses.sceneStageMobile}"]`),
    ).not.toBeNull();
    expect(container.querySelector("[data-scene-dialogue]")).toBeNull();
    expect(screen.queryByText("Não deve aparecer")).toBeNull();

    // The wall quest board only exists in the desktop composition.
    expect(container.querySelectorAll("[data-paper]")).toHaveLength(0);
    expect(screen.queryByText("PEDIDOS")).toBeNull();

    const images = imageSources(container);

    expect(images).toEqual(
      expect.arrayContaining([
        "/img/guild/lina-eyes-happy.svg",
        "/img/guild/lina-smile.svg",
        "/img/guild/lantern.svg",
        "/img/guild/lantern-glow.svg",
        "/img/guild/milk.svg",
        "/img/guild/plant.svg",
        "/img/guild/bell.svg",
        "/img/guild/ledger.svg",
        "/img/guild/stamp.svg",
      ]),
    );
    expect(images).not.toContain("/img/guild/alert-bubble.svg");
    expect(images).not.toContain("/img/guild/mug.svg");
    expect(images).not.toContain("/img/guild/inkpot.svg");
    expect(images).not.toContain("/img/guild/lina-eyes-closed.svg");
  });

  it("renders Lina at 5x and the alert balloon only when requested", () => {
    const { container } = render(
      <GuildScene variant="mobile" pose="neutral" isTalking showAlert />,
    );

    const lina = screen.getByAltText("Lina");

    expect(lina).toHaveAttribute("width", "160");
    expect(lina).toHaveAttribute("height", "170");
    expect(imageSources(container)).toContain("/img/guild/alert-bubble.svg");
    expect(imageSources(container)).toContain("/img/guild/lina-mouth-open.svg");
  });
});
