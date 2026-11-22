import { readFileSync } from "node:fs";
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
  /** Muted text and filled-accent labels are still text. */
  textMuted: 4.5,
  accentContrast: 4.5,
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
    contrastRatio(tokens.text, tokens.surface),
    `${theme.id}: text/surface must meet WCAG AA 4.5:1`,
  ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.text);
  expect(
    contrastRatio(tokens.textMuted, tokens.background),
    `${theme.id}: textMuted/background must meet WCAG AA 4.5:1`,
  ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.textMuted);
  expect(
    contrastRatio(tokens.accentContrast, tokens.accent),
    `${theme.id}: accentContrast/accent must meet WCAG AA 4.5:1`,
  ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.accentContrast);
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
    expect(isThemeId("ruins")).toBe(true);
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

describe("ruins theme", () => {
  const ruins = themeDefinitions.find((theme) => theme.id === "ruins");
  const overrides = ruins?.overrides;

  it("is a light theme with the Figma palette and a square radius", () => {
    expect(ruins).toBeDefined();
    expect(ruins?.id).not.toBe(DEFAULT_REGISTERED_THEME_ID);
    expect(ruins?.colorScheme).toBe("light");
    expect(ruins?.radius).toBe("0px");
    expect(ruins?.experience ?? "default").toBe("default");
    expect(ruins?.screens).toBe("ruins");
    expect(ruins?.tokens).toMatchObject({
      background: "#CDC8B0",
      surface: "#DAD4BB",
      text: "#3F3C34",
      textMuted: "#57534A",
      border: "#A9A48E",
      accent: "#4E4B42",
      accentContrast: "#DAD4BB",
      focus: "#2F2D27",
    });
    expect(ruins?.style).toMatchObject({
      headingTransform: "uppercase",
      headingTracking: "0.14em",
    });
    expect(overrides?.tertiary).toBe("#B0452F");
  });

  it("uses a dark status bar over the light paper", () => {
    expect(getThemeCatalogEntry("ruins")).toMatchObject({
      colorScheme: "light",
      native: { background: "#CDC8B0", statusBarStyle: "dark" },
    });
  });

  it("keeps pinned text colors readable on the background", () => {
    const background = ruins?.tokens.background ?? "";
    const pinned: Record<string, string | undefined> = {
      "dimmed.default": overrides?.dimmed?.default,
      "dimmed.1": overrides?.dimmed?.[1],
      "dimmed.2": overrides?.dimmed?.[2],
      "dimmed.3": overrides?.dimmed?.[3],
      "level.text": overrides?.level?.text,
      "premium.text": overrides?.premium?.text,
      "status.successText": overrides?.status?.successText,
      "status.warningText": overrides?.status?.warningText,
      "status.dangerText": overrides?.status?.dangerText,
      "nav.text": overrides?.nav?.text,
      "nav.muted": overrides?.nav?.muted,
      "nav.danger": overrides?.nav?.danger,
      "mobile.tabText": overrides?.mobile?.tabText,
      "mobile.menuDanger": overrides?.mobile?.menuDanger,
      accentText: overrides?.accentText,
    };
    for (const [name, color] of Object.entries(pinned)) {
      expect(color, `ruins.${name} is pinned`).toBeDefined();
      expect(
        contrastRatio(color ?? "", background),
        `ruins.${name} on the background`,
      ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.text);
    }
  });

  it("keeps the paper, brand and dark ramps light-theme shaped", () => {
    for (const step of [0, 1, 2, 3, 4, 5, 6, 7, 8] as const) {
      expect(
        luminance(overrides?.paper?.[step] ?? "#000000"),
        `paper-${step} stays light`,
      ).toBeGreaterThan(0.5);
    }
    // dark-0 is the text color and dark-9 the surface.
    expect(overrides?.dark?.[0]).toBe(ruins?.tokens.text);
    expect(overrides?.dark?.[9]).toBe(ruins?.tokens.surface);
    const darkRamp = ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((step) =>
      luminance(overrides?.dark?.[step] ?? "#000000"),
    );
    expect(darkRamp).toEqual([...darkRamp].sort((a, b) => a - b));
  });
});

