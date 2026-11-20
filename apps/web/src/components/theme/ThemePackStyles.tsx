import dynamic from "next/dynamic";
import {
  getThemeCatalogEntry,
  useAppExperience,
  useAppTheme,
} from "@repo/ui";

/**
 * The theme packs load through `import()` inside `@repo/ui`, which keeps their
 * JS lazy. Next cannot know which of those CSS Modules the server rendered, so
 * this web-only anchor imports the active pack through `next/dynamic`: Next
 * then emits the pack's stylesheet link in the SSR HTML (no unstyled Xbox
 * markup before hydration). Nothing renders for the default experience.
 */
const ConsolePackStyles = dynamic(
  () => import("@repo/ui/theme/anchors/console"),
);
const XboxScreenPackStyles = dynamic(
  () => import("@repo/ui/theme/anchors/xbox-screens"),
);

export function ThemePackStyles() {
  const [themeId] = useAppTheme();
  const experience = useAppExperience();
  const screens = getThemeCatalogEntry(themeId).screens;

  return (
    <>
      {experience === "console" ? <ConsolePackStyles /> : null}
      {screens === "xbox" ? <XboxScreenPackStyles /> : null}
    </>
  );
}
