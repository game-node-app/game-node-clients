import { defineTheme } from "../defineTheme";

/**
 * Xbox-inspired theme (see the `xbox-theme` spec).
 *
 * Palette values come from the reference implementation
 * (`origin/feat/settings-modal-themes`, `theme/themes/xbox/theme.css`):
 * near-black background and surfaces, white text, grey muted text, Xbox green
 * accent and a brighter green focus ring. Status colors keep GameNode's
 * semantics so success/warning/danger stay distinguishable from the accent.
 *
 * Segoe is a local system font on Windows and is never bundled; elsewhere the
 * stack falls back to Inter through `--gn-font-inter` (task 7.2) and then to
 * Roboto. The `console` experience and the `xbox` screen pack are lazy, so
 * registering this definition does not enable or ship the Xbox UI by itself.
 */
export const xboxTheme = defineTheme({
  id: "xbox",
  labelKey: "settings.appearance.theme.xbox",
  colorScheme: "dark",
  tokens: {
    background: "#0F0F0F",
    surface: "#141414",
    text: "#FFFFFF",
    textMuted: "#9A9A9A",
    border: "#2A2A2A",
    accent: "#107C10",
    accentContrast: "#FFFFFF",
    focus: "#2EA043",
    success: "#0C9D61",
    warning: "#FE9B0E",
    danger: "#EC2D30",
  },
  radius: "4px",
  font: '"Segoe UI Variable", "Segoe UI", var(--gn-font-inter, Inter), Roboto, sans-serif',
  experience: "console",
  screens: "xbox",
  overrides: {
    // Same fixed greys and card fills the components hard-coded before the
    // tone/panel tokens, so Xbox renders exactly as it did.
    textTones: {
      pale: "#E6E6E6",
      chalk: "#D9D9D9",
      bright: "#D0D0D0",
      subtle: "#ADADAD",
      soft: "#A6A6A6",
      quiet: "#8C8C8C",
      faint: "#7A7A7A",
      gray300: "#D1D5DB",
      neutral300: "#D4D4D4",
      neutral200: "#E5E5E5",
      gray100: "#F3F4F6",
      mantineGray4: "#CED4DA",
      onBrand: "#0B0B0B",
      onBrandAlt: "#111111",
    },
    category: {
      news: "#4DABF7",
      review: "#DA77F2",
      article: "#38D9A9",
    },
    panel: {
      base: "#141414",
      deep: "#161616",
      inset: "#1F1F1F",
      raised: "#222222",
      line: "#282828",
      edge: "#302D2D",
      tint: "#1A120F",
      floor: "#121212",
      veil: "rgba(0, 0, 0, 0.4)",
      rail: "#262626",
      board: "#15130F",
      boardDot: "#2E2A22",
    },
    // Media surface pair: the literals the trending hero and review cards
    // hard-coded (black wash, #0A0A0A card, white text over imagery).
    media: {
      scrim: "#000000",
      scrimStrong: "#0A0A0A",
      fade: "#0A0A0A",
      text: "#FFFFFF",
      textMuted: "#DBDBDB",
      textDim: "#B8B8B8",
      placeholder: "#1A1A1A",
    },
  },
});
