// @vitest-environment jsdom
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@repo/locales";
import {
  GameRepositoryService,
  ProfileService,
  RecapService,
} from "@repo/wrapper/server";
import { cleanup, render, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { AwardsEventBand } from "../../../../packages/ui/src/components/awards/shared/AwardsEventBand";
import { AwardsSecondaryButton } from "../../../../packages/ui/src/components/awards/shared/AwardsSecondaryButton";
import { AwardsVoteBarContent } from "../../../../packages/ui/src/components/awards/shared/AwardsVoteBarContent";
import { DailyKeywordsHint } from "../../../../packages/ui/src/components/daily/hint/DailyKeywordsHint";
import { EventCardButton } from "../../../../packages/ui/src/components/events/view/EventCardParts";
import { RecapGoalCard } from "../../../../packages/ui/src/components/recap/goal/RecapGoalCard";
import { RecapBacklogSection } from "../../../../packages/ui/src/components/recap/year/RecapBacklogSection";
import { RecapCalendarSection } from "../../../../packages/ui/src/components/recap/year/RecapCalendarSection";
import { RecapCommunitySection } from "../../../../packages/ui/src/components/recap/year/RecapCommunitySection";
import { RecapFooter } from "../../../../packages/ui/src/components/recap/year/RecapFooter";
import { RecapGenresPlatformsSection } from "../../../../packages/ui/src/components/recap/year/RecapGenresPlatformsSection";
import { RecapHero } from "../../../../packages/ui/src/components/recap/year/RecapHero";
import { RecapTopGamesSection } from "../../../../packages/ui/src/components/recap/year/RecapTopGamesSection";
import { SettingsButton } from "../../../../packages/ui/src/components/settings/common/SettingsButton";
import { SupporterSettingsBanner } from "../../../../packages/ui/src/components/supporter/settings/SupporterSettingsBanner";
import { UIProvider } from "../../../../packages/ui/src/context/UIProvider";
import { THEME_CATALOG } from "../../../../packages/ui/src/theme/generated/catalog";
import { DEFAULT_MANTINE_THEME } from "../../../../packages/ui/src/util/theme";
import {
  buildDailyPlaytime,
  buildGame,
  buildPlatform,
  buildPlayedGame,
  buildTopGame,
  buildYearRecap,
  RECAP_YEAR,
} from "../components/recap/year-recap-fixture";

/**
 * Rendered contrast guard for EVERY light theme in the generated catalog.
 *
 * `theme-contrast-catalog.test.ts` proves the token pairs the theme promises;
 * this file proves the components keep them. It renders the shared screens
 * that broke on the beige Ruins theme (Recap, Settings, Supporter, Events,
 * Awards, Daily) under each `colorScheme: "light"` theme and asserts, per
 * rendered tree:
 *
 *  a. no element uses a hard-coded Tailwind color (`text-[#…]`, `text-white`,
 *     `bg-black`, `text-gray-*`, `bg-zinc-*`, `bg-neutral-*`, …);
 *  b. no element paints a raw (untokenised) inline `color`, background or SVG
 *     `<text fill>` — only `var(--gn-…)`, `var(--mantine-…)`, `color-mix(…)`
 *     of those, or the transparent/currentColor/inherit keywords;
 *  c. every resolvable inline foreground (`color`, `--button-color`, SVG
 *     `<text fill>`) clears WCAG AA (4.5:1) against its effective surface
 *     (`--button-bg`, inline background, or the nearest `bg-*` token, falling
 *     back to `--gn-background`).
 *
 * A new light theme in `THEME_CATALOG` is covered without touching this file:
 * its tokens are read from the generated `themes.css` at run time.
 *
 * jsdom parity: `cssstyle` drops valid values it cannot parse (`var(--x)`,
 * `color-mix(…)`) while a browser keeps them. `keepCustomColorProperties`
 * below restores that browser behaviour so the audit reads what the component
 * really declares, instead of silently seeing nothing.
 */

const AA = 4.5;
/** UI components (dots, icons) only need WCAG 1.4.11. */
const UI = 3;

/**
 * Repository file lookup that works from `apps/mobile` (pnpm/turbo) and from
 * any directory. Vite rewrites `import.meta.url` to a `/@fs/` URL in jsdom, so
 * strip that prefix before walking up to the repo root.
 */
function findRepoFile(relativePath: string): string {
  let directory = dirname(
    decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/@fs/, ""),
  );

  for (let depth = 0; depth < 10; depth += 1) {
    const candidate = join(directory, relativePath);
    if (existsSync(candidate)) return candidate;

    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  throw new Error(`Cannot find ${relativePath} from ${import.meta.url}`);
}

const themesCss = readFileSync(
  findRepoFile("packages/ui/src/theme/generated/themes.css"),
  "utf8",
);

/* ------------------------------------------------------------------- themes */

interface ThemeEntry {
  id: string;
  colorScheme: "dark" | "light";
}

const LIGHT_THEMES = (THEME_CATALOG as readonly ThemeEntry[]).filter(
  (theme) => theme.colorScheme === "light",
);

/** `--gn-*` (and Mantine's aliases) for one theme, from the generated CSS. */
type ThemeTokens = ReadonlyMap<string, string>;

function cssBlock(selector: string): string {
  const start = themesCss.indexOf(selector);
  if (start === -1) {
    throw new Error(`themes.css has no generated block for \`${selector}\``);
  }
  return themesCss.slice(start, themesCss.indexOf("\n}", start));
}

/** The `:root[data-theme]` block plus its `[data-gn-scope]` twin. */
function readThemeTokens(themeId: string): ThemeTokens {
  const tokens = new Map<string, string>();
  for (const selector of [
    `:root[data-theme="${themeId}"] {`,
    `[data-gn-scope="${themeId}"] {`,
  ]) {
    for (const match of cssBlock(selector).matchAll(
      /(--[\w-]+)\s*:\s*([^;]+);/g,
    )) {
      tokens.set(match[1]!, match[2]!.trim());
    }
  }
  return tokens;
}

const THEME_TOKENS = new Map(
  LIGHT_THEMES.map((theme) => [theme.id, readThemeTokens(theme.id)]),
);

/** Mantine's own `:root` base variables, which are not theme tokens. */
const MANTINE_BASE_TOKENS: ThemeTokens = new Map([
  ["--mantine-color-white", "#FFFFFF"],
  ["--mantine-color-black", "#000000"],
]);

/* ------------------------------------------------------------------ colors */

interface Rgba {
  /** 0–255 */
  r: number;
  g: number;
  b: number;
  /** 0–1 */
  a: number;
}

const COLOR_KEYWORDS: Readonly<Record<string, Rgba>> = {
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
};

/** Values that carry "whatever is inherited" instead of a color. */
const INHERITED_KEYWORDS = new Set([
  "currentcolor",
  "inherit",
  "unset",
  "initial",
  "revert",
  "none",
]);

function parseHex(value: string): Rgba | null {
  const match = /^#([0-9a-fA-F]{3,8})$/.exec(value);
  if (!match) return null;

  const hex = match[1]!;
  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b, a] = [...hex].map((digit) =>
      Number.parseInt(digit + digit, 16),
    );
    return { r: r!, g: g!, b: b!, a: a === undefined ? 1 : a / 255 };
  }

  if (hex.length !== 6 && hex.length !== 8) return null;

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function parseFunctionColor(value: string): Rgba | null {
  const match = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (!match) return null;

  const parts = match[1]!.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const channel = (raw: string) =>
    raw.endsWith("%")
      ? Math.round(Number.parseFloat(raw) * 2.55)
      : Number.parseFloat(raw);
  const alpha = (raw: string) =>
    raw.endsWith("%") ? Number.parseFloat(raw) / 100 : Number.parseFloat(raw);

  const [r, g, b] = [
    channel(parts[0]!),
    channel(parts[1]!),
    channel(parts[2]!),
  ];
  const a = parts[3] === undefined ? 1 : alpha(parts[3]);

  if (![r, g, b, a].every((channel) => Number.isFinite(channel))) return null;
  return { r, g, b, a };
}

