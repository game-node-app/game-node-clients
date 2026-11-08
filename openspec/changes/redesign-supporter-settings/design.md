# Design

## Context

See `proposal.md` for motivation. This change builds on the uncommitted, unarchived `add-supporter-subscriptions` implementation in the working tree. Current state that shapes the approach:

- `packages/ui/src/components/supporter/` holds the billing hooks (`useSupporterOffers`, `useSupporterStatus`, `useSupporterCheckout`, `useSupporterManagement`), query keys, normalization, error mapping and `SupporterCancelDialog`. All of that is sound and stays. The presentation (`SupporterScreen`, `SupporterPlans`, `SupporterBenefits`, `SupporterStatusSection` with `page`/`settings` variants) uses plain Mantine `Alert`/`Card`/`Badge`/`Title` and does not match the settings modal.
- The settings modal (`SettingsModal`, `SettingsPanel`, `SettingsSidebar`) is web-only and lives in the URL (`?settings=<tab>&section=<id>`, `useSettingsModalState`). It renders nothing for signed-out users. On small screens it opens on the tab list (`showMobileMenu` starts `true`). Tabs are built from `SettingsCard`, `SettingsRow`/`SettingsIconTile`, `SettingsSection`, `SettingsPill` (with a `premium` violet tone) and `SettingsButton`.
- The pre-billing Premium tab (git `HEAD`) had a violet hero card, feature rows with locked switches, and `SettingsPremiumProfilePreview`, a mock of the user's profile card built from their real banner, avatar, username, follow counts and favorites. The billing change deleted the preview and the switches.
- Web already keeps old URLs alive with redirect-only pages: `pages/preferences/index.tsx` and `[category].tsx` call `router.replace("/home?settings=<tab>")`.
- game-node-server #244 (merged) returns Stripe checkout and portal sessions to `https://gamenode.app/home?settings=premium[&checkout=success|cancel]` and adds `supporterSince` to `GET /v1/billing/me`: the Stripe `start_date` of the subscription that currently grants entitlement, `null` unless `isSupporter`. The client wrapper is already regenerated from it.
- Before this change, `/supporter` is linked from the landing pricing CTA (`SupporterSection`, `/supporter?interval=<period>`), the About page and the mobile Preferences Supporter row. Neither the client supporter work nor these links have shipped yet.
- The web `/home` page has no auth guard. `SettingsModal` is mounted once in `GlobalAppShell`. `SignInScreen` returns to a safe `redirectTo` after sign-in.
- Mobile has no settings modal. Its settings screen is the Ionic `PreferencesPage` (inside `SessionAuth`), and `getCommonRoutes` already registers `/preferences/:category` (rendering `PreferencesPage` for any category). `AppUrlListener` runs `getAppUrlTarget` and then `getEquivalentDeepLink`, which prefixes the current tab. `useSupporterCheckoutTracking` (browser-close/resume → pending) lives in `apps/mobile`.
- `SessionAuth` (shared) redirects signed-out users to sign-in with `redirectTo` set to the current `asPath`, query included (web's router wrapper now exposes `asPath` without the locale prefix).

## Goals / Non-Goals

**Goals:**

- One shared, settings-styled supporter view rendered by the web settings tab and the mobile Preferences sub-screen.
- No supporter UI outside settings and no `/supporter` route on any client.
- A richer layout (hero, plan picker, subscription rows, feature catalog with a profile preview, a "free forever" card) that keeps the honesty rules: nothing unshipped looks available, for anyone.

**Non-Goals:**

- Changing billing hooks, query keys, polling bounds, error kinds or the checkout/portal/cancel/restore contract.
- Changing the landing pricing section or the About page beyond the link target.
- Implementing or gating any supporter feature. Server changes (already merged).

## Decisions

### D1. One shared `SupporterSettingsView`, thin hosts

Add `packages/ui/src/components/supporter/settings/` with `SupporterSettingsView` and its parts (D3). Props: `checkout?: "success" | "cancel" | null`, `interval?: "monthly" | "yearly" | null`, `onCheckoutStarted?: () => void`.

- Web: `SettingsPremiumTab` reads `checkout`/`interval` from `useRouter().query` (`#@/util`), narrows them, and renders the view.
- Mobile: a new page renders `<AppPage><SessionAuth><SupporterSettingsView …/></SessionAuth></AppPage>`, passing the parsed search params and `useSupporterCheckoutTracking` (route result wins over local pending, as today).

The checkout orchestration currently in `SupporterScreen` (mutation, error-to-message mapping, bounded `SupporterPendingNotice` polling, 409 → refetch) moves into the view. The action handlers in `SupporterStatusSection` (portal/cancel/restore error mapping) move into a small `useSupporterActions` hook so the hero and the subscription card share them. Then `SupporterScreen`, `SupporterPlans`, `SupporterBenefits` and `SupporterStatusSection` are deleted.

Alternatives: keep `SupporterScreen` and restyle it. Rejected, because its page-shaped API (title, signed-out card, layout) is what we are removing. Make the mobile page render `SettingsPremiumTab` directly. Rejected, because mobile needs the extra checkout-tracking props, and a tab reading the router is web-shaped.

### D2. No `/supporter`: one entry URL, one helper

The canonical supporter URL is the web settings tab: `/home?settings=premium`, with optional `interval=monthly|yearly` and `checkout=success|cancel`.

- **Helper.** Add `packages/ui/src/components/supporter/util/getSupporterSettingsHref.ts`: `getSupporterSettingsHref({ interval?, checkout? })` returns `/home?settings=premium[&interval=…][&checkout=…]`. Add `useSupporterEntryHref(interval?)`: once the session has resolved signed out (`authClient.useSession()` with `!isPending && !data`), it returns `${authPath}?redirectTo=${encodeURIComponent(settingsHref)}` (`useAuthPath`). While the session is pending, and when signed in, it returns the settings href. Because the first render (SSR and pending) always uses the settings href, there is no hydration mismatch; the modal guard below covers a click before the session resolves.
- **Links.** The landing pricing CTA uses `useSupporterEntryHref(period)` (Next `Link` keeps the active locale). The About page "Become a Supporter" link uses `useSupporterEntryHref()`. Subscribing needs an account, so a signed-out visitor goes straight to sign-in and returns to the Supporter tab with the interval, with no `/home` flash.
- **Modal guard.** `SettingsModal` today renders nothing for signed-out users, so a shared `?settings=…` link or a Stripe return after the session expired shows the plain home page. Wrap the modal in `<SessionAuth requireAuth={opened}>`: with no `settings` param it renders as today, and with one it reuses `SessionAuth`'s single redirect to sign-in with `redirectTo=asPath` (query included). This applies to every settings tab, which is the right behavior for all of them.
- **Web:** delete `apps/web/src/pages/supporter.tsx`. No `next.config` redirect is added; `/supporter` becomes a normal 404.
- **Server (merged, #244):** `successUrl` → `${websiteUrl}/home?settings=premium&checkout=success`, `cancelUrl` → `…&checkout=cancel`, checkout `returnUrl` and portal `returnUrl` → `${websiteUrl}/home?settings=premium`.
- **Mobile:** delete `pages/supporter.tsx` and its route. Add an exact `${prefix}/preferences/supporter` route **before** `${prefix}/preferences/:category` in `getCommonRoutes`, and restrict the category param to the real Preferences slugs so the catch-all cannot match `supporter` (Ionic's outlet keeps the last matching child). `PreferencesSupporterItems` links to `getTabAwareHref("/preferences/supporter")`. The Android App Link already matches every `gamenode.app` path, so the Stripe return arrives as `/home?settings=premium&checkout=…`. `getAppUrlTarget` maps `/home` (after locale stripping) with `settings=premium` to the real tab-prefixed route `/home/preferences/supporter`, dropping `settings`/`section` and keeping the rest of the query; `AppUrlListener` re-applies the current tab, so the screen opens where the user was. Without this the app would open the Home tab and lose the result. The old `/supporter` mapping and its tests are removed. Other `settings=<tab>` values are out of scope and fall through as today.

Alternatives: keep `/supporter` as a redirect-only page. Rejected: it keeps a route alive only for links we control, and the server no longer returns there. A `next.config` redirect for `/supporter` is the same thing in another file. Always linking signed-out visitors to `/home?settings=premium` and relying only on the modal guard. Rejected as the primary path, because it shows the home page for a moment before sign-in; it stays as the fallback.

### D3. Layout of the Supporter view

The view is a `@container` stack of settings primitives, so it adapts to the 960px modal panel, the full-screen web modal and the mobile page alike. It reuses the existing violet `premium` tone (`#9747ff` family, `SettingsPill tone="premium"`). Brand orange stays for primary buttons.

```
┌ Banner (only with a checkout result or an action error) ─────────────┐
│ [icon tile] Confirming your subscription…         [Check again]     │
└──────────────────────────────────────────────────────────────────────┘
┌ Hero card (violet border/gradient) ─────────────────────────────────┐
│ [crown tile]  Your support keeps GameNode online.   (● Free|Active) │
│               Everything you use today stays free…                  │
│ Free:      ┌ Monthly ─────┐ ┌ Yearly  2 months free ┐                │
│            │ R$ 9,90/month│ │ R$ 99,00/year         │                │
│            └──────────────┘ └───────────────────────┘                │
│            Final amount confirmed in checkout.  [Become a Supporter] │
│ Supporter: Thank you! Supporter · Yearly · renews on Mar 3, 2027    │
└──────────────────────────────────────────────────────────────────────┘
Your subscription                         (only when a subscription exists)
┌──────────────────────────────────────────────────────────────────────┐
│ [crown]  Plan            Supporter · Yearly billing       (Active)  │
│ [cal]    Renewal         Renews on Mar 3, 2027                       │
│ [card]   Billing         Payment method and invoices  [Manage ↗]    │
│ [x]      Cancel          Benefits continue until…     [Cancel]      │
└──────────────────────────────────────────────────────────────────────┘
Supporter features  (Coming soon)
Free: "Planned for Supporters. None of these are available yet."
Supporter: "On the way. You'll get each one automatically as it ships."
┌ Profile ──────────────────────────────┐  ┌ Preview · Coming soon ─┐
│ [brush] Supporter theme   (Coming soon)│  │  <profile preview>     │
│ [crown] Badge and title   (Coming soon)│  │                        │
│ [circle] Animated border  (Coming soon)│  └────────────────────────┘
│ [video] Video cover       (Coming soon)│
│ [live]  Live profile      (Coming soon)│
├ Library ──────────────────────────────┤
│ [photo] Custom covers     (Coming soon)│
│ [stack] Higher collection limit  (…)  │
├ Community ────────────────────────────┤
│ [heart] Supporters wall   (Coming soon)│
└───────────────────────────────────────┘
Always free
┌ ✓ Game library  ✓ Imports  ✓ Achievements  ✓ Reviews  ✓ Journal … ┐
Questions about billing? Write to …
```

Details:

- **Hero.** The status pill comes from `useSupporterStatus` and `getSupporterStatusKey`: Free, Active, Trial, Payment issue (danger), Ending on {date} (neutral). The plan picker uses two selectable option cards (`aria-pressed`, keyboard reachable, labeled with the interval and price) and replaces the segmented buttons. Prices come only from `displayAmount`. While loading, the price area shows a skeleton. If offers fail, it shows "Pricing unavailable" with retry and the subscribe button stays enabled only if an offer exists. On 503 the hero shows the "temporarily unavailable" copy and no enabled subscribe button.
- **Subscription card.** Only when `/billing/me` reports a subscription. Rows are as drawn. A past-due status swaps Cancel for an "Update payment method" row (portal). A pending cancellation swaps Cancel for "Keep subscription" (restore) and shows the end date. A canceled-but-paid subscription shows the end date only. Buttons disable while their mutation runs. Cancel keeps using `SupporterCancelDialog` through the injected `Modal`.
- **Feature catalog.** Rows are `SettingsRow` with a violet `SettingsIconTile`, title, one-line description and a `SettingsComingSoonBadge` on the right. They are not focusable, with no switch, lock or chevron. The section-level pill reinforces it. Groups: Profile (theme, badge + title, animated border, video cover, live profile), Library (custom covers, collection limit), Community (supporters wall; the former separate "supporters list" item is folded in). The same rows render for supporters; only the section description changes.
- **Profile preview.** Restore `SettingsPremiumProfilePreview` from git `HEAD` as `SupporterProfilePreview` (same data hooks, `inert` covers). Above it goes a caption "Preview · Coming soon" (`supporter.features.preview.*`). The badge reads "Supporter". The "Supporter since {year}" line comes back only when `supporterSince` is non-null (supporters), formatted as the year with `dayjs`; free users see the preview without it, and the client never derives a date from `periodEnd`, `createdAt` or anything else. The preview sits beside the catalog at ≥600px container width and below it otherwise. It is `aria-hidden` apart from its caption, so screen readers do not read a fake profile.
- **Always free.** One `SettingsCard` with a responsive 2/3-column grid of check items from `supporter.benefits.available.*`.
- **Banners.** A small `SupporterSettingsBanner` (`SettingsCard` + icon tile + tone border) replaces Mantine `Alert` for checkout success, pending (with the existing 4s/60s bounded polling and manual "Check again"), cancel and action errors. Banners carry `role="status"` (errors: `role="alert"`).

Alternatives: keep the plain locked-switch rows from the old tab. Rejected: a disabled switch reads as "you could turn this on if you paid", which is the dishonesty the billing change removed. A pill on a non-interactive row says the same thing without implying a control.

### D4. URL lifecycle in the settings modal

- `useSettingsModalState.navigate` also deletes `checkout` and `interval` when the current tab is `premium` and the next state is a different tab or closed. Other pages never see those params removed, so an unrelated page that happens to use `interval` is untouched.
- `SettingsModalContent` starts with `showMobileMenu = false` when the URL carries `checkout` (a checkout return), so full-screen web lands on the Supporter panel. Its back button still reveals the list.
- The view keeps the selected interval in local state seeded from `interval`, as `SupporterScreen` does today.

### D5. Mobile screen

`apps/mobile/src/pages/preferences/supporter.tsx` (or a flat `preferences_supporter.tsx`, matching what is simplest beside the existing `preferences.tsx`) uses `AppPage withSearch={false}` with a header title from `settings.tabs.premium.title`, wraps content in `SessionAuth`, and pads the view the way other settings-style mobile screens do (`McpGuideScreen`). `openExternalUrl` already resolves to `Browser.open` through `UI_HOOK_REGISTRY`.

### D6. Copy

- Add `supporter.features.groups.{profile,library,community}`, `supporter.features.<key>.description` for each catalog row, `supporter.features.descriptionFree`, `supporter.features.descriptionSupporter`, `supporter.features.preview.{caption,badge,since}` (`since`: "Supporter since {{year}}" / "Apoiador desde {{year}}"), `supporter.alwaysFree.{title,description}`, and hero/subscription row labels (`supporter.subscription.*`). Reuse the existing `supporter.benefits.upcoming.*` titles, `supporter.status.*`, `supporter.billing.*`, `supporter.checkout.*`, `supporter.errors.*` and `settings.premium.*`.
- Remove keys that only the deleted screen used (`supporter.eyebrow`, `supporter.meta.*`, `supporter.metaTitle`, `supporter.metaDescription`, `supporter.signedOut.*`, `supporter.plans.title`, `supporter.free.cta` if unused, `supporter.benefits.upcoming.list`). Before deleting any of them, grep for it: `supporter.heading`/`subheading` are used by the About page and stay.
- Keep `en.json` and `pt-BR.json` key sets identical and run `yarn locales:generate-types`.

## Risks / Trade-offs

- **Archive order:** this delta MODIFIES `supporter-subscriptions`, which only exists after `add-supporter-subscriptions` is archived → archive that change first; `openspec validate` already reports this.
- **Client and server must agree on the return URL** → The server side is merged. If the clients ship before #244 is deployed, a Stripe return to `/supporter` is a 404 and `supporterSince` is missing (normalized to `null`, so the line is simply hidden). Deploy the server first. No released client can start a checkout yet, so only test-mode sessions are exposed in between.
- **A click before the session resolves on the landing** → The href is the settings URL, and the modal guard sends a signed-out visitor to sign-in with the query intact. Verify it manually.
- **The modal guard applies to every settings tab** → Intended: settings are account settings. `SessionAuth` already avoids redirect loops on the auth page.
- **A profile preview could be read as an active perk** → Explicit "Preview · Coming soon" caption, the section pill, no interactivity, a "since" year only from the server, and the same treatment for supporters.
- **Ionic route matching:** `IonRouterOutlet` keeps the **last** matching child, so a catch-all `/preferences/:category` swallows `/preferences/supporter` even when the exact route is registered first → the category param is restricted to the real Preferences slugs, and a route test replicates Ionic's last-match rule.
- **Larger tab on small screens** → `@container` breakpoints stack columns, and the plan picker cards wrap. Check at 375px in both the web modal and the mobile page.
- **Deleting presentation tests loses coverage** → Every state covered by `supporter-screen.test.tsx` and `supporter-presentation.test.tsx` is re-covered against the new view before the old suites are deleted.

## Migration Plan

Ships in the same release as `add-supporter-subscriptions` (both are unreleased), so no user has a bookmarked `/supporter` URL. Order: deploy game-node-server #244, then release web and mobile. Rollback is reverting the client build; if the server change is rolled back too, revert both together. No data, API or cache migration.
