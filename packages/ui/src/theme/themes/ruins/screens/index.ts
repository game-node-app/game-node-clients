import type { ThemePackPresenters, ThemePackShell } from "#@/theme/packs/types";
import { RuinsOverlay } from "./overlay/RuinsOverlay";
// The Ruins primitives stylesheet (Mantine classes and `data-slot` hooks, all
// scoped to `data-theme="ruins"`) downloads with this lazy pack. The local
// anchor class is exported and rendered so the module is never tree-shaken:
// side-effect-only CSS Modules export nothing and Vite dropped the file.
import styles from "./RuinsPrimitives.module.css";

/** Local class the overlay renders; the pack anchor references it too. */
export const PRIMITIVES_ANCHOR_CLASS = styles.primitivesAnchor as string;

export const presenters: ThemePackPresenters = {};

/** Texture, scanline and boot sequence, mounted once at the app root. */
export const shell: ThemePackShell = { overlay: RuinsOverlay };
