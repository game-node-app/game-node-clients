import { useCallback } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { PROJECT_CONTEXT } from "#@/util/projectContext";
import { APP_THEMES, AppTheme } from "./registry";

export const APP_THEME_STORAGE_KEY = "gamenode-theme";

export function isAppTheme(value: unknown): value is AppTheme {
  return APP_THEMES.includes(value as AppTheme);
}

/** Jingle played when switching to a theme; files live in each app's public/sfx. */
const THEME_SFX: Partial<Record<AppTheme, string>> = {
  playstation: "ps2",
  xbox: "xbox",
  switch: "switch",
  bigpicture: "steam",
};

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
    // prevents SSR hydration mismatches; mobile has no SSR and restores the theme before the first render (main.tsx)
    getInitialValueInEffect: PROJECT_CONTEXT?.client !== "mobile",
    // plain string, so the head script and native Preferences can read it
    serialize: (value) => value,
    deserialize: (value) => (isAppTheme(value) ? value : "gamenode"),
  });

  const setTheme = useCallback(
    (value: AppTheme) => {
      const sfx = THEME_SFX[value];
      // autoplay can be rejected by the browser; the sound is optional
      if (sfx && value !== theme) new Audio(`/sfx/${sfx}.mp3`).play().catch(() => {});
      setStoredTheme(value);
      document.documentElement.dataset.theme = value;
    },
    [setStoredTheme, theme],
  );

  return [theme, setTheme] as const;
}
