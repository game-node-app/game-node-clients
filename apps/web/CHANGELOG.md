# web

## 1.16.0

### Minor Changes

- 42fc7f2: Redesign web navigation with a Dock, Topbar and account menu, and add the notification center with a bell popover, a full inbox page and unread badges.

### Patch Changes

- 42fc7f2: Update the About page with the currently supported platforms, the in-app Supporter plan and a GameNode + AI section.
- 42fc7f2: Drop the "Custom game covers" coming-soon promise from the Supporter settings and the landing page.

## 1.15.0

### Minor Changes

- 53372ed: Add supporter profile perks: a badge, a title, an animated avatar border and a theme in the supporter's accent color on the profile, live "Playing now" presence from Steam, a supporters wall on the About page and mobile Supporter screen, and real perk controls in the Supporter settings. Free accounts keep a 5-collection creation limit with an inline upgrade notice in the collection form.

### Patch Changes

- 53372ed: Add a "level not found" 404 screen with pixel-art 404 and trending games.

## 1.14.0

### Minor Changes

- 694a0e5: Add custom game covers: choose an alternative IGDB cover per game, see other players' choices, and set how custom covers are displayed in appearance settings.
- 694a0e5: Let supporters upload looping videos for their profile avatar and banner, played in avatars and banners across web, admin and mobile. GIF avatar and banner uploads are no longer accepted.

## 1.13.0

### Minor Changes

- 2ac0d0a: Move the supporter experience into settings on web and mobile: a redesigned Supporter tab/screen with a plan picker, subscription management, an upcoming-features catalog with a profile preview, an always-free summary and inline checkout result banners. The standalone `/supporter` page is removed on both clients; all supporter links now open the settings surface.

## 1.12.3

### Patch Changes

- 63bffa2: Refresh the GameNode Daily web experience with redesigned puzzle screens, clearer how-to-play guidance, and updated hint and result flows.

## 1.12.2

### Patch Changes

- b866fea: Open the settings modal on mobile web on the settings list instead of the first tab's page, and use an icon back button in the settings page header.

## 1.12.1

### Patch Changes

- f12d14b: Keep the settings menu accessible on short screens and fix page scrolling on mobile web.

## 1.12.0

### Minor Changes

- 3798428: Replace the sidebar avatar menu with a compact menu and a new Settings modal (profile, connections, library, notifications, privacy and sessions, appearance and language, MCP apps, Premium). Old `/preferences` links open the matching tab.

## 1.11.2

### Patch Changes

- e937b25: Remove the upcoming/recent release lists under the home release calendar, fix the clipped "today" ring and show the next 30 days.

## 1.11.1

### Patch Changes

- fd041ce: Fix the CI lint and test failures: remove an unused import from the landing page and relax the GOG copy length check.

## 1.11.0

### Minor Changes

- b046012: Add the home release timeline and expandable monthly calendar, with daily game details and localized release dates.

## 1.10.3

### Patch Changes

- 71260a2: Clarify Nintendo account connection with a short copy-link guide before sign-in, translated instructions, and reduced-motion support.

## 1.10.2

### Patch Changes

- 715cda8: Show the web login screen full-width without the app sidebar and header.

## 1.10.1

### Patch Changes

- 5c23225: Fix the mobile language selector: remove it from the home screen, make the Preferences one apply the language, and start in the saved language. Release web, mobile and admin together.

## 1.10.0

### Minor Changes

- 91f05a1: Add Epic Games connection onboarding and mapping tools.

## 1.9.1

### Patch Changes

- 7b4f53f: Fix blog article body colors on the dark theme by using inverted prose styles.

## 1.9.0

### Minor Changes

- 74c5d36: Add the OAuth consent screen with scope selection and the MCP connection setup experience to web.

## 1.8.0

### Minor Changes

- 5762d5d: Migrate web and admin authentication from SuperTokens to Better Auth.

## 1.7.28

### Patch Changes

- c858b82: Release the latest merged platform achievement catalog for web and admin through the explicit app release pipeline.
