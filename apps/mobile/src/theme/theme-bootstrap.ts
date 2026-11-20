import { getThemeCatalogEntry, preloadThemePack, type ThemeId } from "@repo/ui";
import {
  restoreThemePreference,
  THEME_RESTORE_TIMEOUT_MS,
  withTimeout,
} from "./theme-storage";

/**
 * The experience/screens chunks are local imports, but a slow/offline WebView
 * can still take a while. After this cap the app renders with the default
 * layout and the theme's colors, then switches when the pack arrives.
 */
export const THEME_PRELOAD_TIMEOUT_MS = 600;

type RestoreThemeForBootOptions = {
  restore?: () => Promise<string>;
  restoreTimeoutMs?: number;
  preload?: (themeId: string) => Promise<void>;
  preloadTimeoutMs?: number;
};

/**
 * Restores Preferences (or its mirror) and preloads the matching experience
 * before `root.render`. The palette still applies if its layouts load slowly.
 */
export async function restoreThemeForBoot({
  restore,
  restoreTimeoutMs = THEME_RESTORE_TIMEOUT_MS,
  preload = preloadThemePack,
  preloadTimeoutMs = THEME_PRELOAD_TIMEOUT_MS,
}: RestoreThemeForBootOptions = {}): Promise<ThemeId> {
  const restored = restore
    ? await withTimeout(Promise.resolve().then(restore), restoreTimeoutMs)
    : await restoreThemePreference({ timeoutMs: restoreTimeoutMs });
  const { id, experience, screens } = getThemeCatalogEntry(restored);

  if (experience !== "default" || screens !== null) {
    await withTimeout(
      Promise.resolve().then(() => preload(id)),
      preloadTimeoutMs,
    );
  }

  return id;
}
