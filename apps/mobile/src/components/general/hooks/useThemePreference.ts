import { useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { APP_THEME_STORAGE_KEY, isAppTheme, useAppTheme } from "@repo/ui";

/**
 * Mirrors the app theme into native Preferences, which survives WebView storage eviction,
 * and restores it from there on startup.
 */
export function useThemePreference() {
  const [theme, setTheme] = useAppTheme();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    Preferences.get({ key: APP_THEME_STORAGE_KEY })
      .then(({ value }) => {
        if (isAppTheme(value)) setTheme(value);
      })
      .catch(console.error)
      .finally(() => setRestored(true));
  }, [setTheme]);

  useEffect(() => {
    // Writing before the restore finishes would overwrite the saved theme with the default.
    if (!restored) return;
    Preferences.set({ key: APP_THEME_STORAGE_KEY, value: theme }).catch(
      console.error,
    );
  }, [restored, theme]);
}
