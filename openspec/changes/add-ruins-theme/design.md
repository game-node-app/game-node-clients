# Design

## Context

- Source of truth: Figma `ikcThguwowTdynGz0L2YkS`, page `Themes` (`5624:677`). Frames:
  - System: `5627:677` Fundamentos (tokens, type, motifs), `5626:677` Componentes (menu item, buttons, status chips, section header, game card, progress), `5634:794` Componentes II (window bar, tabs, key hint, rating squares, input with block cursor, ON/OFF toggle, checkbox, activity cells, dotted data row, loading squares, focus brackets, avatar, segmented XP bar, system dialog, system message, feat, game session, platform achievement, game list row, notification read/unread, empty state, tooltip, nav group).
  - Boot: `5638:694`, `5638:743`, `5638:836`, `5638:973` (mobile 0.00/0.40/1.20/1.90 s), `5639:716` (web 1.20 s), `5639:1053` (choreography + rules).
  - Web: `5642:757` Início, `5644:874` Jogo, `5647:1026` Biblioteca · registro, `5651:1351` Configurações · Aparência.
  - Mobile: `5652:1346` Daily capa, `5653:1364` Perfil, `5654:1369` Feitos, `5655:1440` Notificações + toast, `5655:1626` Daily · confirmar pulo, `5657:1507` open decisions.
- Tokens (Figma variables): background `#CDC8B0`, surface `#DAD4BB`, surface-raised `#E4DFCA`, text `#3F3C34`, text-muted `#57534A`, border `#A9A48E`, border-strong `#7F7A67`, accent `#4E4B42`, accent-contrast `#DAD4BB`, focus `#2F2D27`, highlight `#B0452F`, success `#4F6440`, warning `#7A5A1D`, danger `#9E3F2B`. Radius 0.
- Every app passes `forceColorScheme="dark"`; Mantine sits outside `SupporterThemeProvider`.
- ~170 `text-white` / `c="white"` usages assume a dark background.

## Decisions

### 1. Ruins is a palette theme plus a lazy screen pack, no new experience

The Figma screens show existing features (home, game, library entry, settings, Daily, profile, feats, notifications) in Ruins styling, not new layouts. Ruins keeps `experience: "default"` and sets `screens: "ruins"`. The pack carries CSS and an `overlay` shell slot; it replaces presenters only where CSS hooks cannot express the design.

### 2. Color scheme follows the theme

- `MantineProvider` drops `forceColorScheme` and uses a memory `colorSchemeManager` (never persisted; the theme is the source of truth) whose `get()` reads the active theme's scheme from `document.documentElement.dataset.theme` via the catalog, with `defaultColorScheme="dark"`.
- `ThemeColorSchemeSync` (in `@repo/ui`, rendered inside the theme provider in web and mobile) calls `setColorScheme(entry.colorScheme)` whenever the theme changes.
- Web SSR: `_document` renders `data-mantine-color-scheme` from the same cookie theme; the pre-paint script sets it with `data-theme`. Static pages may paint dark for one frame before the restore — same trade-off already accepted for palettes.
- Generator: for `colorScheme: "light"` only, emit `color-scheme: light` and Mantine light variables mapped to tokens: `--mantine-color-default` (paper), `-default-hover`, `-default-color` (text), `-default-border` (border), `--mantine-color-placeholder` (text muted), `--mantine-color-gray-0..9` (paper → text ramp), `--mantine-color-anchor` (text), `--mantine-color-white` stays white. Dark themes output does not change (`pnpm themes:check` must pass with an unchanged diff for `gamenode`/`xbox` blocks).
- Generator `darkDefaults` for light themes blends surface → text (instead of lightening toward white); Ruins also pins its `dark`, `paper`, `line`, `nav` and status-text overrides explicitly.

### 3. Dark-assumption cleanup keeps parity

Add Tailwind `foreground: var(--gn-text)`. Replace `text-white` / `c="white"` / `c={"white"}` on themed surfaces with `text-foreground` / `c="var(--gn-text)"`; on accent fills use `accent-contrast`. Keep white on artwork, video and scrim overlays (mark nothing; it is white by intent). `bg-black`/`bg-white` → tokens when they are surfaces. Because `gamenode`/`xbox` text is `#FFFFFF`, both stay pixel-identical.

### 4. Style variables

`defineTheme` gains optional `style`: `fontMono`, `headingTransform`, `headingTracking`, `selectionShadow`, `coverFilter`, `texture` (boolean). The generator emits `--gn-font-mono`, `--gn-heading-transform`, `--gn-heading-tracking`, `--gn-selection-shadow`, `--gn-cover-filter`, `--gn-highlight` with neutral defaults (`inherit`/`none`/`normal`) for themes that omit them. Shared code may consume them (e.g. game cover `filter: var(--gn-cover-filter)`), so other themes are unaffected.

