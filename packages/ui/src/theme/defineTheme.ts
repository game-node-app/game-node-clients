/**
 * Theme definitions are the source of truth for every app surface.
 *
 * Surfaces come in pairs: a fill and the text that sits on it (`panel` +
 * `text-*` tones for app chrome, `media` + `text-media*` for imagery). Never
 * combine a fixed surface with the theme text color, or the reverse.
 *
 * Intentionally dark artwork (marketing pages, recap stories) does not hard-code
 * dark colors. It renders inside a theme scope: the generator emits
 * `[data-gn-scope="<theme id>"]` (plus the `dark` alias for the default dark
 * theme) with the full variable set of that theme, and `ThemeScope` applies it
 * to a subtree so tokens, Mantine and Tailwind classes resolve to that theme
 * whatever theme the app is using.
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
  /**
   * Grey text tones used by app chrome (`text-subtle`, `c="var(--gn-text-subtle)"`).
   * Dark themes pin the exact greys components used to hard-code; light themes
   * pin readable dark tones. Defaults are muted-text derived, which stays
   * readable on any palette.
   */
  textTones?: {
    /** Near-text emphasis (`#e6e6e6` on dark). */
    pale?: string;
    /** Body copy a notch under `pale` (`#d9d9d9` on dark). */
    chalk?: string;
    /** Current item / link text (`#d0d0d0` on dark). */
    bright?: string;
    /** Secondary text (`#adadad` on dark). */
    subtle?: string;
    /** Secondary text, slightly dimmer (`#a6a6a6` on dark). */
    soft?: string;
    /** Captions (`#8c8c8c` on dark). */
    quiet?: string;
    /** Hints and placeholders (`#7a7a7a` on dark). */
    faint?: string;
    /** Preserves Tailwind's `gray-300` (`#d1d5db` on dark). */
    gray300?: string;
    /** Preserves Tailwind's `neutral-300` (`#d4d4d4` on dark). */
    neutral300?: string;
    /** Preserves Tailwind's `neutral-200` (`#e5e5e5` on dark). */
    neutral200?: string;
    /** Preserves Tailwind's `gray-100` (`#f3f4f6` on dark). */
    gray100?: string;
    /** Preserves Mantine's `gray.4` (`#ced4da` on dark). */
    mantineGray4?: string;
    /** Text on filled brand/accent chips (`#0B0B0B` on dark). */
    onBrand?: string;
    /** Text on filled brand/accent rows (`#111111` on dark). */
    onBrandAlt?: string;
  };
  /** Blog category label colors (Mantine's `blue.4`, `grape.4`, `teal.4` on dark). */
  category?: {
    news?: string;
    review?: string;
    article?: string;
  };
  /**
   * Fixed card surfaces of app chrome (`bg-panel`, `border-panel-line`). Dark
   * themes pin the near-black fills components hard-coded; light themes map
   * them to paper tones.
   */
  panel?: {
    /** Base card fill (`#141414` on dark). */
    base?: string;
    /** Slightly deeper card fill (`#161616` on dark). */
    deep?: string;
    /** Element nested in a card (`#1f1f1f` on dark). */
    inset?: string;
    /** Highlighted card state (`#222222` on dark). */
    raised?: string;
    /** Card border (`#282828` on dark). */
    line?: string;
    /** Warmer, stronger card border (`#302D2D` on dark). */
    edge?: string;
    /** Start of the tinted card gradient (`#1a120f` on dark). */
    tint?: string;
    /** End of the tinted card gradient / tab strip fill (`#121212` on dark). */
    floor?: string;
    /** Translucent fill over the page (`rgba(0, 0, 0, 0.4)` on dark). */
    veil?: string;
    /** Segmented-control rail and indicator (`#262626` on dark). */
    rail?: string;
    /** Hint board behind index cards (`#15130F` on dark). */
    board?: string;
    /** Dot grid of the hint board (`#2E2A22` on dark). */
    boardDot?: string;
  };
  /**
   * Media surface pair: scrims plus the text and controls drawn over imagery
   * (covers, banners, hero art). A component that paints a media scrim must
   * take its text from `text-media*` and never from the theme text color, and
   * the other way round. Dark themes default to black scrims with white text;
   * light themes default to a paper wash from `tokens.background`/`surface`
   * with ink text from `tokens.text`/`textMuted`.
   */
  media?: {
    /** Overlay color applied with opacity over imagery (`#000000` on dark). */
    scrim?: string;
    /** Deeper end of a media gradient or the card base (`#0A0A0A` on dark). */
    scrimStrong?: string;
    /** Opacity of `scrimStrong` behind content over imagery. */
    contentScrimOpacity?: number;
    /** Color imagery fades into at its edge; equals the card base (`#0A0A0A` on dark). */
    fade?: string;
    /** Text over `scrim`/`scrimStrong` (`#FFFFFF` on dark). */
    text?: string;
    /** Secondary text over a media scrim (`#DBDBDB` on dark). */
    textMuted?: string;
    /** Metadata over a media scrim, a notch dimmer than `textMuted` (`#B8B8B8` on dark). */
    textDim?: string;
    /** Empty cover slot behind media (`#1A1A1A` on dark). */
    placeholder?: string;
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
    /**
     * Native launch splash (Android): background; defaults to `tokens.background`. The generated catalog
     * (`native.splash`) and `apps/mobile` `pnpm splash:generate` turn it into Android resources.
     */
    splashBackground?: string;
    /** Native launch splash: outer ring of the logo; defaults to `tokens.accent`. */
    splashBrand?: string;
    /**
     * Native launch splash: inner frame of the logo; defaults to `tokens.text` on dark themes and
     * `tokens.surface` on light ones, so it reads as the lighter tone against the ring.
     */
    splashLogoInner?: string;
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

/**
 * Non-color style variables. Every theme gets neutral defaults from the
 * generator, so shared code may consume `--gn-font-mono`,
 * `--gn-heading-transform`, `--gn-heading-tracking`, `--gn-selection-shadow`
 * and `--gn-cover-filter` without branching on the active theme.
 */
export type ThemeStyle = {
  /** CSS font-family list for metadata, badges and key hints. */
  fontMono?: string;
  headingTransform?: "none" | "uppercase";
  /** CSS `letter-spacing` for headings (e.g. `"0.14em"`). */
  headingTracking?: string;
  /** CSS `box-shadow` of selected items (hard offset shadows, no blur). */
  selectionShadow?: string;
  /** CSS `filter` applied to game covers. */
  coverFilter?: string;
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
  /**
   * Optional non-color style variables. `--gn-highlight` always equals the
   * resolved tertiary color (`overrides.tertiary`).
   */
  style?: ThemeStyle;
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
