import { useSyncExternalStore } from "react";
import { useAppThemeShell } from "./AppThemeProvider";

const subscribeNoop = () => () => {};

/**
 * `false` on the server and during hydration, `true` afterwards. Overlays are
 * client-only atmosphere (they read localStorage and may already be loaded on
 * the client while SSR rendered nothing), so they must not take part in
 * hydration.
 */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

/**
 * Renders the active theme pack's `shell.overlay` (atmosphere layers such as
 * textures and boot sequences). Mount it once at the app root, inside the
 * theme provider.
 */
export function ThemeOverlayHost() {
  const Overlay = useAppThemeShell()?.overlay;
  const hydrated = useHydrated();
  return hydrated && Overlay ? <Overlay /> : null;
}