describe("app chrome tone and panel tokens", () => {
  const themeCss = readFileSync(
    new URL(
      "../../../../packages/ui/src/theme/generated/themes.css",
      import.meta.url,
    ),
    "utf8",
  );

  const readVar = (theme: string, name: string) => {
    const block = themeCss
      .split(`:root[data-theme="${theme}"] {`)[1]!
      .split("}")[0];
    const value = block.match(new RegExp(`--gn-${name}: ([^;]+);`))?.[1];
    if (!value) throw new Error(`Missing --gn-${name} for ${theme}`);
    return value.trim();
  };

  /** The literals components hard-coded before the tokens existed. */
  const DARK_LITERALS: Record<string, string> = {
    "text-pale": "#e6e6e6",
    "text-chalk": "#d9d9d9",
    "text-bright": "#d0d0d0",
    "text-subtle": "#adadad",
    "text-soft": "#a6a6a6",
    "text-quiet": "#8c8c8c",
    "text-faint": "#7a7a7a",
    "text-gray-100": "#f3f4f6",
    "text-gray-300": "#d1d5db",
    "text-gray-4": "#ced4da",
    "text-neutral-300": "#d4d4d4",
    "text-neutral-200": "#e5e5e5",
    "text-on-brand": "#0b0b0b",
    "text-on-brand-alt": "#111111",
    "category-news": "#4dabf7",
    "category-review": "#da77f2",
    "category-article": "#38d9a9",
    panel: "#141414",
    "panel-deep": "#161616",
    "panel-inset": "#1f1f1f",
    "panel-raised": "#222222",
    "panel-line": "#282828",
    "panel-edge": "#302d2d",
    "panel-tint": "#1a120f",
    "panel-floor": "#121212",
    "panel-veil": "rgba(0, 0, 0, 0.4)",
    "panel-rail": "#262626",
    "panel-board": "#15130f",
    "panel-board-dot": "#2e2a22",
  };

  it.each(["gamenode", "xbox"])("keeps the old literals in %s", (theme) => {
    for (const [name, literal] of Object.entries(DARK_LITERALS)) {
      expect(readVar(theme, name).toLowerCase(), `${theme} ${name}`).toBe(
        literal,
      );
    }
  });

  it("keeps ruins text tones readable on its background and cards", () => {
    const readable = [
      "text-pale",
      "text-chalk",
      "text-bright",
      "text-subtle",
      "text-soft",
      "text-quiet",
      "text-faint",
      "text-gray-100",
      "text-gray-300",
      "text-gray-4",
      "text-neutral-300",
      "text-neutral-200",
      "category-news",
      "category-review",
      "category-article",
    ];
    for (const name of readable) {
      const color = readVar("ruins", name);
      for (const surface of ["background", "panel", "panel-inset"]) {
        expect(
          contrastRatio(color, readVar("ruins", surface)),
          `ruins ${name} on ${surface}`,
        ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.text);
      }
    }
  });

  it("keeps ruins card fills light and on-brand text readable on accent", () => {
    for (const name of [
      "panel",
      "panel-deep",
      "panel-inset",
      "panel-raised",
      "panel-tint",
      "panel-floor",
      "panel-veil",
      "panel-rail",
      "panel-board",
    ]) {
      expect(
        luminance(readVar("ruins", name)),
        `ruins ${name}`,
      ).toBeGreaterThan(0.5);
    }
    for (const name of ["text-on-brand", "text-on-brand-alt"]) {
      expect(
        contrastRatio(readVar("ruins", name), readVar("ruins", "accent")),
        `ruins ${name} on accent`,
      ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.accentContrast);
    }
  });
});

const themeCssSource = readFileSync(
  new URL(
    "../../../../packages/ui/src/theme/generated/themes.css",
    import.meta.url,
  ),
  "utf8",
);

type CssBlock = { selectors: string[]; declarations: Map<string, string> };

/** Minimal parser for the generated stylesheet: flat rules, no nesting. */
function parseCssBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations = new Map<string, string>();
    for (const declaration of match[2].split(";")) {
      const separator = declaration.indexOf(":");
      if (separator < 0) continue;
      declarations.set(
        declaration.slice(0, separator).trim(),
        declaration.slice(separator + 1).trim(),
      );
    }
    blocks.push({
      selectors: match[1].split(",").map((selector) => selector.trim()),
      declarations,
    });
  }
  return blocks;
}

const cssBlocks = parseCssBlocks(themeCssSource);

const findBlock = (selector: string) =>
  cssBlocks.find((block) => block.selectors.includes(selector));

const readThemeVar = (themeId: string, name: string) => {
  const value = findBlock(`:root[data-theme="${themeId}"]`)?.declarations.get(
    `--gn-${name}`,
  );
  if (!value) throw new Error(`Missing --gn-${name} for ${themeId}`);
  return value;
};

