import type {
  MantineColorScheme,
  MantineColorSchemeManager,
} from "@mantine/core";
import { DEFAULT_THEME_CATALOG, type ThemeCatalog } from "./runtime";

export type ThemeColorSchemeManagerOptions = {
  /** Catalog override for tests; defaults to the generated catalog. */
  catalog?: ThemeCatalog;
};

/**
 * Mantine color scheme manager that never persists anything: the active theme
 * is the single source of truth for light/dark. `get` reads the theme that is
 * already on `<html data-theme>` (set by the server, the pre-paint script or
 * `AppThemeProvider`) and maps it through the catalog; `ThemeColorSchemeSync`
 * then keeps Mantine aligned when the theme changes.
 */
export function createThemeColorSchemeManager({
  catalog = DEFAULT_THEME_CATALOG,
}: ThemeColorSchemeManagerOptions = {}): MantineColorSchemeManager {
  return {
    get(defaultValue: MantineColorScheme): MantineColorScheme {
      if (typeof document === "undefined") return defaultValue;

      const themeId = document.documentElement.dataset.theme;
      if (!themeId || !catalog.isThemeId(themeId)) return defaultValue;

      return catalog.get(themeId).colorScheme;
    },
    set() {
      // The theme owns the scheme; nothing to store.
    },
    subscribe() {
      // No external source (storage events, other tabs) can change the scheme.
    },
    unsubscribe() {},
    clear() {},
  };
}
