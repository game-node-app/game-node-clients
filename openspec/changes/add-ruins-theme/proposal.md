# Proposal

## Why

The Figma file `ikcThguwowTdynGz0L2YkS` (page `Themes`, node `5624:677`) defines **Ruins**, GameNode's third theme and its first light one: aged paper, grey-brown ink, inverted selection bars with a hard offset shadow, 1px rules, square markers, Zen Kaku Gothic New + Share Tech Mono, and a terminal-style boot sequence. It is inspired only by the palette, typography and rhythm of a game's menus: no logos, names, glyphs or marks from that game. The theme system from `add-app-themes-xbox` already supports palette themes and lazy screen packs, but every app forces Mantine's dark scheme, so a light theme cannot render correctly today.

## What Changes

- **Ruins theme definition** (`packages/ui/src/theme/themes/ruins.ts`, `colorScheme: "light"`, radius 0) with the Figma tokens, a pinned paper/dark/line scale and a `highlight` (tertiary) red. Registered after Xbox; Supporter-gated like Xbox.
- **Per-theme color scheme.** Web and mobile stop forcing `dark`: Mantine's color scheme follows the active theme's `colorScheme`, including SSR (`_document`) and the pre-paint restore. The generator emits the light-scheme Mantine variables (default/gray/placeholder) for light themes only, so `gamenode` and `xbox` output stays byte-identical.
- **Dark-assumption cleanup.** Text and surfaces that hard-code white/black on themed backgrounds (`text-white`, `c="white"`, `bg-black`, …) move to tokens (`text-foreground`, `accent-contrast`, …). Text over artwork/scrims stays white. `gamenode`/`xbox` render unchanged.
- **Theme style variables.** Optional `style` block in `defineTheme` (mono font, heading case/tracking, selection shadow, cover filter) emitted as `--gn-*` variables with neutral defaults.
- **Fonts.** Zen Kaku Gothic New and Share Tech Mono (OFL): `next/font/google` with `preload: false` on web, `@fontsource` on mobile. Only Ruins references them.
- **Ruins screen pack** (`screens: "ruins"`, lazy): restyles Mantine primitives and shared components through stable hooks (`data-slot`, Mantine static classes) scoped to `:root[data-theme="ruins"]`: inverted selection bars with 4px hard shadow, square markers, mono metadata, uppercase tracked headings, numbered section rules, sepia covers, window-bar modals, accent-bar notifications. Adds an `overlay` shell slot that renders the paper texture, the scanline and the boot sequence.
- **Ruins options in Appearance** (visible only while Ruins is active): Boot animation (Always / Once a day / Never, default once a day), Paper texture (on/off, default on), Scanline (on/off, default off). Per device.
- **Boot sequence**: terminal log of real cached data (level/XP, library, connections, imported sessions, feats, yearly goal, Daily, Awards, notifications) with `PENDENTE`/`OFFLINE` states, flash, lockup + OK, then cut to the app. Skippable (tap, click, Esc, Enter), reduced motion shows the static lockup for 400 ms, the log is `aria-hidden` and screen readers hear "GameNode carregado".
- **Appearance picker**: Ruins listed in the Supporter-only Special themes (next to Xbox) with a "New" badge, the "Sepia and graphite · light" description and the inspiration disclaimer.
- Not in scope: new layouts (Ruins reuses the default experience), server persistence, other light themes, a "Light"/"System" scheme for GameNode.

## Capabilities

### New Capabilities
- `ruins-theme`: Ruins palette, light scheme support, Ruins pack styling, options, boot sequence and picker entry on web and mobile.

### Modified Capabilities
<!-- app-theming (in add-app-themes-xbox) gains per-theme color scheme; captured in ruins-theme requirements until that change is archived. -->

## Impact

- **packages/ui**: `theme/themes/ruins.ts`, `theme/definitions.ts`, `defineTheme.ts` (`style`), `scripts/generate-themes.ts` (light-scheme + style variables), `theme/packs/types.ts` (`overlay` slot), new `theme/themes/ruins/screens/` pack, `theme/ruins/` preferences + boot data, settings Appearance tab, data-slot hooks on shared components, white-text cleanup.
- **packages/config-tailwind**: `foreground` color token.
- **packages/locales**: theme label/description, options, boot strings (en + pt-BR).
- **apps/web**: `_app.tsx` (color scheme sync, fonts), `_document.tsx` / pre-paint (scheme), `ThemePackStyles` anchor, shell overlay slot.
- **apps/mobile**: `App.tsx` (color scheme sync, overlay), fonts, native chrome (light status bar style already comes from the catalog), tests.
- **Dependencies**: `@fontsource/zen-kaku-gothic-new`, `@fontsource/share-tech-mono` (mobile).
