import type { ThemePackPresenters, ThemePackShell } from "#@/theme/packs/types";
import { RuinsOverlay } from "./overlay/RuinsOverlay";
// Side-effect import: the Ruins primitives stylesheet (Mantine classes and
// `data-slot` hooks, all scoped to `data-theme="ruins"`) only downloads with
// this lazy pack.
import "./RuinsPrimitives.module.css";

export const presenters: ThemePackPresenters = {};

/** Texture, scanline and boot sequence, mounted once at the app root. */
export const shell: ThemePackShell = { overlay: RuinsOverlay };
