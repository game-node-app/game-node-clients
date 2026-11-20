import type { ThemeDefinition } from "./defineTheme";
import { gamenodeTheme } from "./themes/gamenode";
import { xboxTheme } from "./themes/xbox";

/**
 * Explicit registration: the generator only sees themes listed here, and the
 * first entry marked `DEFAULT_REGISTERED_THEME_ID` is emitted on plain `:root`.
 *
 * Adding a theme: create `themes/<id>.ts`, add it to `themeDefinitions` and run
 * `pnpm themes:generate`.
 */
export const DEFAULT_REGISTERED_THEME_ID = "gamenode";

export const themeDefinitions: readonly ThemeDefinition[] = [
  gamenodeTheme,
  xboxTheme,
];
