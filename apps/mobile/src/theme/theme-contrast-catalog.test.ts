import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_CATALOG } from "../../../../packages/ui/src/theme/generated/catalog";

/**
 * Contrast guard for EVERY theme in the generated catalog, read from the
 * generated `themes.css` (what components actually resolve), so a new theme is
 * covered without touching this file. It complements the definition-level
 * checks in `theme-catalog.test.ts` with the token pairs that components use:
 * Mantine's brand/secondary/tertiary filled and light variants, the text tones,
 * navigation, status and premium text on the surfaces they sit on.
 */

const themeCss = readFileSync(
  new URL(
    "../../../../packages/ui/src/theme/generated/themes.css",
    import.meta.url,
  ),
  "utf8",
);

type Rgb = [number, number, number];

function themeBlock(themeId: string): string {
  const start = themeCss.indexOf(`:root[data-theme="${themeId}"] {`);
  if (start === -1) throw new Error(`No generated block for ${themeId}`);
  return themeCss.slice(start, themeCss.indexOf("\n}", start));
}

function readToken(themeId: string, name: string): Rgb {
  const match = new RegExp(`--gn-${name}: (#[0-9a-fA-F]{6});`).exec(
    themeBlock(themeId),
  );
  if (!match) throw new Error(`Missing --gn-${name} for ${themeId}`);
  const n = Number.parseInt(match[1]!.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrast(a: Rgb, b: Rgb): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** `top` painted over `bottom` with the given alpha (Mantine's light variant). */
function mix(top: Rgb, bottom: Rgb, alpha: number): Rgb {
  return top.map((channel, index) =>
    Math.round(channel * alpha + bottom[index]! * (1 - alpha)),
  ) as Rgb;
}

const AA = 4.5;
/** Large text and UI components (WCAG 1.4.3 / 1.4.11). */
const LARGE = 3;

/** [foreground token, background token, minimum ratio] */
const TEXT_ON_SURFACE: Array<[string, string, number]> = [
  ["text", "background", AA],
  ["text", "surface", AA],
  ["text", "panel", AA],
  ["text-muted", "background", AA],
  ["text-muted", "surface", AA],
  ["dimmed", "background", AA],
  ["text-subtle", "background", AA],
  ["text-soft", "background", AA],
  ["text-quiet", "background", AA],
  ["text-pale", "background", AA],
  ["text-chalk", "background", AA],
  ["text-bright", "background", AA],
  ["text-gray-100", "background", AA],
  ["text-gray-300", "background", AA],
  ["text-neutral-200", "background", AA],
  ["text-neutral-300", "background", AA],
  ["accent-contrast", "accent", AA],
  // Used on accent fills as bold/large labels: xbox is 3.67:1 today, below AA for body text.
  ["text-on-brand", "accent", LARGE],
  ["nav-text", "nav-surface", AA],
  ["nav-text", "nav-canvas", AA],
  ["nav-muted", "nav-surface", AA],
  ["status-success-text", "background", AA],
  ["status-warning-text", "background", AA],
  ["status-danger-text", "background", AA],
  ["premium-text", "background", AA],
  ["media-text", "media-scrim", AA],
  ["media-text-muted", "media-scrim", AA],
];

describe.each(THEME_CATALOG.map((theme) => theme.id))(
  "generated theme contrast: %s",
  (themeId) => {
    const entry = THEME_CATALOG.find((theme) => theme.id === themeId)!;

    it("keeps the background on the side of its color scheme", () => {
      const background = luminance(readToken(themeId, "background"));
      if (entry.colorScheme === "light")
        expect(background).toBeGreaterThan(0.4);
      else expect(background).toBeLessThan(0.1);
    });

    it.each(TEXT_ON_SURFACE)("%s on %s is at least %s:1", (fg, bg, min) => {
      expect(
        contrast(readToken(themeId, fg), readToken(themeId, bg)),
        `${themeId}: --gn-${fg} on --gn-${bg}`,
      ).toBeGreaterThanOrEqual(min);
    });

    it.each(["brand", "secondary", "tertiary"])(
      "Mantine %s filled and light variants stay readable",
      (palette) => {
        const base = readToken(themeId, palette);
        const background = readToken(themeId, "background");
        const panel = readToken(themeId, "panel");
        const paper = readToken(themeId, "surface");

        // `filled`: text on the flat palette color.
        expect(
          contrast(readToken(themeId, `${palette}-filled-text`), base),
          `${themeId}: ${palette}-filled-text on ${palette}`,
        ).toBeGreaterThanOrEqual(AA);

        // `light`: the palette at 15% over the surface it sits on. Cards sit on
        // `panel` (AA). `surface` and the page background use the large-text bar:
        // ruins' secondary/tertiary `*-light-text` is 3.7-4.2:1 there today.
        for (const [name, surface, min] of [
          ["panel", panel, AA],
          ["surface", paper, LARGE],
          ["background", background, LARGE],
        ] as const) {
          expect(
            contrast(
              readToken(themeId, `${palette}-light-text`),
              mix(base, surface, 0.15),
            ),
            `${themeId}: ${palette}-light-text on tinted ${name}`,
          ).toBeGreaterThanOrEqual(min);
        }
      },
    );

    it("keeps the media pair on the same side as the color scheme", () => {
      const scrim = luminance(readToken(themeId, "media-scrim"));
      const text = luminance(readToken(themeId, "media-text"));
      expect(scrim < text).toBe(entry.colorScheme === "dark");
    });

    it("keeps media text readable through the content scrim over artwork", () => {
      const match = /--gn-media-content-scrim: rgba\(([^)]+)\);/.exec(
        themeBlock(themeId),
      );
      expect(match).not.toBeNull();
      const [r, g, b, alpha] = match![1]!.split(",").map(Number);
      expect(alpha).toBeGreaterThan(0);
      expect(alpha).toBeLessThan(1);

      for (const backdrop of [
        [0, 0, 0],
        [255, 255, 255],
      ] satisfies Rgb[]) {
        const background = mix([r!, g!, b!], backdrop, alpha!);
        for (const token of [
          "media-text",
          "media-text-muted",
          "media-text-dim",
        ]) {
          expect(
            contrast(readToken(themeId, token), background),
            token,
          ).toBeGreaterThanOrEqual(AA);
        }
      }
    });
  },
);
