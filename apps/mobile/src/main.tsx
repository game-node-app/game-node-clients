import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyThemeColorSchemeToDocument } from "./theme/ionic-palette";
import { restoreThemeForBoot } from "./theme/theme-bootstrap";

/*
 * Ruins fonts. Latin + Latin Extended only (the full Zen Kaku set is ~100 KB of
 * CSS); @font-face files download only when a theme's font stack uses them.
 * The family names are exposed as `--gn-font-zen` / `--gn-font-share-tech-mono`
 * in `globals.css`.
 */
import "@fontsource/zen-kaku-gothic-new/latin-400.css";
import "@fontsource/zen-kaku-gothic-new/latin-500.css";
import "@fontsource/zen-kaku-gothic-new/latin-700.css";
import "@fontsource/zen-kaku-gothic-new/latin-ext-400.css";
import "@fontsource/zen-kaku-gothic-new/latin-ext-500.css";
import "@fontsource/zen-kaku-gothic-new/latin-ext-700.css";
import "@fontsource/share-tech-mono/latin-400.css";

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
    applyThemeColorSchemeToDocument(theme);
    render(theme);
  })
  .catch(() => {
    // Never leave the WebView without an app: index.html already carries the
    // default `data-theme`, and the provider falls back to gamenode.
    render(null);
  });
