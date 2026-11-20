import { describe, expect, it } from "vitest";
import {
  THEME_CATALOG,
  THEME_IDS,
  DEFAULT_THEME_ID as CATALOG_DEFAULT_THEME_ID,
  getThemeCatalogEntry,
  isThemeId,
} from "../../../../packages/ui/src/theme/generated/catalog";
import {
  DEFAULT_REGISTERED_THEME_ID,
  themeDefinitions,
} from "../../../../packages/ui/src/theme/definitions";
import {
  THEME_IONIC_COLOR_NAMES,
  THEME_TOKEN_KEYS,
  type ThemeDefinition,
} from "../../../../packages/ui/src/theme/defineTheme";

const REQUIRED_CONTRAST = {
  /** WCAG AA body text on the page background. */
  text: 4.5,
  /** Large text and UI components. */
  accent: 3,
  focus: 3,
} as const;

function parseHex(value: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) throw new Error(`Not a #RRGGBB color: ${value}`);
  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16) / 255,
    Number.parseInt(hex.slice(2, 4), 16) / 255,
    Number.parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

function luminance(value: string): number {
  const [r, g, b] = parseHex(value).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(first: string, second: string): number {
  const a = luminance(first);
  const b = luminance(second);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

function assertCompleteTokens(theme: ThemeDefinition) {
  for (const key of THEME_TOKEN_KEYS) {
    expect(theme.tokens[key], `${theme.id}.${key}`).toMatch(/^#[0-9a-f]{6}$/i);
  }
  expect(Object.keys(theme.tokens).sort()).toEqual(
    [...THEME_TOKEN_KEYS].sort(),
  );
  for (const key of THEME_TOKEN_KEYS) {
    expect(theme.tokens[key].trim(), `${theme.id}.${key} is empty`).not.toBe(
      "",
    );
  }
}

function assertContrast(theme: ThemeDefinition) {
  const { tokens } = theme;
  expect(
    contrastRatio(tokens.text, tokens.background),
    `${theme.id}: text/background must meet WCAG AA 4.5:1`,
  ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.text);
  expect(
    contrastRatio(tokens.accent, tokens.accentContrast),
    `${theme.id}: accent/accentContrast must meet 3:1`,
  ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.accent);
  expect(
    contrastRatio(tokens.focus, tokens.background),
    `${theme.id}: focus/background must meet 3:1`,
  ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.focus);
}

describe("theme catalog", () => {
  it("catalogs exactly the registered definitions and marks one default", () => {
    expect(DEFAULT_REGISTERED_THEME_ID).toBe(CATALOG_DEFAULT_THEME_ID);
    expect(THEME_CATALOG.map((theme) => theme.id).sort()).toEqual(
      themeDefinitions.map((theme) => theme.id).sort(),
    );
    expect([...THEME_IDS].sort()).toEqual(
      themeDefinitions.map((theme) => theme.id).sort(),
    );
    expect(THEME_CATALOG[0].id).toBe(CATALOG_DEFAULT_THEME_ID);
    expect(THEME_CATALOG.filter((theme) => theme.isDefault)).toHaveLength(1);
    expect(THEME_CATALOG.find((theme) => theme.isDefault)?.id).toBe(
      CATALOG_DEFAULT_THEME_ID,
    );
  });

  it("falls back to the default theme for unknown ids", () => {
    expect(isThemeId("gamenode")).toBe(true);
    expect(isThemeId("xbox")).toBe(true);
    expect(isThemeId(null)).toBe(false);
    expect(isThemeId(undefined)).toBe(false);
    expect(getThemeCatalogEntry("not-a-theme").id).toBe(
      CATALOG_DEFAULT_THEME_ID,
    );
    expect(getThemeCatalogEntry(null).id).toBe(CATALOG_DEFAULT_THEME_ID);
  });

  it.each(themeDefinitions)(
    "defines complete tokens and WCAG AA contrast for $id",
    (theme) => {
      assertCompleteTokens(theme);
      assertContrast(theme);
    },
  );

  it.each(themeDefinitions)(
    "derives the $id catalog entry from its definition",
    (theme) => {
      const entry = getThemeCatalogEntry(theme.id);
      expect(entry).toMatchObject({
        id: theme.id,
        labelKey: theme.labelKey,
        colorScheme: theme.colorScheme,
        isDefault: theme.id === DEFAULT_REGISTERED_THEME_ID,
        experience: theme.experience ?? "default",
        screens: theme.screens ?? null,
        preview: {
          background: theme.tokens.background,
          sidebar: theme.tokens.surface,
          title: theme.tokens.text,
          text: theme.tokens.textMuted,
          accent: theme.tokens.accent,
        },
        native: {
          background:
            theme.overrides?.mobile?.systemBarBackground ??
            theme.tokens.background,
          statusBarStyle: theme.colorScheme === "dark" ? "light" : "dark",
        },
      });
    },
  );
});

describe("gamenode parity baseline", () => {
  const gamenode = themeDefinitions.find((theme) => theme.id === "gamenode");

  it("exists and is the default", () => {
    expect(gamenode).toBeDefined();
    expect(DEFAULT_REGISTERED_THEME_ID).toBe("gamenode");
  });

  it("pins every scale, Ionic color and Mantine value through overrides", () => {
    expect(Object.keys(gamenode?.overrides?.brand ?? {})).toHaveLength(10);
    expect(Object.keys(gamenode?.overrides?.paper ?? {})).toHaveLength(9);
    expect(Object.keys(gamenode?.overrides?.dark ?? {})).toHaveLength(10);
    expect(Object.keys(gamenode?.overrides?.ionic?.colors ?? {})).toEqual([
      ...THEME_IONIC_COLOR_NAMES,
    ]);
    expect(gamenode?.overrides?.brand?.[5]?.toLowerCase()).toBe(
      gamenode?.tokens.accent.toLowerCase(),
    );
    expect(gamenode?.overrides?.paper?.[0]).toBe(gamenode?.tokens.surface);
    expect(gamenode?.overrides?.mantine?.fontFamily).toBe(gamenode?.font);
  });
});

describe("xbox theme", () => {
  const xbox = themeDefinitions.find((theme) => theme.id === "xbox");

  it("uses the Xbox palette and is not the default", () => {
    expect(xbox).toBeDefined();
    expect(xbox?.colorScheme).toBe("dark");
    expect(xbox?.tokens).toMatchObject({
      background: "#0F0F0F",
      surface: "#141414",
      text: "#FFFFFF",
      textMuted: "#9A9A9A",
      accent: "#107C10",
      focus: "#2EA043",
    });
    expect(xbox?.id).not.toBe(DEFAULT_REGISTERED_THEME_ID);
  });

  it("declares the console experience, xbox screens, 4px radius and the Segoe stack", () => {
    expect(xbox?.experience).toBe("console");
    expect(xbox?.screens).toBe("xbox");
    expect(xbox?.radius).toBe("4px");

    const font = xbox?.font ?? "";
    const order = [
      '"Segoe UI Variable"',
      '"Segoe UI"',
      "var(--gn-font-inter, Inter)",
      "Roboto",
    ].map((part) => font.indexOf(part));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(font).not.toMatch(/\.(woff2?|ttf|otf)/);
  });
});
