import React from "react";
import { createRoot } from "react-dom/client";
import { Preferences } from "@capacitor/preferences";
import { APP_THEME_STORAGE_KEY, isAppTheme } from "@repo/ui";
import App from "./App";

// Applies the saved theme before the first render so the default theme never flashes.
async function restoreAppTheme() {
  try {
    const { value } = await Preferences.get({ key: APP_THEME_STORAGE_KEY });
    if (isAppTheme(value)) {
      document.documentElement.dataset.theme = value;
      // useAppTheme reads from localStorage
      localStorage.setItem(APP_THEME_STORAGE_KEY, value);
    }
  } catch (e) {
    console.error(e);
  }
}

const container = document.getElementById("root");
const root = createRoot(container!);
restoreAppTheme().finally(() =>
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  ),
);
