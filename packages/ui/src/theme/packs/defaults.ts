import {
  getThemeCatalogEntry,
  type ThemeExperienceId,
  type ThemeScreensId,
} from "#@/theme/generated/catalog";
import { EXPERIENCE_PACK_LOADERS } from "#@/theme/experiences/registry";
import { SCREEN_PACK_LOADERS } from "#@/theme/themes/screens-registry";
import { createThemePackStore } from "./store";

/**
 * The app-wide pack store: preloads and the provider share it, so an early
 * `preloadThemePack()` call makes the first render synchronous.
 */
export const themePackStore = createThemePackStore({
  experience: EXPERIENCE_PACK_LOADERS,
  screens: SCREEN_PACK_LOADERS,
});

/**
 * Starts both imports for a theme and waits (never rejects). Callers that want
 * to render without suspending (web client restore, mobile cold start) await
 * this behind their own short timeout.
 */
export async function preloadThemePacks(
  experience: ThemeExperienceId,
  screens: ThemeScreensId | null,
): Promise<void> {
  await Promise.allSettled([
    themePackStore.load("experience", experience),
    themePackStore.load("screens", screens),
  ]);
}

/** Convenience for an app that only has the stored id (cookie/Preferences). */
export async function preloadThemePack(
  themeId: string | null | undefined,
): Promise<void> {
  const entry = getThemeCatalogEntry(themeId);
  await preloadThemePacks(entry.experience, entry.screens);
}

/** Whether the theme's packs are resolved (including cached import failures). */
export function isThemePackLoaded(themeId: string | null | undefined): boolean {
  const entry = getThemeCatalogEntry(themeId);
  return (
    themePackStore.isLoaded("experience", entry.experience) &&
    themePackStore.isLoaded("screens", entry.screens)
  );
}
