// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import guildClasses from "../../../../../packages/ui/src/components/guild/guild.module.css";
import artClasses from "../../../../../packages/ui/src/components/guild/scene/GuildRewardArt.module.css";
import { GuildRewardArt } from "../../../../../packages/ui/src/components/guild/scene/GuildRewardArt";

function renderArt(props: Parameters<typeof GuildRewardArt>[0]): HTMLElement {
  const { container } = render(<GuildRewardArt {...props} />);
  const art = container.firstElementChild;

  if (!(art instanceof HTMLElement)) {
    throw new Error("GuildRewardArt rendered nothing");
  }

  return art;
}

afterEach(cleanup);

describe("GuildRewardArt", () => {
  it("renders the tavern decor prop for decor rewards", () => {
    const art = renderArt({
      kind: "tavern_decor",
      rewardKey: "decor_oak_barrel",
      size: 34,
    });

    expect(art.tagName).toBe("IMG");
    expect(art).toHaveAttribute("src", "/img/guild/decor-oak-barrel.svg");
    expect(art).toHaveAttribute("width", "34");
  });

  it("renders the chest tier for every chest kind", () => {
    const relic = renderArt({ kind: "chest_relic", rewardKey: "chest_relic" });
    expect(relic).toHaveAttribute("src", "/img/guild/chest-relic.svg");

    const weekly = renderArt({
      kind: "weekly_chest",
      rewardKey: "weekly_chest",
    });
    expect(weekly).toHaveAttribute("src", "/img/guild/chest-silver.svg");
  });

  it("renders the consumable artwork, preferring the consumable key", () => {
    const art = renderArt({
      kind: "consumable",
      rewardKey: "hourglass",
      consumableKey: "reroll_charter",
    });

    expect(art).toHaveAttribute("src", "/img/guild/reroll-charter.svg");
  });

  it("renders a miniature stamp in that stamp style's own colours", () => {
    const art = renderArt({
      kind: "stamp_style",
      rewardKey: "stamp_frost_seal",
      size: 22,
    });

    expect(art.className).toContain(
      guildClasses["stampStyle-stamp_frost_seal"],
    );
    expect(art).toHaveAttribute("data-reward-stamp-style", "stamp_frost_seal");
    expect(art).toHaveAttribute("data-reward-art", "stamp_style");
    expect(art).toHaveTextContent("S");
    expect(art.style.getPropertyValue("--guild-reward-art-size")).toBe("22px");
  });

  it("draws the stamp as a filled wax seal with its own glyph layer", () => {
    const art = renderArt({
      kind: "stamp_style",
      rewardKey: "stamp_gold_seal",
      size: 34,
    });

    // Correction N2: the seal is the `.stamp` fill/rim class, not a ring.
    expect(art.className).toContain(artClasses.stamp);
    expect(art.className).toContain(guildClasses["stampStyle-stamp_gold_seal"]);

    const glyph = art.querySelector(`.${artClasses.stampGlyph}`);
    expect(glyph).toHaveTextContent("S");
    expect(art).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a mini ledger swatch for the license theme's paper and ink", () => {
    const art = renderArt({
      kind: "license_theme",
      rewardKey: "license_winter_ledger",
      size: 20,
    });

    expect(art.className).toContain(
      guildClasses["licenseTheme-license_winter_ledger"],
    );
    expect(art).toHaveAttribute(
      "data-reward-license-theme",
      "license_winter_ledger",
    );
    expect(art.querySelectorAll(`.${artClasses.licenseLine}`)).toHaveLength(2);
  });

  it("wraps the avatar silhouette in the equipped frame class", () => {
    const art = renderArt({
      kind: "avatar_frame",
      rewardKey: "frame_harvest_crown",
      size: 20,
    });

    expect(art.className).toContain(guildClasses["frame-frame_harvest_crown"]);
    expect(art).toHaveAttribute("data-reward-frame", "frame_harvest_crown");
    expect(art.querySelector("img")).toHaveAttribute(
      "src",
      "/img/guild/silhouette.svg",
    );
  });

  it("maps badges to the trophy and titles to the book", () => {
    expect(
      renderArt({ kind: "badge", rewardKey: "badge_archaeologist" }),
    ).toHaveAttribute("src", "/img/guild/trophy.svg");

    expect(
      renderArt({ kind: "title", rewardKey: "title_archaeologist" }),
    ).toHaveAttribute("src", "/img/guild/book.svg");
  });

  it("falls back to the book for an unknown kind", () => {
    const art = renderArt({
      kind: "mystery_kind",
      rewardKey: "mystery_reward",
    });

    expect(art).toHaveAttribute("src", "/img/guild/book.svg");
  });

  it("degrades unknown cosmetic keys without losing the shape", () => {
    const stamp = renderArt({
      kind: "stamp_style",
      rewardKey: "stamp_unknown",
    });
    expect(stamp).toHaveAttribute("data-reward-art", "stamp_style");
    expect(stamp).toHaveTextContent("S");

    const frame = renderArt({
      kind: "avatar_frame",
      rewardKey: "frame_unknown",
    });
    expect(frame.className).toContain(artClasses.frameFallback);
    expect(frame.querySelector("img")).toHaveAttribute(
      "src",
      "/img/guild/silhouette.svg",
    );
  });
});
