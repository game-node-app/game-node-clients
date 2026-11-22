import { useLayoutEffect } from "react";
import {
  DEFAULT_THEME_CATALOG,
  useAppTheme,
  type ThemeCatalog,
} from "@repo/ui";

/**
 * Ionic's dark palette (`@ionic/react/css/palettes/dark.class.css`) only
 * applies while `<html>` carries this class, so light themes are not forced
 * into Ionic's dark step colors.
 */
export const IONIC_DARK_PALETTE_CLASS = "ion-palette-dark";

/**
 * Sets the pieces of `<html>` that depend on a theme's color scheme before
 * React renders (Mantine's `data-mantine-color-scheme` and Ionic's dark
 * palette class). The live updates come from `ThemeColorSchemeSync` and
 * `IonicPaletteSync`.
 */
export function applyThemeColorSchemeToDocument(
  themeId: string | null | undefined,
  catalog: ThemeCatalog = DEFAULT_THEME_CATALOG,
): void {
  const { colorScheme } = catalog.get(themeId);
  const root = document.documentElement;
  root.setAttribute("data-mantine-color-scheme", colorScheme);
  root.classList.toggle(IONIC_DARK_PALETTE_CLASS, colorScheme === "dark");
}

/** Renders nothing; mount it inside `AppThemeProvider`. */
export function IonicPaletteSync({
  catalog = DEFAULT_THEME_CATALOG,
}: {
  catalog?: ThemeCatalog;
}) {
  const [themeId] = useAppTheme();
  const isDark = catalog.get(themeId).colorScheme === "dark";

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(IONIC_DARK_PALETTE_CLASS, isDark);
  }, [isDark]);

  return null;
}
