import { useMemo } from "react";
import type { UIPresenterRegistry } from "#@/context/registry";
import { THEMES } from "./registry";
import { useAppTheme } from "./useAppTheme";

/**
 * The app's presenters plus the active theme's, for UIProvider's `presenters`.
 * Lives here, not in UIProvider: the context layer must not import components at load time (import cycle).
 */
export function useThemePresenters(presenters?: Partial<UIPresenterRegistry>) {
  const [theme] = useAppTheme();
  return useMemo(
    // the app wins: a theme never replaces a platform adaptation (Ionic etc.), it restyles it via CSS instead
    () => ({ ...THEMES[theme].presenters, ...presenters }),
    [theme, presenters],
  );
}
