# mobile

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
