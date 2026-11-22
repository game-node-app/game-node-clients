import type { ComponentType, ReactNode } from "react";
import type { UIPresenterRegistry } from "#@/context/registry";

/**
 * The components a lazy theme pack can replace. Packs only provide the keys
 * they change; `AppThemeProvider` merges them over the experience pack and
 * under the app's platform presenters.
 */
export type ThemePackPresenters = Partial<UIPresenterRegistry>;

export type ThemePackShellSlotProps = {
  children?: ReactNode;
};

/**
 * Shell slots an experience may provide. The web shell lives in `apps/web`, so
 * it decides whether it renders these; the contract keeps shell pieces out of
 * the presenter merge.
 */
export type ThemePackShell = {
  header?: ComponentType<ThemePackShellSlotProps>;
  bottomNavigation?: ComponentType<ThemePackShellSlotProps>;
  /**
   * Rendered once at the app root while the theme is active, by
   * `ThemeOverlayHost`. For atmosphere layers such as textures and boot
   * sequences that sit above the app.
   */
  overlay?: ComponentType;
};

/** Module contract: `export const presenters = {...}` and an optional `shell`. */
export type ThemePack = {
  presenters: ThemePackPresenters;
  shell?: ThemePackShell;
};

export type ThemePackLoader = () => Promise<ThemePack>;

export type ThemePackKind = "experience" | "screens";

export type ThemePackKey = `${ThemePackKind}:${string}`;

export const EMPTY_THEME_PACK: ThemePack = Object.freeze({ presenters: {} });

export function getThemePackKey(kind: ThemePackKind, id: string): ThemePackKey {
  return `${kind}:${id}`;
}

/**
 * Accepts the module namespace shape as well as `export default { presenters }`
 * and normalizes missing/invalid modules to an empty pack.
 */
export function normalizeThemePack(module: unknown): ThemePack {
  if (!module || typeof module !== "object") return EMPTY_THEME_PACK;

  const candidate =
    (module as { default?: unknown }).default ?? (module as unknown);
  if (!candidate || typeof candidate !== "object") return EMPTY_THEME_PACK;

  const value = candidate as Partial<ThemePack>;
  const presenters =
    value.presenters && typeof value.presenters === "object"
      ? value.presenters
      : {};

  return {
    presenters,
    ...(value.shell ? { shell: value.shell } : {}),
  };
}
