import { useEffect, useLayoutEffect } from "react";
import { getThemeCatalogEntry, useAppTheme } from "@repo/ui";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function WebThemeRuntime() {
  const [themeId] = useAppTheme();

  useIsomorphicLayoutEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        getThemeCatalogEntry(themeId).preview.background,
      );
  }, [themeId]);

  return null;
}
