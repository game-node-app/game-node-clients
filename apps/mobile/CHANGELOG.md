# mobile

## 1.18.0

### Minor Changes

- 1c38cea: Add the Daily ranking (overall and per mode, by period, with a following filter), the ranking result card after each daily, the weekly challenge with a friends ranking, and unlimited Cover and Specs practice. Requires the server's `add-daily-ranking-and-challenges` release to be deployed first.

## 1.17.5

### Patch Changes

- eb21b47: Send network requests through native HTTP to skip CORS preflights, removing an extra round trip from most requests. Changes the native fingerprint, so it needs a store release.

## 1.17.4

### Patch Changes

- 7468fab: Align the Awards ballot and results pages with the Figma design: event band with phase timeline, category list with progress, nominee grid cards, vote bar and mobile sheet, GOTY hero with vote shares, scoreboard and category tiles.

## 1.17.3

### Patch Changes

- 8dce44b: Rebuild the Home "Happening on GameNode" cards to match the design: new card surface with glow, eyebrow, headline and buttons, the Awards phase bars with the "Sua indicação" art, and the Retrospectiva hours figure with the labeled monthly bars.
- 8dce44b: Keep the Wrapped entry in the sidebar and Dock next to the yearly Recap, and move Wrapped to `/wrapped` (`/recap` on the web redirects there).

## 1.17.2

### Patch Changes

- 8b6c538: Rebuild the Recap page to match the design: flat sections for the hero nodes chart, most played game, play calendar heatmap, community, genres, platforms, backlog units, Awards and goal cards, and cap the Home recap card monthly strip on wide layouts.

## 1.17.1

### Patch Changes

- a69efc4: Restore OTA updates for installed apps: the pnpm migration changed the native fingerprint, so the Recap and Awards update never reached devices installed before it. The fingerprint now ignores the node_modules layout, so those devices receive the update again.

## 1.17.0

### Minor Changes

- c11f9ab: Integrate the 2026 Recap and Awards: a seasonal events section on the Home with Awards and Recap cards that follow the server phase, Awards/Retrospectiva entries in the web Dock and the mobile menu, community nominations, a ballot with game context, personal GOTY and a public shared ballot, results with a personal scoreboard, the new year Recap page with its five shareable 1080×1920 stories and the next-year goal, plus the Awards, Recap and goal notifications.
- c11f9ab: Localize Awards category content: web and mobile show the English or Portuguese (pt-BR) name and description of each Awards category when that translation exists, falling back to the base text otherwise, and the admin category form edits both locales and shows which locales each category covers.

## 1.16.2

### Patch Changes

- 263b0f8: Show OTA download progress and offer an optional restart when the update is ready, with retry actions for download and restart failures.

## 1.16.1

### Patch Changes

- 1ff726d: Reduce activity feed requests by using embedded card data and like state, and load achievement details only when opened.

## 1.16.0

### Minor Changes

- 01dcf23: Redesign the Wrapped cards and editor around the game covers: the cards lead with the hours and the top game's cover, show how much of the period it took and hide the comparison with the previous period unless asked for. The editor previews the real templates, and any card can use a photo or a video clip as its background, with an overlay intensity control for contrast.

## 1.15.1

### Patch Changes

- 3b044fb: Keep the picked clip loaded on the Recap screen: the video preview URL is created when the file is chosen instead of in an effect, so the preview stays ready for export.

## 1.15.0

### Minor Changes

- a521725: Redesign the Feats page with the profile level card, feats summary, almost-there and event sections, category/search/status filters, per-tier feat cards, tier details with obtained dates, and the code redeem flow that reveals the unlocked feat.

## 1.14.1

### Patch Changes

- b1d10a0: Fix header sizing on web and stop the mobile request progress bar from flashing on background refetches or pushing the page content down.

## 1.14.0

### Minor Changes

- 42fc7f2: Redesign web navigation with a Dock, Topbar and account menu, and add the notification center with a bell popover, a full inbox page and unread badges.

### Patch Changes

- 42fc7f2: Drop the "Custom game covers" coming-soon promise from the Supporter settings and the landing page.

## 1.13.0

### Minor Changes

- 53372ed: Add supporter profile perks: a badge, a title, an animated avatar border and a theme in the supporter's accent color on the profile, live "Playing now" presence from Steam, a supporters wall on the About page and mobile Supporter screen, and real perk controls in the Supporter settings. Free accounts keep a 5-collection creation limit with an inline upgrade notice in the collection form.

### Patch Changes

- 53372ed: Add a "level not found" 404 screen with pixel-art 404 and trending games.

## 1.12.0

### Minor Changes

- 694a0e5: Add custom game covers: choose an alternative IGDB cover per game, see other players' choices, and set how custom covers are displayed in appearance settings.
- 694a0e5: Let supporters upload looping videos for their profile avatar and banner, played in avatars and banners across web, admin and mobile. GIF avatar and banner uploads are no longer accepted.

## 1.11.0

### Minor Changes

- 2ac0d0a: Move the supporter experience into settings on web and mobile: a redesigned Supporter tab/screen with a plan picker, subscription management, an upcoming-features catalog with a profile preview, an always-free summary and inline checkout result banners. The standalone `/supporter` page is removed on both clients; all supporter links now open the settings surface.

## 1.10.3

### Patch Changes

- f12d14b: Keep the settings menu accessible on short screens and fix page scrolling on mobile web.

## 1.10.2

### Patch Changes

- e937b25: Remove the upcoming/recent release lists under the home release calendar, fix the clipped "today" ring and show the next 30 days.

## 1.10.1

### Patch Changes

- fd041ce: Fix the CI lint and test failures: remove an unused import from the landing page and relax the GOG copy length check.

## 1.10.0

### Minor Changes

- b046012: Add the home release timeline and expandable monthly calendar, with daily game details and localized release dates.

## 1.9.10

### Patch Changes

- 99b9236: Release mobile with the corrected live update URL.

## 1.9.9

### Patch Changes

- 71260a2: Clarify Nintendo account connection with a short copy-link guide before sign-in, translated instructions, and reduced-motion support.

## 1.9.8

### Patch Changes

- 914da99: Release the Capacitor 8 and Android API 36 mobile build verified on Android 16, retaining native system bar and keyboard inset handling.

## 1.9.7

### Patch Changes

- 14f916c: Target Android API 36 and upgrade Capacitor and native plugins to version 8, preserving system bar and keyboard inset handling.

## 1.9.6

### Patch Changes

- 5c23225: Fix the mobile language selector: remove it from the home screen, make the Preferences one apply the language, and start in the saved language. Release web, mobile and admin together.

## 1.9.5

### Patch Changes

- df82020: Trigger a mobile release for the current Android and OTA builds.

## 1.9.4

### Patch Changes

- f1b8fcc: Raise Android's minimum SDK to 24 to meet Google Play's app protection requirement.

## 1.9.3

### Patch Changes

- c1a41df: Fix Android APK installs by signing release APKs with the v2 signature scheme.

## 1.9.2

### Patch Changes

- 4bcd093: Publish mobile OTA bundles to R2 with the AWS CLI.

## 1.9.1

### Patch Changes

- 017ab11: Publish mobile OTA bundles through Wrangler's R2 CLI.

## 1.9.0

### Minor Changes

- ea91dad: Deliver compatible mobile web updates through R2, with background downloads and rollback to the installed app's shipped bundle.
