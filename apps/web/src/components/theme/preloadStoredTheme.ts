import { getThemeCatalogEntry, preloadThemePack } from "@repo/ui";
import { readStoredThemeId } from "./themeStorage";

/**
 * Starts the stored theme's pack imports as early as the web bundle allows
 * (module scope in `_app`, before React renders). It is conditional: without a
 * stored theme, and for `gamenode`, nothing is imported. The same import is
 * shared with `AppThemeProvider`, so a fast resolution makes the first client
 * render synchronous and avoids the "pending" window.
 */
export function preloadStoredTheme(): void {
  if (typeof window === "undefined") return;

  const stored = readStoredThemeId();
  if (!stored) return;

  const entry = getThemeCatalogEntry(stored);
  if (entry.experience === "default" && entry.screens === null) return;

  void preloadThemePack(entry.id);
}