### 5. Ruins pack styling

- Files under `packages/ui/src/theme/themes/ruins/screens/` (excluded from barrels like Xbox). Global rules live in a CSS Module using `:global(:root[data-theme="ruins"]) …` so they only apply while Ruins is active and only download with the pack. A web anchor (`@repo/ui/theme/anchors/ruins-screens`) lets `ThemePackStyles` emit the stylesheet in SSR, like Xbox.
- Allowed selectors: Mantine static classes (`.mantine-Button-root`, …, a public Styles API) and `data-slot` hooks added to shared components (`nav-item` + `data-active`, `section-title`, `game-cover`, `settings-nav-item`, `card`). No selectors on our generated CSS Module class names.
- Motifs: radius 0; selected = `accent` bg + `accent-contrast` text + `box-shadow: 4px 4px 0 var(--gn-line-strong)` (no blur); 6–8px square markers via `::before`; 1px rules with end square + thick end dash for section headers (CSS counters give the `01`, `02` indices); mono (`--gn-font-mono`) for metadata, badges, key hints, numbers; uppercase tracked headings (Display +24%, Title +14%, Menu +6%).

### 6. Overlay slot: texture, scanline, boot

`ThemePackShell.overlay` is a component rendered once by each app root (web `_app`, mobile `App`) when present. Ruins' overlay renders:
- **Paper texture** (option on): fixed, `pointer-events: none`, grain (SVG `feTurbulence` data URI, ~7%) + 28px grid at 5% using `color-mix(var(--gn-text) …)`.
- **Scanline** (option on): a band that sweeps the viewport while `useIsFetching() > 0`; hidden under `prefers-reduced-motion`.
- **Boot sequence** (see 7).

### 7. Boot sequence

- Runs on cold start (mobile) / first app mount (web) when Ruins is active and the option allows: `always`, `daily` (once per local calendar day; last run stored), `never`. Internal navigation never reruns it.
- Timeline (`5639:1053`): cursor 0–0.2 s; log 0.2–1.45 s (one line every ~35 ms, top-down, old lines fade); flash ~1.45–1.55 s; lockup + `OK` 1.55–2.0 s; cut to the app by ~2.2 s.
- Lines show only data already in the React Query cache (`queryClient.getQueryData` for known keys: user level/XP, library count, connections, imported sessions, feats, yearly goal, Daily, Awards, notifications). Missing data → `PENDENTE`; offline → connections show `OFFLINE` in highlight. Nothing blocks or fetches.
- Tap/click/Esc/Enter skip at any time. `prefers-reduced-motion`: skip the log and show the static lockup for 400 ms. Log is `aria-hidden`; a live region announces `GameNode carregado` (translated).
- On mobile the native splash uses the theme's own colors (see "Native splash per theme (generated)") and the timeline starts only after it is gone, so the splash hands off to the boot.

### 8. Preferences

`packages/ui/src/theme/ruins/preferences.ts`: `useRuinsPreferences()` → `{ bootAnimation: "always" | "daily" | "never", paperTexture: boolean, scanline: boolean }` + setters, persisted per device in `localStorage` (`gn-ruins-prefs`, JSON, try/catch, defaults `daily`/`true`/`false`) with a `useSyncExternalStore` subscription so the overlay updates live. Works in the mobile WebView without Capacitor Preferences because nothing reads it before the JS app starts.

### 9. Fonts

Web: `next/font/google` `Zen_Kaku_Gothic_New` (400/500/700) and `Share_Tech_Mono` (400), `preload: false`, exposed as `--gn-font-zen` / `--gn-font-share-tech-mono` on `:root` beside Inter. Ruins `font`: `var(--gn-font-zen, "Zen Kaku Gothic New"), var(--gn-font-roboto, Roboto), sans-serif`; `style.fontMono`: `var(--gn-font-share-tech-mono, "Share Tech Mono"), ui-monospace, monospace`. Mobile: `@fontsource/zen-kaku-gothic-new` (400/500/700) and `@fontsource/share-tech-mono` imported in `main.tsx`.

## Native splash per theme (generated)

