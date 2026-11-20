import type { ThemeScreensId } from "#@/theme/generated/catalog";
import type { ThemePackLoader } from "#@/theme/packs/types";

/**
 * Static `import()` boundaries for theme screen packs. Registering the loader
 * here does not register or enable the theme: the catalog decides which theme
 * is selectable and which screens id it uses.
 *
 * `themes/xbox/screens` is excluded from the barrelsby config: its `index.ts`
 * is the pack entry point, not a barrel.
 */
export const SCREEN_PACK_LOADERS: Partial<
  Record<ThemeScreensId, ThemePackLoader>
> = {
  xbox: () => import("./xbox/screens"),
};
