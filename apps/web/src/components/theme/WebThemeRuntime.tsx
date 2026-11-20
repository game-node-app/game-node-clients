import { useEffect, useLayoutEffect, useRef } from "react";
import {
  getThemeCatalogEntry,
  useAppTheme,
  useIsAppExperiencePending,
} from "@repo/ui";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function WebThemeRuntime() {
  const [themeId] = useAppTheme();
  const pending = useIsAppExperiencePending();
  const previousTheme = useRef(themeId);

  useIsomorphicLayoutEffect(() => {
    // The inline script already set the tint before hydration.
    if (previousTheme.current !== themeId) {
      previousTheme.current = themeId;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute(
          "content",
          getThemeCatalogEntry(themeId).preview.background,
        );
    }

    // The head script owns the deadline. Clear its gate early once the
    // restored palette and layout are both active.
    const root = document.documentElement;
    if (!pending && root.dataset.theme === themeId) {
      root.removeAttribute("data-experience-pending");
    }
  }, [pending, themeId]);

  return null;
}
