// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  getContrastRatio,
  getOnAccentText,
  getReadableAccent,
  hexToRgba,
  normalizeAccentHex,
} from "../../../../../packages/ui/src/components/supporter/perks/accentColor";

const SURFACE = "#161616";

describe("normalizeAccentHex", () => {
  it("returns an uppercase #RRGGBB color", () => {
    expect(normalizeAccentHex("#9747ff")).toBe("#9747FF");
    expect(normalizeAccentHex("9747FF")).toBe("#9747FF");
    expect(normalizeAccentHex("  #ff8800  ")).toBe("#FF8800");
  });

  it("returns null for invalid input", () => {
    for (const value of [
      "",
      "#FFF",
      "#GGGGGG",
      "red",
      "#9747FF00",
      null,
      undefined,
      123,
    ]) {
      expect(normalizeAccentHex(value)).toBeNull();
    }
  });
});

describe("getContrastRatio", () => {
  it("matches the D3 vectors on the profile surface", () => {
    expect(getContrastRatio("#9747FF", SURFACE)).toBeCloseTo(4.02, 2);
    expect(getContrastRatio("#101010", SURFACE)).toBeCloseTo(1.05, 2);
    expect(getContrastRatio("#FF8800", SURFACE)).toBeCloseTo(7.56, 2);
    expect(getContrastRatio("#F15025", SURFACE)).toBeCloseTo(5.1, 1);
  });

  it("is symmetric", () => {
    expect(getContrastRatio("#9747FF", SURFACE)).toBeCloseTo(
      getContrastRatio(SURFACE, "#9747FF"),
      10,
    );
  });
});

describe("getReadableAccent", () => {
  it("lightens #9747FF to #A159FF for accent text", () => {
    expect(getReadableAccent("#9747FF", SURFACE, 4.5)).toBe("#A159FF");
  });

  it("keeps #9747FF unchanged for decorations at 3:1", () => {
    expect(getReadableAccent("#9747FF", SURFACE, 3)).toBe("#9747FF");
  });

  it("lightens #101010 to the D3 text and decoration shades", () => {
    expect(getReadableAccent("#101010", SURFACE, 4.5)).toBe("#888888");
    expect(getReadableAccent("#101010", SURFACE, 3)).toBe("#646464");
  });

  it("leaves colors that already meet the ratio unchanged", () => {
    expect(getReadableAccent("#FF8800", SURFACE, 4.5)).toBe("#FF8800");
    expect(getReadableAccent("#F15025", SURFACE, 4.5)).toBe("#F15025");
  });

  it("always returns a shade that meets the requested ratio", () => {
    for (const accent of ["#101010", "#9747FF", "#3DD68C", "#4C7DFF"]) {
      expect(
        getContrastRatio(getReadableAccent(accent, SURFACE, 4.5), SURFACE),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("hexToRgba", () => {
  it("converts a hex color and alpha to CSS rgba", () => {
    expect(hexToRgba("#9747FF", 0.14)).toBe("rgba(151, 71, 255, 0.14)");
    expect(hexToRgba("#101010", 1)).toBe("rgba(16, 16, 16, 1)");
  });

  it("clamps alpha to 0…1", () => {
    expect(hexToRgba("#FFFFFF", 2)).toBe("rgba(255, 255, 255, 1)");
    expect(hexToRgba("#FFFFFF", -1)).toBe("rgba(255, 255, 255, 0)");
  });
});

describe("getOnAccentText", () => {
  it("uses white on the supporter violet", () => {
    expect(getOnAccentText("#9747FF")).toBe("#FFFFFF");
  });

  it("uses near-black on a light accent", () => {
    expect(getOnAccentText("#F5C542")).toBe("#141414");
  });
});
