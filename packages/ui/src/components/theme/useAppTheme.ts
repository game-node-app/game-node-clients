import { useCallback } from "react";
import { useLocalStorage } from "@mantine/hooks";

export const APP_THEMES = [
  "gamenode",
  "playstation",
  "xbox",
  "switch",
  "bigpicture",
] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const APP_THEME_STORAGE_KEY = "gamenode-theme";

export function isAppTheme(value: unknown): value is AppTheme {
  return APP_THEMES.includes(value as AppTheme);
}

/**
 * Inline script for the document head: applies the stored theme before first paint.
 * Mirrors the validation in `isAppTheme`.
 */
export const APP_THEME_SCRIPT = `try{var t=localStorage.getItem("${APP_THEME_STORAGE_KEY}");if(${JSON.stringify(APP_THEMES)}.indexOf(t)>-1)document.documentElement.dataset.theme=t}catch(e){}`;

/**
 * The device's app theme, persisted in localStorage and shared by every caller.
 * Setting it also updates `data-theme` on <html>, which is what themes.css keys on;
 * the initial value is applied by `APP_THEME_SCRIPT` so the first render can't flash the default.
 */
export function useAppTheme() {
  const [theme, setStoredTheme] = useLocalStorage<AppTheme>({
    key: APP_THEME_STORAGE_KEY,
    defaultValue: "gamenode",
    // prevents SSR hydration mismatches
    getInitialValueInEffect: true,
    // plain string, so the head script and native Preferences can read it
    serialize: (value) => value,
    deserialize: (value) => (isAppTheme(value) ? value : "gamenode"),
  });

  const setTheme = useCallback(
    (value: AppTheme) => {
      setStoredTheme(value);
      document.documentElement.dataset.theme = value;
    },
    [setStoredTheme],
  );

  return [theme, setTheme] as const;
}
