import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { Preferences } from "@capacitor/preferences";
import { StatusBar } from "@capacitor/status-bar";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { useAppTheme } from "@repo/ui";
import {
  createNativeThemeChrome,
  SPLASH_THEME_STORAGE_KEY,
  type NativeThemeChromeController,
} from "./native-theme-chrome";

export const nativeThemeChrome = createNativeThemeChrome({
  isNativePlatform: () => Capacitor.isNativePlatform(),
  getDeviceInfo: () => Device.getInfo(),
  enableEdgeToEdge: () => EdgeToEdge.enable(),
  disableEdgeToEdge: () => EdgeToEdge.disable(),
  setEdgeToEdgeBackground: (color) => EdgeToEdge.setBackgroundColor({ color }),
  setStatusBarStyle: (style) => StatusBar.setStyle({ style }),
  saveSplashTheme: (themeId) =>
    Preferences.set({ key: SPLASH_THEME_STORAGE_KEY, value: themeId }),
});

/**
 * Keeps the Android edge-to-edge background, the status bar icons and the
 * next launch's splash colors in sync with the active theme, on start and on
 * every switch.
 */
export function useNativeThemeChrome(
  controller: NativeThemeChromeController = nativeThemeChrome,
): void {
  const [theme] = useAppTheme();

  useEffect(() => {
    void controller.apply(theme);
  }, [controller, theme]);
}

/** Renders nothing; mount it inside `AppThemeProvider`. */
export function NativeThemeChrome({
  controller,
}: {
  controller?: NativeThemeChromeController;
}) {
  useNativeThemeChrome(controller);
  return null;
}
