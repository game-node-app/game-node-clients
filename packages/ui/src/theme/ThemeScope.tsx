import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { getThemeCatalogEntry, type ThemeId } from "./generated/catalog";

/**
 * Semantic scope names generated next to the theme ids (see
 * `renderCss` in `packages/ui/scripts/generate-themes.ts`). `dark` is the
 * default dark theme.
 */
export type ThemeScopeName = ThemeId | "dark";

export type ThemeScopeProps = ComponentPropsWithoutRef<"div"> & {
  /** Theme (or semantic alias) re-applied to the subtree. Defaults to `dark`. */
  theme?: ThemeScopeName;
  /** Also paints the scope's page background (`--mantine-color-body`). */
  surface?: boolean;
};

/**
 * Re-applies a theme's full variable set (`--gn-*`, `--mantine-*`, `--ion-*`)
 * to a subtree, whatever theme the app is using.
 *
 * Use it only for surfaces that are dark (or light) by design: marketing
 * pages, recap stories, awards artwork. Inside, Tailwind token classes,
 * `var(--gn-…)` and Mantine components resolve to the scoped theme, so they
 * stay consistent with each other instead of mixing hard-coded dark colors
 * with the active theme's text. Normal app UI must not be scoped: it follows
 * the active theme.
 *
 * Mantine portals (modals, popovers, menus) render at `document.body`, outside
 * the scope, and keep using the active theme.
 */
export function ThemeScope({
  theme = "dark",
  surface = false,
  style,
  children,
  ...props
}: ThemeScopeProps) {
  const colorScheme =
    theme === "dark" ? "dark" : getThemeCatalogEntry(theme).colorScheme;
  const scopeStyle: CSSProperties | undefined = surface
    ? { backgroundColor: "var(--mantine-color-body)", ...style }
    : style;

  return (
    <div
      {...props}
      data-gn-scope={theme}
      data-mantine-color-scheme={colorScheme}
      style={scopeStyle}
    >
      {children}
    </div>
  );
}