/** Splits on commas that are not inside a nested function call. */
function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const character of value) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;

    if (character === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  parts.push(current);
  return parts;
}

function parseMixOperand(raw: string): {
  color: string;
  percent: number | null;
} {
  const value = raw.trim();
  const match = /^(.*?)\s+([\d.]+)%$/.exec(value);

  if (!match) return { color: value, percent: null };
  return { color: match[1]!.trim(), percent: Number.parseFloat(match[2]!) };
}

/**
 * Resolves one CSS color value of the theme: hex, `rgb()`, `var(--…)` chains
 * and `color-mix(in srgb, …)` tints. Returns `null` for inherited keywords.
 * Throws on a value the theme cannot produce, so a typo fails loudly instead of
 * being skipped.
 */
function resolveColor(value: string, themeId: string, depth = 0): Rgba | null {
  if (depth > 16) throw new Error(`Circular CSS variable at ${value}`);

  const raw = value.trim();
  const lower = raw.toLowerCase();

  if (INHERITED_KEYWORDS.has(lower)) return null;
  if (COLOR_KEYWORDS[lower]) return COLOR_KEYWORDS[lower]!;

  const hex = parseHex(raw);
  if (hex) return hex;

  const rgb = parseFunctionColor(raw);
  if (rgb) return rgb;

  const variable = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(raw);
  if (variable) {
    const name = variable[1]!;
    const tokens = THEME_TOKENS.get(themeId);
    if (!tokens) throw new Error(`No tokens for theme ${themeId}`);

    const tokenValue = tokens.get(name) ?? MANTINE_BASE_TOKENS.get(name);
    if (tokenValue === undefined) {
      if (variable[2]) return resolveColor(variable[2], themeId, depth + 1);
      throw new Error(`No \`${name}\` in the generated ${themeId} theme`);
    }

    return resolveColor(tokenValue, themeId, depth + 1);
  }

  if (lower.startsWith("color-mix(")) {
    const inner = raw.slice("color-mix(".length, -1);
    const parts = splitTopLevel(inner);

    if (parts.length !== 3 || parts[0]!.trim().toLowerCase() !== "in srgb") {
      throw new Error(`Unsupported color-mix: ${value}`);
    }

    const first = parseMixOperand(parts[1]!);
    const second = parseMixOperand(parts[2]!);
    const firstPercent =
      first.percent ?? (second.percent !== null ? 100 - second.percent : 50);
    const secondPercent =
      second.percent ?? (first.percent !== null ? 100 - first.percent : 50);

    const top = resolveColor(first.color, themeId, depth + 1);
    const bottom = resolveColor(second.color, themeId, depth + 1);
    const topAlpha = (top?.a ?? 0) * (firstPercent / 100);
    const bottomAlpha = (bottom?.a ?? 0) * (secondPercent / 100);
    const alpha = topAlpha + bottomAlpha;

    if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };

    return {
      r: Math.round(
        ((top?.r ?? 0) * topAlpha + (bottom?.r ?? 0) * bottomAlpha) / alpha,
      ),
      g: Math.round(
        ((top?.g ?? 0) * topAlpha + (bottom?.g ?? 0) * bottomAlpha) / alpha,
      ),
      b: Math.round(
        ((top?.b ?? 0) * topAlpha + (bottom?.b ?? 0) * bottomAlpha) / alpha,
      ),
      a: alpha,
    };
  }

  throw new Error(`Unsupported color value: ${JSON.stringify(value)}`);
}

