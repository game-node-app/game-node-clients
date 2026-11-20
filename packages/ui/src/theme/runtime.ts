import {
  DEFAULT_THEME_ID,
  getThemeCatalogEntry,
  isThemeId,
  type ThemeCatalogEntry,
  type ThemeExperienceId,
  type ThemeId,
  type ThemeScreensId,
} from "./generated/catalog";

/**
 * Per-device theme storage adapter. Apps inject one through
 * `UIHookRegistry.themeStorage`; apps without one (admin) keep the default.
 *
 * `get` is synchronous on purpose: the value has to be available before the
 * first render (mobile restores from a localStorage mirror before rendering).
 */
export interface ThemeStorage {
  get(): string | null;
  /** Persists a resolved theme id. Adapters may write asynchronously. */
  set(themeId: string): void | Promise<void>;
}

/**
 * The subset of the generated catalog the runtime needs. Tests use it to
 * exercise packs for themes that are not registered yet (e.g. Xbox before
 * task 7.1) without registering them in the real catalog.
 */
export type ThemeCatalog = {
  defaultId: ThemeId;
  get(id: string | null | undefined): ThemeCatalogEntry;
  isThemeId(value: unknown): value is ThemeId;
};

export const DEFAULT_THEME_CATALOG: ThemeCatalog = {
  defaultId: DEFAULT_THEME_ID,
  get: getThemeCatalogEntry,
  isThemeId,
};

/**
 * Resolves any stored/prop value to a catalog id. Unknown or removed themes
 * fall back to the default (`gamenode`) instead of throwing.
 */
export function resolveThemeId(
  value: string | null | undefined,
  catalog: ThemeCatalog = DEFAULT_THEME_CATALOG,
): ThemeId {
  return catalog.get(value).id;
}

export function getThemeExperience(
  value: string | null | undefined,
  catalog: ThemeCatalog = DEFAULT_THEME_CATALOG,
): ThemeExperienceId {
  return catalog.get(value).experience;
}

export function getThemeScreens(
  value: string | null | undefined,
  catalog: ThemeCatalog = DEFAULT_THEME_CATALOG,
): ThemeScreensId | null {
  return catalog.get(value).screens;
}
