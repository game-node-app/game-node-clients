import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { xboxTheme } from "../../../../packages/ui/src/theme/themes/xbox";
import { SPLASH_THEME_STORAGE_KEY } from "./native-theme-chrome";

/**
 * The native splash (Android `SplashPalette`) cannot read the theme
 * definitions, so its colors are copied into res/values/splash.xml. These
 * checks keep the copy and the native lookup in sync with packages/ui.
 */
function readAndroidSource(path: string): string {
  return readFileSync(
    new URL(`../../android/app/src/main/${path}`, import.meta.url),
    "utf8",
  );
}

function androidColor(name: string): string | undefined {
  const match = new RegExp(
    `<color name="${name}">(#[0-9A-Fa-f]{6})</color>`,
  ).exec(readAndroidSource("res/values/splash.xml"));
  return match?.[1].toUpperCase();
}

describe("native splash palette", () => {
  it("uses the Xbox theme's background and accent", () => {
    expect(androidColor("splash_xbox_background")).toBe(
      xboxTheme.tokens.background.toUpperCase(),
    );
    expect(androidColor("splash_xbox_brand")).toBe(
      xboxTheme.tokens.accent.toUpperCase(),
    );
  });

  it("reads the theme id from the key and group NativeThemeChrome writes", () => {
    const source = readAndroidSource(
      "java/app/gamenode/splash/SplashPalette.java",
    );

    expect(source).toContain(`THEME_KEY = "${SPLASH_THEME_STORAGE_KEY}"`);
    // @capacitor/preferences' default group
    expect(source).toContain('PREFERENCES_GROUP = "CapacitorStorage"');
    expect(source).toContain(`XBOX_THEME_ID = "${xboxTheme.id}"`);
  });
});