/** `top` painted over `bottom` (source-over). */
function paintOver(top: Rgba, bottom: Rgba): Rgba {
  const alpha = top.a + bottom.a * (1 - top.a);
  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };

  return {
    r: Math.round((top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / alpha),
    g: Math.round((top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / alpha),
    b: Math.round((top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / alpha),
    a: alpha,
  };
}

function luminance({ r, g, b }: Rgba): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** WCAG 2.x contrast ratio; a translucent foreground is flattened first. */
function contrastRatio(foreground: Rgba, background: Rgba): number {
  const solid =
    foreground.a < 1 ? paintOver(foreground, background) : foreground;
  const [a, b] = [luminance(solid), luminance(background)];

  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function toHex({ r, g, b }: Rgba): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

/* -------------------------------------------------------------- DOM reading */

const COLOR_PROPERTY =
  /^(?:color|background|background-color|border(?:-[a-z]+)?-color|fill|stroke|outline-color|text-decoration-color|caret-color|--(?:button|badge)-(?:color|bg|hover-color))$/;

/** Properties that paint the surface behind an element. */
const BACKGROUND_PROPERTIES = [
  "background-color",
  "backgroundColor",
  "background",
] as const;

const TEXT_PROPERTIES = ["color"] as const;

function isElement(node: Element): node is HTMLElement | SVGElement {
  return "style" in node && !!(node as HTMLElement).style;
}

/** Inline value of the first declared property of `names`. */
function inlineValue(
  element: Element,
  names: readonly string[],
): string | undefined {
  if (!isElement(element)) return undefined;

  for (const name of names) {
    const value = element.style.getPropertyValue(name).trim();
    if (value) return value;
  }

  return undefined;
}

interface StyleEntry {
  property: string;
  value: string;
}

/** Every inline declaration, with camelCase aliases normalised to kebab. */
function inlineDeclarations(element: Element): StyleEntry[] {
  if (!isElement(element)) return [];

  const style = element.style as unknown as ArrayLike<string>;

  return Array.from(style).map((property) => ({
    property: property.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`,
    ),
    value: element.style.getPropertyValue(property).trim(),
  }));
}

/* -------------------------------------------------------------- surface map */

/** Tailwind background utilities that paint a theme surface. */
const SURFACE_CLASS_TOKENS: Readonly<Record<string, string>> = {
  "bg-background": "--gn-background",
  "bg-surface": "--gn-surface",
  "bg-paper-0": "--gn-paper-0",
  "bg-paper-1": "--gn-paper-1",
  "bg-paper-2": "--gn-paper-2",
  "bg-paper-3": "--gn-paper-3",
  "bg-paper-4": "--gn-paper-4",
  "bg-paper-5": "--gn-paper-5",
  "bg-paper-6": "--gn-paper-6",
  "bg-paper-7": "--gn-paper-7",
  "bg-paper-8": "--gn-paper-8",
  "bg-panel": "--gn-panel",
  "bg-panel-deep": "--gn-panel-deep",
  "bg-panel-inset": "--gn-panel-inset",
  "bg-panel-raised": "--gn-panel-raised",
  "bg-panel-tint": "--gn-panel-tint",
  "bg-panel-floor": "--gn-panel-floor",
  "bg-panel-rail": "--gn-panel-rail",
  "bg-panel-board": "--gn-panel-board",
  "bg-brand": "--gn-brand",
  "bg-brand-0": "--gn-brand-0",
  "bg-brand-1": "--gn-brand-1",
  "bg-brand-2": "--gn-brand-2",
  "bg-brand-3": "--gn-brand-3",
  "bg-brand-4": "--gn-brand-4",
  "bg-brand-5": "--gn-brand-5",
  "bg-brand-6": "--gn-brand-6",
  "bg-brand-7": "--gn-brand-7",
  "bg-brand-8": "--gn-brand-8",
  "bg-brand-9": "--gn-brand-9",
  "bg-brand-tint": "--gn-brand-tint",
  "bg-state-played": "--gn-state-played",
  "bg-state-played-tint": "--gn-state-played-tint",
  "bg-status-danger-strong": "--gn-status-danger-strong",
  "bg-premium": "--gn-premium",
  "bg-line": "--gn-line",
  "bg-line-strong": "--gn-line-strong",
  "bg-muted": "--gn-text-muted",
  "bg-nav-raised": "--gn-nav-raised",
  "bg-nav-surface": "--gn-nav-surface",
  "bg-nav-canvas": "--gn-nav-canvas",
};

/** Mantine paints these when a Button has no `color`/`variant` prop. */
const MANTINE_BUTTON_CLASS = "mantine-Button-root";
const MANTINE_BUTTON_FALLBACK_BACKGROUND =
  "var(--mantine-primary-color-filled)";
const MANTINE_BUTTON_FALLBACK_COLOR = "var(--mantine-color-white)";

function isMantineButton(element: Element): boolean {
  return (element.getAttribute("class") ?? "")
    .split(/\s+/)
    .includes(MANTINE_BUTTON_CLASS);
}

/** Background value contributed by one class token (`bg-brand/15` tints). */
function surfaceFromClass(className: string | null): string | null {
  if (!className) return null;

  for (const raw of className.split(/\s+/)) {
    const utility = raw.split(":").at(-1)?.replace(/^!+/, "");
    if (!utility) continue;

    // Pinned-paper artwork (`bg-[#e9e3d4]`): the note itself is the surface
    // the artwork ink was chosen for. (a) still rejects unknown literals.
    const artwork = /^bg-\[(#[0-9a-fA-F]{3,8})\]$/.exec(utility);
    if (artwork && isArtworkColor(artwork[1]!)) return artwork[1]!;

    const match = /^(bg-[\w-]+)(?:\/(\d{1,3}))?$/.exec(utility);
    if (!match) continue;

    const token = SURFACE_CLASS_TOKENS[match[1]!];
    if (!token) continue;

    return match[2] === undefined
      ? `var(${token})`
      : `color-mix(in srgb, var(${token}) ${match[2]}%, transparent)`;
  }

  return null;
}

/**
 * Effective surface behind `element`: its own `--button-bg`/inline background
 * and then the nearest painted ancestor, composited onto `--gn-background`.
 * Translucent layers (`bg-brand/15`, `color-mix(…, transparent)`) stack.
 */
function effectiveSurface(element: Element, themeId: string): Rgba {
  const layers: Rgba[] = [];
  let node: Element | null = element;

  while (node && layers.length < 32) {
    const candidate =
      inlineValue(node, ["--button-bg"]) ??
      // `Button.module.css` falls back to the primary fill when the component
      // received neither `color` nor `variant` (Mantine then omits the var).
      (isMantineButton(node)
        ? MANTINE_BUTTON_FALLBACK_BACKGROUND
        : undefined) ??
      inlineValue(node, BACKGROUND_PROPERTIES) ??
      surfaceFromClass(node.getAttribute("class"));

    if (candidate && !/gradient|url\(/i.test(candidate)) {
      const color = resolveColor(candidate, themeId);
      if (color && color.a > 0) {
        layers.push(color);
        if (color.a >= 1) break;
      }
    }

    node = node.parentElement;
  }

  const page = resolveColor("var(--gn-background)", themeId);
  if (!page) throw new Error(`No page background in ${themeId}`);

  return layers
    .reverse()
    .reduce<Rgba>((surface, layer) => paintOver(layer, surface), page);
}

/* ------------------------------------------------------------------ findings */

type FindingKind = "class" | "inline" | "contrast";

interface Finding {
  kind: FindingKind;
  where: string;
  detail: string;
}

interface AuditResult {
  findings: Finding[];
  /** What was actually asserted, so the suite cannot pass vacuously. */
  checked: {
    buttonLabels: number;
    inlineColors: number;
    svgTexts: number;
  };
}

function describeElement(element: Element): string {
  const className = element.getAttribute("class") ?? "";
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();

  return `<${element.tagName.toLowerCase()}${
    className ? ` class="${className.slice(0, 90)}"` : ""
  }>${text ? ` ${JSON.stringify(text.slice(0, 40))}` : ""}`;
}

const SKIPPED_TAGS = new Set([
  "img",
  "picture",
  "video",
  "canvas",
  "iframe",
  "object",
  "svg",
  "defs",
  "lineargradient",
  "radialgradient",
  "path",
  "circle",
  "rect",
  "polyline",
  "line",
  "polygon",
  "g",
  "use",
]);

/** The audit skips artwork scopes, media and non-text SVG shapes. */
function isSkipped(element: Element): boolean {
  if (element.closest("[data-gn-scope]")) return true;
  if (SKIPPED_TAGS.has(element.tagName.toLowerCase())) return true;

  return false;
}

/** Hard-coded Tailwind color utilities that bypass the theme. */
const FORBIDDEN_CLASSES: ReadonlyArray<[string, RegExp]> = [
  ["raw arbitrary text color", /^text-\[(?:#|rgba?\(|hsla?\()/],
  ["raw arbitrary background color", /^bg-\[(?:#|rgba?\(|hsla?\()/],
  ["raw arbitrary border color", /^border-\[(?:#|rgba?\(|hsla?\()/],
  ["fixed white text", /^text-white$/],
  ["fixed black text", /^text-black$/],
  ["fixed black background", /^bg-black$/],
  [
    "fixed gray family text",
    /^text-(?:gray|zinc|neutral|slate|stone|red|green|blue)-\d{2,3}$/,
  ],
  [
    "fixed gray family background",
    /^bg-(?:gray|zinc|neutral|slate|stone|red|green|blue)-\d{2,3}$/,
  ],
  ["fixed black border", /^border-black$/],
  ["fixed white border", /^border-white$/],
];

/**
 * Pinned-paper clue notes of `DailyKeywordsHint` (`// theme-exempt` in the
 * component). They are artwork: the ink is printed on its own paper and never
 * meets a theme surface. The suite still proves that pair is readable; any
 * other literal is a regression and fails below.
 */
const ARTWORK_LITERALS: ReadonlyArray<[string, string, string]> = [
  ["note ink on note paper", "#e9e3d4", "#1a1714"],
  ["note caption on note paper", "#e9e3d4", "#6b6458"],
  ["new-clue ink on new-clue paper", "#f6d9c9", "#1a1714"],
  ["new-clue caption on new-clue paper", "#f6d9c9", "#a8381a"],
];

const ARTWORK_HEXES = new Set(
  ARTWORK_LITERALS.flatMap(([, paper, ink]) => [
    paper.toLowerCase(),
    ink.toLowerCase(),
  ]),
);

function isArtworkColor(value: string): boolean {
  const color = parseHex(value) ?? parseFunctionColor(value);
  if (!color) return false;

  return ARTWORK_HEXES.has(toHex(color).toLowerCase());
}

function classFindings(element: Element): Finding[] {
  const className = element.getAttribute("class");
  if (!className) return [];

  const findings: Finding[] = [];

  for (const raw of className.split(/\s+/)) {
    const utility = raw.split(":").at(-1)?.replace(/^!+/, "");
    if (!utility) continue;

    const match = FORBIDDEN_CLASSES.find(([, pattern]) =>
      pattern.test(utility),
    );
    if (!match) continue;

    const artwork = /^bg-\[(#[0-9a-fA-F]{3,8})\]$/.exec(utility);
    if (artwork && isArtworkColor(artwork[1]!)) continue;

    findings.push({
      kind: "class",
      where: describeElement(element),
      detail: `${match[0]}: \`${utility}\``,
    });
  }

  return findings;
}

/**
 * Splits a color value into its `var()`/`color-mix()` calls and the leftover
 * literal text, so "tokens only" is provable.
 */
function stripColorFunctions(value: string): string {
  let result = "";
  let index = 0;

  while (index < value.length) {
    const starts = ["var(", "color-mix("]
      .map((name) => ({ name, at: value.indexOf(name, index) }))
      .filter((entry) => entry.at !== -1)
      .sort((a, b) => a.at - b.at);

    const next = starts[0];
    if (!next) {
      result += value.slice(index);
      break;
    }

    result += value.slice(index, next.at);

    let depth = 1;
    let cursor = next.at + next.name.length;
    while (cursor < value.length && depth > 0) {
      if (value[cursor] === "(") depth += 1;
      if (value[cursor] === ")") depth -= 1;
      cursor += 1;
    }

    index = cursor;
  }

  return result;
}

const ALLOWED_COLOR_KEYWORDS = new Set([
  "transparent",
  "none",
  "currentcolor",
  "inherit",
  "unset",
  "initial",
]);

/** True when a color value only references theme tokens. */
function isTokenizedColor(value: string): boolean {
  const raw = value.trim();
  const lower = raw.toLowerCase();
  if (ALLOWED_COLOR_KEYWORDS.has(lower)) return true;

  const tokens = [...raw.matchAll(/var\(\s*(--[\w-]+)/g)].map(
    (match) => match[1]!,
  );
  if (tokens.length === 0) return false;

  if (
    !tokens.every(
      (token) => token.startsWith("--gn-") || token.startsWith("--mantine-"),
    )
  ) {
    return false;
  }

  const residue = stripColorFunctions(raw);

  return !/#|\brgba?\(|\bhsla?\(/i.test(residue);
}

function inlineFindings(element: Element): Finding[] {
  const findings: Finding[] = [];

  for (const { property, value } of inlineDeclarations(element)) {
    if (!COLOR_PROPERTY.test(property) || !value) continue;
    if (isTokenizedColor(value)) continue;
    if (isArtworkColor(value)) continue;

    findings.push({
      kind: "inline",
      where: describeElement(element),
      detail: `raw inline ${property}: ${value}`,
    });
  }

  return findings;
}

/* ------------------------------------------------------------------- audits */

interface PairResult {
  findings: Finding[];
  applied: boolean;
}

const NOT_APPLIED: PairResult = { findings: [], applied: false };

function buttonPairs(element: Element, themeId: string): PairResult {
  const color =
    inlineValue(element, ["--button-color"]) ??
    (isMantineButton(element) ? MANTINE_BUTTON_FALLBACK_COLOR : undefined);
  if (!color) return NOT_APPLIED;

  const background = effectiveSurface(element, themeId);
  const foreground = resolveColor(color, themeId);
  if (!foreground) return NOT_APPLIED;

  const ratio = contrastRatio(foreground, background);
  if (ratio >= AA) return { findings: [], applied: true };

  return {
    findings: [
      {
        kind: "contrast",
        where: describeElement(element),
        detail: `--button-color ${color} (${toHex(foreground)}) on ${toHex(
          background,
        )} is ${ratio.toFixed(2)}:1, below AA`,
      },
    ],
    applied: true,
  };
}

function inlineColorPair(element: Element, themeId: string): PairResult {
  const color = inlineValue(element, TEXT_PROPERTIES);
  if (!color) return NOT_APPLIED;

  const foreground = resolveColor(color, themeId);
  if (!foreground) return NOT_APPLIED;

  const background = effectiveSurface(element, themeId);
  const ratio = contrastRatio(foreground, background);
  if (ratio >= AA) return { findings: [], applied: true };

  return {
    findings: [
      {
        kind: "contrast",
        where: describeElement(element),
        detail: `color ${color} (${toHex(foreground)}) on ${toHex(
          background,
        )} is ${ratio.toFixed(2)}:1, below AA`,
      },
    ],
    applied: true,
  };
}

function svgTextPair(element: Element, themeId: string): PairResult {
  if (element.tagName.toLowerCase() !== "text") return NOT_APPLIED;

  const fill = element.getAttribute("fill");
  if (!fill || INHERITED_KEYWORDS.has(fill.trim().toLowerCase())) {
    return NOT_APPLIED;
  }

  const foreground = resolveColor(fill, themeId);
  if (!foreground) return NOT_APPLIED;

  const background = effectiveSurface(element, themeId);
  const ratio = contrastRatio(foreground, background);
  if (ratio >= AA) return { findings: [], applied: true };

  return {
    findings: [
      {
        kind: "contrast",
        where: describeElement(element),
        detail: `SVG fill ${fill} (${toHex(foreground)}) on ${toHex(
          background,
        )} is ${ratio.toFixed(2)}:1, below AA`,
      },
    ],
    applied: true,
  };
}

/** Runs (a), (b) and (c) over every element of a rendered tree. */
function auditTree(root: HTMLElement | Element, themeId: string): AuditResult {
  const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
  const findings: Finding[] = [];
  const checked = { buttonLabels: 0, inlineColors: 0, svgTexts: 0 };

  for (const element of elements) {
    if (isSkipped(element)) continue;

    findings.push(...classFindings(element));
    findings.push(...inlineFindings(element));

    const buttons = buttonPairs(element, themeId);
    if (buttons.applied) checked.buttonLabels += 1;
    findings.push(...buttons.findings);

    const colors = inlineColorPair(element, themeId);
    if (colors.applied) checked.inlineColors += 1;
    findings.push(...colors.findings);

    const svgTexts = svgTextPair(element, themeId);
    if (svgTexts.applied) checked.svgTexts += 1;
    findings.push(...svgTexts.findings);
  }

  return { findings, checked };
}

function expectCleanAudit(result: AuditResult, label: string): void {
  expect(
    result.findings.map(
      (finding) => `[${finding.kind}] ${finding.where} -> ${finding.detail}`,
    ),
    `${label}: ${result.findings.length} finding(s) on ${document.documentElement.getAttribute(
      "data-theme",
    )}`,
  ).toEqual([]);
}

/** Contrast of two theme-token pairs, for the explicit assertions in (d). */
function tokenContrast(
  foreground: string,
  background: string,
  themeId: string,
): number {
  const fg = resolveColor(foreground, themeId);
  const bg = resolveColor(background, themeId);
  if (!fg || !bg)
    throw new Error(`Cannot resolve ${foreground} / ${background}`);

  return contrastRatio(fg, bg);
}

/* -------------------------------------------------------------------- mocks */

const session = vi.hoisted(() => ({ userId: undefined as string | undefined }));

vi.mock("../../../../packages/ui/src/components/auth/hooks/useUserId", () => ({
  useUserId: () => session.userId,
}));

vi.mock("../../../../packages/ui/src/components/auth/authClient", () => ({
  authClient: {
    useSession: () => ({
      data: session.userId ? { user: { id: session.userId } } : null,
      isPending: false,
    }),
  },
}));

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

/* ----------------------------------------------------------------- providers */

const router = {
  pathname: `/recap/${RECAP_YEAR}/user-1`,
  asPath: `/recap/${RECAP_YEAR}/user-1`,
  back: () => {},
  push: async () => {},
  query: new URLSearchParams(),
};

/** Anchor stand-in for the app's router link. */
function TestLink({
  href,
  children,
  scroll,
  shallow,
  replace,
  absolute,
  ...props
}: {
  href: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  void scroll;
  void shallow;
  void replace;
  void absolute;

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

function Providers({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <I18nProvider language="pt-BR">
      <MantineProvider theme={DEFAULT_MANTINE_THEME}>
        <QueryClientProvider client={client}>
          <UIProvider
            presenters={{ Link: TestLink as never }}
            hooks={{ useRouter: () => router }}
          >
            {children}
          </UIProvider>
        </QueryClientProvider>
      </MantineProvider>
    </I18nProvider>
  );
}

/**
 * jsdom drops declared color values it cannot parse; a browser keeps them.
 * Keep `color: var(--gn-text)` and `background-color: color-mix(…)` verbatim so
 * the audit reads the component's real declarations. Restored in `afterAll`.
 */
const originalDescriptors = new Map<string, PropertyDescriptor | undefined>();

function keepCustomColorProperties(): void {
  const proto = CSSStyleDeclaration.prototype as CSSStyleDeclaration & {
    _setProperty?: (name: string, value: string, priority: string) => void;
  };
  const setRaw = proto._setProperty;
  if (!setRaw) return;

  for (const name of [
    "color",
    "background-color",
    "backgroundColor",
    "background",
    "border-color",
    "borderColor",
    "fill",
    "stroke",
    "outline-color",
    "caret-color",
  ]) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, name);
    if (!descriptor?.set) continue;

    originalDescriptors.set(name, descriptor);
    Object.defineProperty(proto, name, {
      configurable: true,
      enumerable: descriptor.enumerable,
      get(this: CSSStyleDeclaration) {
        return this.getPropertyValue(name);
      },
      set(this: CSSStyleDeclaration, value: string) {
        setRaw.call(this, name, String(value), "");
      },
    });
  }
}

/* ----------------------------------------------------------------- fixtures */

const PS5 = buildPlatform(167, "PlayStation 5", "PS5");
const XBOX = buildPlatform(169, "Xbox Series X", "XSX");

const RECAP = buildYearRecap({
  topGames: [
    buildTopGame({
      gameId: 1,
      platformIds: [167],
      share: 0.31,
      totalPlaytimeSeconds: 86 * 3_600,
      finishedAt: "2026-09-02",
      rating: 4.5,
    }),
    buildTopGame({
      gameId: 2,
      platformIds: [169],
      share: 0.18,
      totalPlaytimeSeconds: 49 * 3_600,
    }),
    buildTopGame({
      gameId: 3,
      share: 0.09,
      totalPlaytimeSeconds: 24 * 3_600,
    }),
  ],
  playedGames: [
    buildPlayedGame({ gameId: 1, platformId: 167, platform: PS5 }),
    buildPlayedGame({ gameId: 2, platformId: 169, platform: XBOX }),
  ],
  dailyPlaytimeSeconds: buildDailyPlaytime(RECAP_YEAR, {
    0: 7_200,
    40: 3_600,
    120: 5_400,
    200: 1_800,
    300: 9_000,
  }),
  calendar: {
    monthlyPlaytimeSeconds: Array.from({ length: 12 }, (_, index) =>
      index === 2 ? 71 * 3_600 : index === 8 ? 42 * 3_600 : 0,
    ),
    topMonth: { month: 3, playtimeSeconds: 71 * 3_600 },
    longestStreak: { start: "2026-03-01", end: "2026-03-23", days: 23 },
    topWeekday: { weekday: 6, share: 0.18 },
    weekendShare: 0.31,
  },
  communityHighlights: {
    minority: {
      gameId: 1,
      userRating: 2.25,
      communityAverage: 4.1,
      reviewCount: 1_204,
      beyondShare: 0.12,
      sameRangeCount: 500,
    },
    inTune: {
      gameId: 2,
      userRating: 4.75,
      communityAverage: 4.65,
      reviewCount: 2_008,
      beyondShare: 0.4,
      sameRangeCount: 2_140,
    },
  },
  distributionByGenre: [
    { criteriaId: 1, criteriaName: "RPG", count: 24, finishedCount: 9 },
    { criteriaId: 2, criteriaName: "Adventure", count: 18, finishedCount: 4 },
    { criteriaId: 3, criteriaName: "Indie", count: 9, finishedCount: 2 },
    { criteriaId: 4, criteriaName: "Shooter", count: 5, finishedCount: 1 },
    { criteriaId: 5, criteriaName: "Puzzle", count: 3, finishedCount: 0 },
    { criteriaId: 6, criteriaName: "Platform", count: 2, finishedCount: 0 },
  ],
  distributionByMode: [
    {
      criteriaId: 1,
      criteriaName: "Single player",
      count: 40,
      finishedCount: 12,
    },
    { criteriaId: 2, criteriaName: "Multiplayer", count: 16, finishedCount: 2 },
  ],
  distributionByTheme: [
    { criteriaId: 1, criteriaName: "Fantasy", count: 21, finishedCount: 6 },
    { criteriaId: 2, criteriaName: "Open world", count: 14, finishedCount: 3 },
  ],
  distributionByPlatform: [
    {
      criteriaId: 1,
      criteriaName: "PlayStation 5",
      count: 22,
      finishedCount: 8,
    },
    {
      criteriaId: 2,
      criteriaName: "Xbox Series X",
      count: 15,
      finishedCount: 3,
    },
  ],
  playtimeByPlatform: [
    { platform: 167, totalPlaytimeSeconds: 86 * 3_600, share: 0.62 },
    { platform: 169, totalPlaytimeSeconds: 52 * 3_600, share: 0.38 },
  ],
  totalAddedGames: 52,
  totalFinishedGames: 14,
  totalDroppedGames: 6,
  backlogGrowth: 7,
});

const CHART_GAMES = [
  buildGame(1, "Nioh 3"),
  buildGame(2, "Marathon"),
  buildGame(3, "Silksong"),
];

const AWARDS_DATES = {
  year: RECAP_YEAR,
  phase: "voting",
  categoriesCount: 12,
  nominationStartDate: "2026-11-10T00:00:00.000Z",
  nominationEndDate: "2026-11-28T23:59:59.000Z",
  votingStartDate: "2026-12-01T00:00:00.000Z",
  votingEndDate: "2026-12-20T23:59:59.000Z",
  resultsDate: "2026-12-27T00:00:00.000Z",
} as const;

function renderThemed(node: ReactElement) {
  return render(<Providers>{node}</Providers>);
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  session.userId = undefined;

  vi.spyOn(
    GameRepositoryService,
    "gameRepositoryControllerFindAllByIdsV1",
  ).mockResolvedValue(CHART_GAMES);
  vi.spyOn(ProfileService, "profileControllerFindOneByIdV1").mockResolvedValue({
    username: "marina",
  } as never);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
});

keepCustomColorProperties();

afterAll(() => {
  const proto = CSSStyleDeclaration.prototype;

  for (const [name, descriptor] of originalDescriptors) {
    if (descriptor) {
      Object.defineProperty(proto, name, descriptor);
    } else {
      delete (proto as unknown as Record<string, unknown>)[name];
    }
  }

  originalDescriptors.clear();
});

/* -------------------------------------------------------------------- specs */

describe("light theme coverage", () => {
  it("reads the generated CSS for every light theme in the catalog", () => {
    expect(LIGHT_THEMES.length).toBeGreaterThan(0);
    // The beige theme that exposed the bugs must never be skipped silently.
    expect(LIGHT_THEMES.map((theme) => theme.id)).toContain("ruins");

    for (const theme of LIGHT_THEMES) {
      const tokens = THEME_TOKENS.get(theme.id);
      expect(tokens?.get("--gn-background"), theme.id).toMatch(
        /^#[0-9a-f]{6}$/i,
      );
      expect(tokens?.get("--gn-brand-filled-text"), theme.id).toMatch(
        /^#[0-9a-f]{6}$/i,
      );
    }
  });

  it("keeps the pinned-paper clue notes readable", () => {
    for (const [label, paper, ink] of ARTWORK_LITERALS) {
      const paperColor = resolveColor(paper, "ruins");
      const inkColor = resolveColor(ink, "ruins");
      expect(paperColor && inkColor, label).toBeTruthy();

      expect(
        contrastRatio(inkColor!, paperColor!),
        `${label} (${ink} on ${paper})`,
      ).toBeGreaterThanOrEqual(AA);
    }

    // The square marker of the note is decoration, not text (WCAG 1.4.11).
    expect(
      contrastRatio(
        resolveColor("#6b6458", "ruins")!,
        resolveColor("#e9e3d4", "ruins")!,
      ),
      "note marker on note paper",
    ).toBeGreaterThanOrEqual(UI);
  });
});

describe.each(LIGHT_THEMES.map((theme) => theme.id))(
  "rendered light-theme contrast: %s",
  (themeId) => {
    beforeEach(() => {
      document.documentElement.setAttribute("data-theme", themeId);
    });

    it("renders the Recap year sections with themed colors only", async () => {
      const { container } = renderThemed(
        <div>
          <RecapHero year={RECAP_YEAR} recap={RECAP} phase={"closed"} />
          <RecapTopGamesSection year={RECAP_YEAR} recap={RECAP} />
          <RecapCalendarSection year={RECAP_YEAR} recap={RECAP} />
          <RecapCommunitySection recap={RECAP} />
          <RecapGenresPlatformsSection recap={RECAP} />
          <RecapBacklogSection
            year={RECAP_YEAR}
            recap={RECAP}
            userId={"user-1"}
          />
          <RecapFooter year={RECAP_YEAR} recap={RECAP} userId={"user-1"} />
        </div>,
      );

      await waitFor(() =>
        expect(
          container.querySelector('[data-testid="recap-hero"]'),
        ).not.toBeNull(),
      );

      const audit = auditTree(container, themeId);
      // Coverage proof: the hero buttons and the platform percentages.
      expect(audit.checked.buttonLabels).toBeGreaterThanOrEqual(2);
      expect(audit.checked.inlineColors).toBeGreaterThanOrEqual(2);
      expectCleanAudit(audit, "Recap year sections");
    });

    it("renders the interactive chrome with themed colors only", async () => {
      const { container } = renderThemed(
        <div>
          {(
            [
              "primary",
              "secondary",
              "ghost",
              "danger",
              "dangerOutline",
            ] as const
          ).map((variant) => (
            <div key={variant} data-testid={`settings-${variant}`}>
              <SettingsButton variant={variant}>Save</SettingsButton>
            </div>
          ))}
          {(["success", "pending", "cancel", "error"] as const).map((tone) => (
            <SupporterSettingsBanner key={tone} tone={tone} />
          ))}
          <div>
            <EventCardButton tone={"primary"}>Participar</EventCardButton>
            <EventCardButton tone={"secondary"}>Ver evento</EventCardButton>
          </div>
          <AwardsSecondaryButton>Compartilhar</AwardsSecondaryButton>
          <AwardsVoteBarContent
            caption={"Seu voto em Jogo do Ano"}
            game={CHART_GAMES[0]}
            gameName={"Nioh 3"}
            skipLabel={"Pular"}
            confirmLabel={"Confirmar"}
            onSkip={() => {}}
            onConfirm={() => {}}
          />
          <AwardsVoteBarContent
            compact
            caption={"Seu voto em Jogo do Ano"}
            gameName={"Nioh 3"}
            skipLabel={"Pular"}
            confirmLabel={"Confirmar"}
            onSkip={() => {}}
            onConfirm={() => {}}
          />
          <AwardsEventBand {...AWARDS_DATES} />
          <DailyKeywordsHint
            keywords={["floresta", "sombra", "espada"]}
            imageTokens={[]}
            attempts={1}
            maxAttempts={5}
          />
        </div>,
      );

      await waitFor(() =>
        expect(container.querySelectorAll("button").length).toBeGreaterThan(5),
      );

      const audit = auditTree(container, themeId);
      // 5 SettingsButton variants + 2 EventCardButton + AwardsSecondaryButton
      // + 2 AwardsVoteBarContent confirms.
      expect(audit.checked.buttonLabels).toBeGreaterThanOrEqual(9);
      // The clue-note ink (artwork) is still resolved, not skipped.
      expect(audit.checked.inlineColors).toBeGreaterThanOrEqual(3);
      expectCleanAudit(audit, "Interactive chrome");
    });

    it("keeps the Recap goal card readable for its owner", async () => {
      session.userId = "user-1";
      const recapYear = new Date().getUTCFullYear() - 1;
      vi.spyOn(RecapService, "recapControllerGetGoalV1").mockResolvedValue({
        year: recapYear + 1,
        target: 20,
        finished: 12,
      });

      const { container } = renderThemed(
        <RecapGoalCard year={recapYear} userId={"user-1"} finishedGames={12} />,
      );

      await waitFor(() =>
        expect(
          container.querySelector('input[role="textbox"], input'),
        ).not.toBeNull(),
      );

      const audit = auditTree(container, themeId);
      // The Save button's label against its fill.
      expect(audit.checked.buttonLabels).toBeGreaterThanOrEqual(1);
      expectCleanAudit(audit, "Recap goal card");
    });

    it("keeps the chart, platform, button and awards text at AA", async () => {
      const { container } = renderThemed(
        <div>
          <RecapHero year={RECAP_YEAR} recap={RECAP} phase={"closed"} />
          <RecapGenresPlatformsSection recap={RECAP} />
          <div data-testid="settings-primary">
            <SettingsButton variant={"primary"}>Save</SettingsButton>
          </div>
          <div data-testid="settings-danger">
            <SettingsButton variant={"danger"}>Excluir</SettingsButton>
          </div>
          <div data-testid="event-primary">
            <EventCardButton tone={"primary"}>Participar</EventCardButton>
          </div>
          <div data-testid="awards-vote">
            <AwardsVoteBarContent
              caption={"Seu voto em Jogo do Ano"}
              gameName={"Nioh 3"}
              skipLabel={"Pular"}
              confirmLabel={"Confirmar"}
              onSkip={() => {}}
              onConfirm={() => {}}
            />
          </div>
        </div>,
      );

      await waitFor(() =>
        expect(
          container.querySelector('[data-testid="recap-hero-chart"]'),
        ).not.toBeNull(),
      );

      const audit = auditTree(container, themeId);
      // 12 month labels (+ the "today" marker when live).
      expect(audit.checked.svgTexts).toBeGreaterThanOrEqual(12);
      expectCleanAudit(audit, "Chart and card actions");

      // (d1) The SVG month labels and the "today" marker of the node chart.
      const chartLabels = Array.from(
        container.querySelectorAll('[data-testid="recap-hero-chart"] svg text'),
      );
      expect(chartLabels.length).toBeGreaterThan(0);

      for (const label of chartLabels) {
        const fill = label.getAttribute("fill");
        expect(fill, "chart text must not inherit its color").toBeTruthy();
        const color = resolveColor(fill!, themeId);
        expect(color, `chart fill ${fill}`).toBeTruthy();
        expect(
          contrastRatio(color!, resolveColor("var(--gn-background)", themeId)!),
          `chart text ${fill} on the page background`,
        ).toBeGreaterThanOrEqual(AA);
      }

      // (d2) The platform percentages are inline-colored on the paper card.
      const platformPercentages = Array.from(
        container.querySelectorAll(
          '[data-testid="recap-platforms"] li > span:first-child',
        ),
      );
      expect(platformPercentages.length).toBeGreaterThan(0);

      for (const percentage of platformPercentages) {
        const color = inlineValue(percentage, TEXT_PROPERTIES);
        expect(color, "platform percentage must carry its color").toBeTruthy();
        const foreground = resolveColor(color!, themeId);
        expect(foreground, `platform color ${color}`).toBeTruthy();
        expect(
          contrastRatio(
            foreground!,
            resolveColor("var(--gn-paper-0)", themeId)!,
          ),
          `platform percentage ${color} on --gn-paper-0`,
        ).toBeGreaterThanOrEqual(AA);
      }

      // (d3) SettingsButton primary/danger label against their own fill.
      for (const [testId, variant] of [
        ["settings-primary", "primary"],
        ["settings-danger", "danger"],
      ] as const) {
        const button = container.querySelector(
          `[data-testid="${testId}"] button`,
        );
        expect(button, variant).not.toBeNull();

        const color = inlineValue(button!, ["--button-color"]);
        const background = inlineValue(button!, ["--button-bg"]);
        expect(color, `${variant} --button-color`).toBeTruthy();
        expect(background, `${variant} --button-bg`).toBeTruthy();

        expect(
          contrastRatio(
            resolveColor(color!, themeId)!,
            resolveColor(background!, themeId)!,
          ),
          `${variant} --button-color on --button-bg`,
        ).toBeGreaterThanOrEqual(AA);
      }

      // (d4) EventCardButton primary: brand fill with its filled-text token.
      const eventButton = container.querySelector(
        '[data-testid="event-primary"] button',
      );
      expect(eventButton).not.toBeNull();
      expect(
        contrastRatio(
          resolveColor(
            inlineValue(eventButton!, ["--button-color"])!,
            themeId,
          )!,
          resolveColor("var(--gn-brand)", themeId)!,
        ),
        "EventCardButton primary --button-color on --gn-brand",
      ).toBeGreaterThanOrEqual(AA);

      // (d5) AwardsVoteBarContent confirm: brand fill as well.
      const confirm = container.querySelector("[data-awards-vote-confirm]");
      expect(confirm).not.toBeNull();
      expect(
        contrastRatio(
          resolveColor(inlineValue(confirm!, ["--button-color"])!, themeId)!,
          resolveColor("var(--gn-brand)", themeId)!,
        ),
        "AwardsVoteBarContent confirm --button-color on --gn-brand",
      ).toBeGreaterThanOrEqual(AA);
    });

    it("keeps every checked token pair at AA in the generated CSS", () => {
      // Safety net for the surface fallback: the page background used when no
      // card class paints the element must itself carry body text.
      expect(
        tokenContrast("var(--gn-text)", "var(--gn-background)", themeId),
      ).toBeGreaterThanOrEqual(AA);
      expect(
        tokenContrast("var(--gn-text-muted)", "var(--gn-background)", themeId),
      ).toBeGreaterThanOrEqual(AA);
    });
  },
);