describe("surface pairs", () => {
  it.each(themeDefinitions)(
    "keeps media text readable on the media scrims of $id",
    (theme) => {
      const text = readThemeVar(theme.id, "media-text");
      const muted = readThemeVar(theme.id, "media-text-muted");
      const dim = readThemeVar(theme.id, "media-text-dim");
      for (const scrim of ["media-scrim", "media-scrim-strong", "media-fade"]) {
        const surface = readThemeVar(theme.id, scrim);
        for (const [name, color] of [
          ["media-text", text],
          ["media-text-muted", muted],
          ["media-text-dim", dim],
        ]) {
          expect(
            contrastRatio(color, surface),
            `${theme.id}: ${name} on ${scrim}`,
          ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.text);
        }
      }
    },
  );

  it.each(themeDefinitions)(
    "derives the media scrim from the color scheme of $id",
    (theme) => {
      const scrim = luminance(readThemeVar(theme.id, "media-scrim"));
      if (theme.colorScheme === "dark") expect(scrim).toBeLessThan(0.1);
      else expect(scrim).toBeGreaterThan(0.5);
    },
  );

  it.each(themeDefinitions)(
    "keeps accent and text pairs readable for $id",
    (theme) => {
      const read = (name: string) => readThemeVar(theme.id, name);
      expect(
        contrastRatio(read("accent-contrast"), read("accent")),
        `${theme.id}: accent-contrast on accent`,
      ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.accentContrast);
      for (const surface of ["background", "panel"]) {
        expect(
          contrastRatio(read("text"), read(surface)),
          `${theme.id}: text on ${surface}`,
        ).toBeGreaterThanOrEqual(REQUIRED_CONTRAST.text);
      }
    },
  );

  it.each(["gamenode", "xbox"])(
    "keeps the old media literals in %s",
    (theme) => {
      const literals: Record<string, string> = {
        "media-scrim": "#000000",
        "media-scrim-strong": "#0a0a0a",
        "media-fade": "#0a0a0a",
        "media-text": "#ffffff",
        "media-text-muted": "#dbdbdb",
        "media-text-dim": "#b8b8b8",
        "media-placeholder": "#1a1a1a",
      };
      for (const [name, literal] of Object.entries(literals)) {
        expect(
          readThemeVar(theme, name).toLowerCase(),
          `${theme} ${name}`,
        ).toBe(literal);
      }
    },
  );
});

describe("theme scopes", () => {
  it.each(themeDefinitions)(
    "generates [data-gn-scope] with the full $id variable set",
    (theme) => {
      const root = findBlock(`:root[data-theme="${theme.id}"]`);
      const scope = findBlock(`[data-gn-scope="${theme.id}"]`);
      expect(root, `${theme.id} root block`).toBeDefined();
      expect(scope, `${theme.id} scope block`).toBeDefined();
      for (const [name, value] of root!.declarations) {
        if (name === "color-scheme") continue;
        expect(scope!.declarations.get(name), `${theme.id} ${name}`).toBe(
          value,
        );
      }
      expect(scope!.declarations.get("color-scheme")).toBe(theme.colorScheme);
    },
  );

  it("aliases `dark` to the default dark theme", () => {
    const scope = findBlock('[data-gn-scope="gamenode"]');
    expect(scope?.selectors).toContain('[data-gn-scope="dark"]');
    expect(findBlock('[data-gn-scope="xbox"]')?.selectors).not.toContain(
      '[data-gn-scope="dark"]',
    );
  });

  it("re-declares Mantine's dark scheme variables so a dark scope works inside a light theme", () => {
    const scope = findBlock('[data-gn-scope="gamenode"]')!;
    const ruins = findBlock(':root[data-theme="ruins"]')!;
    // Ruins remaps these for paper; the dark scope must reset them.
    for (const name of [
      "--mantine-color-default",
      "--mantine-color-default-color",
      "--mantine-color-gray-0",
    ]) {
      expect(scope.declarations.get(name), name).toBeDefined();
      expect(scope.declarations.get(name)).not.toBe(
        ruins.declarations.get(name),
      );
    }
    expect(scope.declarations.get("--mantine-color-default")).toBe(
      "var(--mantine-color-dark-6)",
    );
    expect(scope.declarations.get("--mantine-color-brand-filled")).toBe(
      "var(--mantine-color-brand-8)",
    );
  });
});