- **Where the colors live**: `overrides.mobile.splashBackground` (existing), `splashBrand` and `splashLogoInner` in the theme definition. Defaults: background = `tokens.background`, brand = `tokens.accent`, logo inner = `tokens.text` on dark themes / `tokens.surface` on light ones. The generator resolves them into the catalog as `native.splash` (`{ background, brand, logoInner }`). GameNode (`#1A1A1A` / `#F15025` / `#FFFFFF`) and Xbox (`#0F0F0F` / `#107C10` / `#FFFFFF`) are unchanged; Ruins is `#CDC8B0` / `#4E4B42` / `#DAD4BB` (ink logo on paper).
- **Android generator**: `apps/mobile/scripts/native-splash.ts` (CLI `generate-native-splash.ts`, `pnpm --filter mobile splash:generate` / `splash:check`; the root `themes:generate` and `themes:check` run it after the theme generator) writes `res/values/splash_themes.xml` (colors, plus an `AppTheme.NoActionBarLaunch.<Theme>` style per non-default theme), `res/drawable/ic_splash_logo_<id>.xml` (copy of the hand-written `ic_splash_logo.xml` geometry with the theme's colors) and `SplashThemes.java` (theme id to resources). `SplashPalette` only calls `SplashThemes.forId(id)`, falling back to the default. Adding a theme needs no native code: define the theme, run `pnpm themes:generate`.
- **Default theme resources** (`splash_background`/`splash_brand`/`splash_logo_inner`, `AppTheme.NoActionBarLaunch`) stay the ones the manifest launch theme and the pre-Android-12 `splash_launch.xml` use, so before Android 13 other themes start with the default system splash and `EntrySplashView` then paints theirs. This is a native change: it moves the native fingerprint, so it needs a store build.
- **Boot hand-off**: new optional UI hook `useEntrySplashDone()` (default `true`); mobile registers one backed by `whenSplashDone()`. `RuinsBootSequence` decides as before, but while the splash is not done it renders only the paper first frame (`data-slot="ruins-boot-waiting"`) and mounts the timeline, reduced-motion hold and skip handlers once it is.

## Surface pairs and theme scopes

Ruins exposed components that hard-code one half of a pair: a dark fill with the theme's text color, or the reverse. Two mechanisms keep new components from mixing them.

- **Surface pairs**: a fill token and the text that sits on it are always taken together. App chrome uses `panel` + `text-*` tones; imagery (covers, banners, hero art, carousel cards) uses the **media pair**: `--gn-media-scrim` (overlay color, applied with opacity), `--gn-media-scrim-strong` (deeper gradient end), `--gn-media-fade` (color imagery fades into, card base), `--gn-media-text`, `--gn-media-text-muted`, `--gn-media-text-dim` and `--gn-media-placeholder` (empty cover slot). Overrides live in `overrides.media`. Defaults follow `colorScheme`: dark themes get a black scrim, `#0A0A0A` strong/fade, white text and `#1A1A1A` placeholder (the literals components hard-coded, pinned for `gamenode`/`xbox`); light themes get a paper wash (`tokens.background` scrim and fade, `tokens.surface` strong) with ink text (`tokens.text`/`tokens.textMuted`). Tailwind: `bg-media-scrim`, `bg-media-scrim-strong`, `bg-media-fade`, `bg-media-placeholder`, `text-media`, `text-media-muted`, `text-media-dim`, plus the `media-ink` utility (text color and Mantine `--mantine-color-text`/`dimmed`) for a container that holds Mantine text over a scrim. `MEDIA_BUTTON_STYLE` inverts a Mantine `variant="white"` button on a scrim. Filled accent chips pair `accent` with `accent-contrast`.
- **Theme scopes**: surfaces that are dark by design (Premium, About, landing, the awards share sheet) opt into `<ThemeScope>` instead of hard-coding dark colors. The generator emits `[data-gn-scope="<theme id>"]` for every theme (and `[data-gn-scope="dark"]` as an alias of the default dark theme) with the same variable block as `:root[data-theme]`, plus the Mantine color-scheme variables that Mantine otherwise resolves once on `:root` (`--mantine-color-default*`, `-filled`, `-light`, gray ramp, ...), produced with Mantine's own resolver and the flat palettes of `DEFAULT_MANTINE_THEME`. `ThemeScope` renders `data-gn-scope` and `data-mantine-color-scheme`. Portals (modals, popovers) render at `document.body` and stay on the active theme. Normal app UI is never scoped.
- **Rule**: new components take either a theme token pair or a scope, never a fixed color beside a theme token. Exported share artwork (recap cards, awards ballot cards) keeps its own self-contained palette.

## Risks / Trade-offs

- **Mantine light scheme surprises** (components using light-only defaults): mitigated by mapping gray/default variables to tokens and by browser review of the Figma screens.
- **Global pack CSS on Mantine classes** couples Ruins to Mantine's Styles API; it is versioned and documented, and scoped to Ruins only.
- **White text audit misses**: browser review on both apps covers the Figma screens plus shell, settings, game, library, profile, notifications.
- **Trademark**: the label is "Ruins" (provisional), no game assets; the disclaimer is shown in the picker.
