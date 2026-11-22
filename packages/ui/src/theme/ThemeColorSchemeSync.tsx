import { useEffect, useLayoutEffect } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { useAppTheme } from "./AppThemeProvider";
import { DEFAULT_THEME_CATALOG, type ThemeCatalog } from "./runtime";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export type ThemeColorSchemeSyncProps = {
  /** Catalog override for tests; defaults to the generated catalog. */
  catalog?: ThemeCatalog;
};

/**
 * Keeps Mantine's color scheme equal to the active theme's `colorScheme`.
 * Render it inside both `MantineProvider` and the theme provider.
 */
export function ThemeColorSchemeSync({
  catalog = DEFAULT_THEME_CATALOG,
}: ThemeColorSchemeSyncProps) {
  const [themeId] = useAppTheme();
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = catalog.get(themeId).colorScheme;

  useIsomorphicLayoutEffect(() => {
    setColorScheme(colorScheme);
    // `setColorScheme` changes identity with Mantine's internal state; the
    // scheme is the only input that should trigger a sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorScheme]);

  return null;
}
