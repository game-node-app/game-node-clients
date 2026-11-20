import type { ThemeExperienceId } from "#@/theme/generated/catalog";
import { EMPTY_THEME_PACK, type ThemePackLoader } from "#@/theme/packs/types";

/**
 * Static `import()` boundaries for experience packs. The loaders are values in
 * a map, never called at module evaluation time, so importing `@repo/ui` does
 * not pull the console experience into the default bundle.
 *
 * The `console` folder is excluded from the barrelsby config: its `index.ts`
 * is the pack entry point, not a barrel.
 */
export const EXPERIENCE_PACK_LOADERS: Record<
  ThemeExperienceId,
  ThemePackLoader
> = {
  default: () => Promise.resolve(EMPTY_THEME_PACK),
  console: () => import("./console"),
};
