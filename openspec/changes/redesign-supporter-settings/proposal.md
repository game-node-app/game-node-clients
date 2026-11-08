# Proposal

## Why

The in-flight `add-supporter-subscriptions` work moved buying and managing a subscription into a standalone `/supporter` page (web and mobile) and reduced the settings Supporter tab to a plain status card plus a grey "Coming soon" text list. The result is honest but bland and sits outside the settings screen where Premium used to live. This change brings the supporter experience back into each app's settings, rebuilt with the settings modal's visual language (cards, icon rows, pills, a profile preview), keeps every unshipped feature clearly marked "Coming soon", including for people who already subscribe, and removes the `/supporter` route entirely.

## What Changes

- Make the settings Supporter tab the only supporter surface. On web it is the `premium` tab of the settings modal; on mobile it is a new Supporter screen under Preferences (`/preferences/supporter`, tab-aware). The standalone supporter screen (`SupporterScreen`) and its page layout are removed.
- **BREAKING (URL):** delete the web `/supporter` page and the mobile `/supporter` route. No client keeps a `/supporter` route, redirect or App Link mapping. The canonical supporter URL becomes `/home?settings=premium`, with optional `interval=monthly|yearly` and `checkout=success|cancel`.
- Add one shared builder for that URL (`getSupporterSettingsHref`) and a hook (`useSupporterEntryHref`) that returns the sign-in URL with the supporter settings as `redirectTo` when the visitor is known to be signed out. Subscribing needs an account, so signed-out visitors go straight to sign-in and come back to the Supporter tab with their interval.
- Update every in-app link that pointed at `/supporter`: the landing pricing CTA (keeps the selected interval), the About page "Become a Supporter" link, and the mobile Preferences Supporter row.
- Make the web settings modal send signed-out visitors to sign-in when a `?settings=<tab>` URL is opened, instead of silently rendering nothing. This covers shared links, the Stripe return after a session expired, and the landing CTA while the session is still loading.
- **Server support is merged (game-node-server #244):** Stripe success, cancel and portal return URLs now point at `/home?settings=premium[&checkout=success|cancel]`, and `GET /v1/billing/me` returns `supporterSince` (start of the current continuous subscription, `null` unless `isSupporter`). The mobile App Link for that URL (with or without a locale prefix) opens `/preferences/supporter` with `checkout`/`interval` preserved.
- Redesign the Supporter tab with the settings primitives:
  - a hero card with the crown tile, a status pill, and either the plan picker (monthly/yearly selector, server price, subscribe button) or the active plan summary;
  - a "Your subscription" card of settings rows: plan and interval, renewal or end date, manage billing, cancel or keep subscription, payment issue;
  - a "Supporter features" section restoring the old two-column layout: feature rows with an icon tile, title, description and a "Coming soon" pill instead of the old locked switches, next to the user's real profile preview, labeled as a preview of upcoming features. For supporters the preview shows "Supporter since {year}" from the server's `supporterSince`; it never shows a date the server did not return;
  - a compact "Always free" card listing what stays free, and the existing billing-help footer.
- Show every upcoming feature as "Coming soon" to everyone, supporters included. For supporters the copy says the features arrive automatically as they ship; nothing is shown as unlocked or usable.
- Show checkout results (success, activation pending with bounded polling, cancel) and billing errors as settings-style banners inside the tab. Opening the web settings modal from a checkout return goes straight to the Supporter panel on small screens instead of the tab list.
- Clear `checkout`/`interval` from the URL when the settings modal closes or changes tab, so a stale checkout result does not show up again.
- Update copy in `en.json` and `pt-BR.json`: feature titles and descriptions, preview labels, supporter-specific "on the way" copy and banner titles. Remove keys used only by the deleted standalone screen.
- Unchanged: billing hooks, query keys, error mapping, checkout/portal/cancel/restore behavior, the mobile browser-close/resume tracking, and the landing pricing section's layout and copy.
- Out of scope: server changes (already merged), implementing or gating any supporter feature, admin/desktop clients.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `supporter-subscriptions`: the supporter surface moves from a standalone `/supporter` page to the settings Supporter tab (web) and the Preferences Supporter screen (mobile). `/supporter` is removed; all entry points and Stripe returns use `/home?settings=premium`. The mobile surface requires sign-in. Upcoming features are shown as a rich, non-interactive catalog that stays "Coming soon" for supporters too. This capability is introduced by the unarchived `add-supporter-subscriptions` change, so this change must be archived after it.

## Impact

- **Shared UI (`packages/ui`):** new supporter settings view and its parts under `components/supporter/` (hero/plan picker, subscription card, feature catalog, profile preview, always-free card, banners), `getSupporterSettingsHref` + `useSupporterEntryHref`, rewritten `SettingsPremiumTab`, deletion of `SupporterScreen`, `SupporterPlans`, `SupporterBenefits` and `SupporterStatusSection`; `useSettingsModalState` and `SettingsModal` handle supporter query params and signed-out visitors; barrels regenerated.
- **Web (`apps/web`):** delete `pages/supporter.tsx`; the landing CTA and the About link use the supporter entry href.
- **Mobile (`apps/mobile`):** delete `pages/supporter.tsx` and its route, add a Preferences Supporter page and an exact `/preferences/supporter` route registered before `/preferences/:category`, repoint `PreferencesSupporterItems`, map `/home?settings=premium` App Links in `getAppUrlTarget` and drop the `/supporter` mapping; rewrite the affected Vitest suites (`supporter-screen`, `supporter-page`, `supporter-presentation`, `get-common-routes`, `PreferencesSupporterItems`, `getAppUrlTarget`).
- **Locales:** `supporter.*` keys revised in both languages; regenerated types.
- **Wrapper:** `server_swagger.json` refreshed from game-node-server `main`; the only contract change is `BillingMeResponseDto.supporterSince: string | null` (already regenerated).
- **Server deploy order:** game-node-server #244 must be deployed no later than this client release.
- **No dependency or environment change on the client.**
