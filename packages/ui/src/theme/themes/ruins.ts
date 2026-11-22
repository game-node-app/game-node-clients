import { defineTheme } from "../defineTheme";

/**
 * Ruins: a light, sepia-and-graphite "terminal on paper" theme (Figma
 * `Themes` page). It is a palette theme plus a lazy screen pack (`ruins`);
 * the layout stays the default experience.
 *
 * The generator derives scales assuming a dark UI, so every derived value that
 * would end up unreadable on paper is pinned here: paper/dark/brand ramps,
 * lines, dimmed tones, status texts, navigation and Ionic surfaces. Text pairs
 * keep at least 4.5:1 on `background` (checked by the mobile theme tests).
 * Color literals are allowed in theme definition files.
 */
export const ruinsTheme = defineTheme({
  id: "ruins",
  labelKey: "settings.appearance.theme.ruins",
  colorScheme: "light",
  tokens: {
    background: "#CDC8B0",
    surface: "#DAD4BB",
    text: "#3F3C34",
    textMuted: "#57534A",
    border: "#A9A48E",
    accent: "#4E4B42",
    accentContrast: "#DAD4BB",
    focus: "#2F2D27",
    success: "#4F6440",
    warning: "#7A5A1D",
    danger: "#9E3F2B",
  },
  radius: "0px",
  font: 'var(--gn-font-zen, "Zen Kaku Gothic New"), var(--gn-font-roboto, Roboto), sans-serif',
  screens: "ruins",
  style: {
    fontMono:
      'var(--gn-font-share-tech-mono, "Share Tech Mono"), ui-monospace, monospace',
    headingTransform: "uppercase",
    headingTracking: "0.14em",
    selectionShadow: "4px 4px 0 var(--gn-line-strong)",
    coverFilter: "sepia(0.22) saturate(0.85)",
  },
  overrides: {
    // Lighter steps are text tones on dark themes; on paper they get darker.
    brand: {
      0: "#32302A",
      1: "#38362F",
      2: "#3F3C35",
      3: "#45423A",
      4: "#49473E",
      6: "#5D5A4F",
      7: "#6C695C",
      8: "#7C786A",
      9: "#8B8777",
    },
    // paper-0 is cards/inputs (surface-raised), paper-7 the app background.
    paper: {
      0: "#E4DFCA",
      1: "#DAD4BB",
      2: "#E0DBC5",
      3: "#DED9C3",
      4: "#D8D2B9",
      5: "#D4CEB5",
      6: "#D1CBB2",
      7: "#CDC8B0",
      8: "#D3CEB6",
    },
    // Mantine `dark` ramp is the text ramp on a light theme.
    dark: {
      0: "#3F3C34",
      1: "#4B4840",
      2: "#57534A",
      3: "#7F7A67",
      4: "#A9A48E",
      5: "#B8B29C",
      6: "#C4BEA7",
      7: "#CEC8B0",
      8: "#D5CFB6",
      9: "#DAD4BB",
    },
    secondary: "#E4DFCA",
    tertiary: "#B0452F",
    // Selected/"your vote" paper tint. Pinned because the derived 12% accent
    // mix is too close to paper-0 here: at #CFCAB4 both text (6.7:1) and
    // text-muted (4.65:1) clear AA, while the tint stays distinct from
    // paper-0 (#E4DFCA).
    brandTint: "#CFCAB4",
    line: { default: "#A9A48E", strong: "#7F7A67" },
    // Text greys must stay at 4.5:1 on the background; #57534A is the lightest
    // tone that does, so the lesser tones collapse onto it.
    textTones: {
      pale: "#2F2D27",
      chalk: "#3F3C34",
      bright: "#3F3C34",
      subtle: "#57534A",
      soft: "#4E4B42",
      quiet: "#57534A",
      faint: "#57534A",
      gray300: "#4B4840",
      neutral300: "#4B4840",
      neutral200: "#3F3C34",
      gray100: "#2F2D27",
      mantineGray4: "#4B4840",
      onBrand: "#DAD4BB",
      onBrandAlt: "#DAD4BB",
    },
    category: {
      news: "#1A5280",
      review: "#6F3480",
      article: "#17594A",
    },
    // Fixed dark card fills become paper: cards are raised paper, nested
    // elements the surface tone.
    panel: {
      base: "#E4DFCA",
      deep: "#E4DFCA",
      inset: "#DAD4BB",
      raised: "#D8D2B9",
      line: "#A9A48E",
      edge: "#A9A48E",
      tint: "#DAD4BB",
      floor: "#E4DFCA",
      veil: "#E4DFCA",
      rail: "#D8D2B9",
      board: "#DAD4BB",
      boardDot: "#C4BEA7",
    },
    // Media pair: imagery gets a paper wash and ink text instead of a black
    // scrim (derived from the tokens; pinned so the intent is explicit).
    media: {
      scrim: "#CDC8B0",
      scrimStrong: "#E4DFCA",
      contentScrimOpacity: 0.92,
      fade: "#CDC8B0",
      text: "#3F3C34",
      textMuted: "#4B4840",
      textDim: "#4B4840",
      placeholder: "#DAD4BB",
    },
    // All four are at least 4.5:1 on the background when used as text.
    dimmed: { default: "#57534A", 1: "#4E4B42", 2: "#4A463D", 3: "#57534A" },
    premium: {
      base: "#4E4B42",
      text: "#3F3C34",
      soft: "#57534A",
      bright: "#2F2D27",
    },
    chart: { primary: "#4E4B42" },
    level: { text: "#57534A", border: "#7F7A67" },
    status: {
      successText: "#3B502F",
      warningText: "#6B4E17",
      dangerStrong: "#9E3F2B",
      dangerText: "#8A3322",
    },
    nav: {
      canvas: "#CDC8B0",
      surface: "#CDC8B0",
      raised: "#E4DFCA",
      border: "#A9A48E",
      text: "#3F3C34",
      muted: "#57534A",
      danger: "#8A3322",
      accentSubtle: "rgba(78, 75, 66, 0.12)",
    },
    textColor: "#3F3C34",
    textEmphasis: "#2F2D27",
    accentText: "#3F3C34",
    // Scrims sit over artwork, so they stay dark.
    scrim: "#2F2D27",
    mobile: {
      buttonBorder: "#A9A48E",
      tabText: "#3F3C34",
      menuCanvas: "#CDC8B0",
      menuDanger: "#8A3322",
      splashBackground: "#CDC8B0",
      systemBarBackground: "#CDC8B0",
    },
    state: { played: "#4F6440", playedTint: "#C0BEA5" },
    mantine: {
      body: "#CDC8B0",
      text: "#3F3C34",
      dimmed: "#57534A",
      radius: "0px",
    },
    ionic: {
      colors: {
        primary: { base: "#4E4B42", contrast: "#DAD4BB" },
        light: { base: "#E4DFCA", contrast: "#3F3C34" },
        medium: { base: "#7F7A67", contrast: "#F3F0E2" },
        dark: { base: "#3F3C34", contrast: "#E4DFCA" },
      },
      surfaces: {
        background: "#CDC8B0",
        text: "#3F3C34",
        toolbarBackground: "#CDC8B0",
        tabBarBackground: "#DAD4BB",
        itemBackground: "#E4DFCA",
        cardBackground: "#E4DFCA",
        modalBackground: "#CDC8B0",
      },
    },
  },
});
