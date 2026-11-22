import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { THEME_CATALOG } from "../../../../packages/ui/src/theme/generated/catalog";
import { themeDefinitions } from "../../../../packages/ui/src/theme/definitions";
import {
  ANDROID_MAIN_DIR,
  checkNativeSplashFiles,
  renderNativeSplashFiles,
} from "../../scripts/native-splash";
import { SPLASH_THEME_STORAGE_KEY } from "./native-theme-chrome";

/**
 * The native splash (Android `SplashPalette`) cannot read the theme
 * definitions, so `scripts/native-splash.ts` generates its resources from the
 * theme catalog (`native.splash`). These checks keep the generated files in
 * sync with packages/ui and pin the colors that shipped before generation.
 */
function readAndroidSource(relativePath: string): string {
  return readFileSync(path.join(ANDROID_MAIN_DIR, relativePath), "utf8");
}

function androidColor(name: string): string | undefined {
  return new RegExp(`<color name="${name}">(#[0-9A-Fa-f]{6})</color>`)
    .exec(readAndroidSource("res/values/splash_themes.xml"))?.[1]
    .toUpperCase();
}

describe("native splash palette", () => {
  it("has generated files that match the theme catalog", () => {
    // run `pnpm themes:generate` (or `pnpm --filter mobile splash:generate`) when this fails
    expect(checkNativeSplashFiles()).toEqual([]);
  });

  it("generates colors, a launch style and a logo for every non-default theme", () => {
    const files = renderNativeSplashFiles();
    const paths = files.map((file) => file.path);
    const values = readAndroidSource("res/values/splash_themes.xml");
    const java = readAndroidSource(
      "java/app/gamenode/splash/SplashThemes.java",
    );

    for (const entry of THEME_CATALOG) {
      if (entry.isDefault) continue;
      const resource = entry.id.replace(/-/g, "_");
      expect(paths).toContain(`res/drawable/ic_splash_logo_${resource}.xml`);
      expect(values).toContain(`name="splash_${resource}_background"`);
      expect(java).toContain(`case "${entry.id}":`);
    }
    // the manifest launch theme and splash_launch.xml keep using the default's resources
    expect(java).toContain("R.style.AppTheme_NoActionBarLaunch\n");
  });

  it("matches each theme definition's splash colors", () => {
    for (const definition of themeDefinitions) {
      const entry = THEME_CATALOG.find((theme) => theme.id === definition.id)!;
      const prefix = entry.isDefault
        ? "splash"
        : `splash_${definition.id.replace(/-/g, "_")}`;
      expect(androidColor(`${prefix}_background`)).toBe(
        (
          definition.overrides?.mobile?.splashBackground ??
          definition.tokens.background
        ).toUpperCase(),
      );
      expect(androidColor(`${prefix}_brand`)).toBe(
        (
          definition.overrides?.mobile?.splashBrand ?? definition.tokens.accent
        ).toUpperCase(),
      );
    }
  });

  it("keeps the colors the splash shipped with for gamenode and xbox", () => {
    expect(androidColor("splash_background")).toBe("#1A1A1A");
    expect(androidColor("splash_brand")).toBe("#F15025");
    expect(androidColor("splash_logo_inner")).toBe("#FFFFFF");
    expect(androidColor("splash_xbox_background")).toBe("#0F0F0F");
    expect(androidColor("splash_xbox_brand")).toBe("#107C10");
    expect(androidColor("splash_xbox_logo_inner")).toBe("#FFFFFF");
  });

  it("paints Ruins as an ink logo on paper", () => {
    expect(androidColor("splash_ruins_background")).toBe("#CDC8B0");
    expect(androidColor("splash_ruins_brand")).toBe("#4E4B42");
    expect(androidColor("splash_ruins_logo_inner")).toBe("#DAD4BB");
    expect(
      existsSync(
        path.join(ANDROID_MAIN_DIR, "res/drawable/ic_splash_logo_ruins.xml"),
      ),
    ).toBe(true);
  });

  it("reads the theme id from the key and group NativeThemeChrome writes", () => {
    const source = readAndroidSource(
      "java/app/gamenode/splash/SplashPalette.java",
    );

    expect(source).toContain(`THEME_KEY = "${SPLASH_THEME_STORAGE_KEY}"`);
    // @capacitor/preferences' default group
    expect(source).toContain('PREFERENCES_GROUP = "CapacitorStorage"');
    // theme ids are not hard-coded in the lookup: it goes through the generated map
    expect(source).toContain("SplashThemes.forId(");
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    for (const entry of THEME_CATALOG) {
      expect(code).not.toContain(`"${entry.id}"`);
    }
  });
});
