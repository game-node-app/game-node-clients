import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { restoreThemeForBoot } from "./theme/theme-bootstrap";

function render(initialTheme: string | null) {
  const container = document.getElementById("root");
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App initialTheme={initialTheme} />
    </React.StrictMode>,
  );
}

/**
 * Restore Preferences (bounded) and preload the stored experience before the
 * first render. When the preload misses its cap, `App` still renders with the
 * restored colors and the default layout, then switches when the pack lands.
 */
void restoreThemeForBoot()
  .then((theme) => {
    document.documentElement.dataset.theme = theme;
    render(theme);
  })
  .catch(() => {
    // Never leave the WebView without an app: index.html already carries the
    // default `data-theme`, and the provider falls back to gamenode.
    render(null);
  });
