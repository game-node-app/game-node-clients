/**
 * Theme definitions are the source of truth for every app surface.
 *
 * A definition only contains semantic tokens plus an optional set of pinned
 * values (`overrides`). `pnpm themes:generate` derives the full scales and the
 * Mantine, Ionic and Tailwind variables from it. Adding a palette-only theme
 * must not require changes to the generator: add a definition, register it in
 * `theme/definitions.ts` and regenerate.
 */

export type ThemeColorScheme = "dark" | "light";

/** Experience ids are layout packs, resolved by the experience layer. */
export type ThemeExperienceOption = "default" | "console";

export const THEME_TOKEN_KEYS = [
  "background",
  "surface",
  "text",
  "textMuted",
  "border",
  "accent",
  "accentContrast",
  "focus",
  "success",
  "warning",
  "danger",
] as const;

export type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];

/** Semantic colors every theme must define. */
export type ThemeTokens = Record<ThemeTokenKey, string>;

export type ThemeScaleStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type ThemePaperStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ThemeScaleOverrides = Partial<Record<ThemeScaleStep, string>>;

export type ThemePaperOverrides = Partial<Record<ThemePaperStep, string>>;

export const THEME_IONIC_COLOR_NAMES = [
  "primary",
  "secondary",
  "tertiary",
  "success",
  "warning",
  "danger",
  "light",
  "medium",
  "dark",
] as const;

export type ThemeIonicColorName = (typeof THEME_IONIC_COLOR_NAMES)[number];

/** Ionic's four variables per named color; `-rgb` variants are derived. */
export type ThemeIonicColorSet = {
  base: string;
  contrast: string;
  shade: string;
  tint: string;
};

export type ThemeIonicColorOverride = Partial<ThemeIonicColorSet>;

export type ThemeIonicSurfaceKey =
  | "background"
  | "text"
  | "toolbarBackground"
  | "tabBarBackground"
  | "itemBackground"
  | "cardBackground"
  | "modalBackground";

export type ThemeIonicSurfaces = Record<ThemeIonicSurfaceKey, string>;

/**
 * Pinned values. `gamenode` pins every value that existed before the token
 * system so its output is byte-for-byte the previous palette. New themes only
 * need the semantic tokens and let the generator derive the rest.
 */
export type ThemeOverrides = {
  /** Tailwind/Mantine brand ramp (`brand-0` … `brand-9`). */
  brand?: ThemeScaleOverrides;
  /** Tailwind paper ramp (`paper-0` … `paper-8`). */
  paper?: ThemePaperOverrides;
  /** Mantine dark ramp (`dark-0` … `dark-9`). */
  dark?: ThemeScaleOverrides;
  secondary?: string;
  tertiary?: string;
  /** Selected/"your vote" surface (Awards design `brand/tint`). */
  brandTint?: string;
  line?: {
    default?: string;
    strong?: string;
  };
  dimmed?: {
    default?: string;
    1?: string;
    /** Secondary text (settings bodies); defaults to a brighter muted tone. */
    2?: string;
    /** Tertiary text (hints, placeholders); defaults to a dimmer muted tone. */
    3?: string;
  };
  /** Premium/supporter accent (settings highlight); defaults to the accent ramp. */
  premium?: {
    base?: string;
    text?: string;
    soft?: string;
    bright?: string;
  };
  /** Color used by the dashboard charts (radar/bar series). */
  chart?: {
    primary?: string;
  };
  /** User-level label and progress outline. */
  level?: {
    text?: string;
    border?: string;
  };
  /** Readable status text and strong danger outlines. */
  status?: {
    successText?: string;
    warningText?: string;
    dangerStrong?: string;
    dangerText?: string;
  };
  nav?: {
    canvas?: string;
    surface?: string;
    raised?: string;
    border?: string;
    text?: string;
    muted?: string;
    danger?: string;
    accentSubtle?: string;
  };
  /** Tailwind's base `textColor` (it intentionally differs from `tokens.text`). */
  textColor?: string;
  /** Near-text emphasis for menu labels and icons (`text-emphasis`). */
  textEmphasis?: string;
  /** Tinted text on subtle accent backgrounds. */
  accentText?: string;
  /** Backdrop tint used with opacity over content and artwork. */
  scrim?: string;
  mobile?: {
    buttonBorder?: string;
    tabText?: string;
    menuCanvas?: string;
    menuDanger?: string;
    splashBackground?: string;
    systemBarBackground?: string;
  };
  state?: {
    played?: string;
    playedTint?: string;
  };
  mantine?: {
    fontFamily?: string;
    fontFamilyHeadings?: string;
    body?: string;
    text?: string;
    dimmed?: string;
    radius?: string;
  };
  ionic?: {
    colors?: Partial<Record<ThemeIonicColorName, ThemeIonicColorOverride>>;
    surfaces?: Partial<ThemeIonicSurfaces>;
  };
};

export type ThemeDefinitionInput = {
  /** Stable id used by `data-theme`, storage and the catalog. */
  id: string;
  /** Translation key for the theme label, resolved by the app. */
  labelKey: string;
  colorScheme: ThemeColorScheme;
  tokens: ThemeTokens;
  /** CSS radius applied to Mantine's default radius and `--gn-radius`. */
  radius: string;
  /** CSS font-family list. Segoe UI, for example, is a system stack, never bundled. */
  font: string;
  /** Layout pack; defaults to `"default"` when omitted. */
  experience?: ThemeExperienceOption;
  /** Theme-specific screen pack id (e.g. `"xbox"`); resolved by later layers. */
  screens?: string;
  overrides?: ThemeOverrides;
};

export type ThemeDefinition = ThemeDefinitionInput;

/**
 * Identity helper that keeps the definition literal types and gives editors
 * the schema. Missing tokens and unknown override keys fail `tsc`.
 */
export function defineTheme<T extends ThemeDefinitionInput>(definition: T): T {
  return definition;
}
