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
});
