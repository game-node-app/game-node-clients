# Proposal

## Why

`game-node-server` adds a Stripe-backed `supporter` plan and exposes a billing API, but the clients still send every supporter to Patreon. They also lack the `/supporter` page the server redirects to after checkout, have no way to start, manage or cancel a subscription, and advertise Premium features that do not exist yet. This change connects the existing web and mobile clients to that billing contract and removes the dead Patreon path.

## What Changes

- Refresh `packages/wrapper/input/server_swagger.json` from the server output that contains the six `/v1/billing/*` routes, regenerate `@repo/wrapper`, and consume the generated billing DTOs and service instead of hand-written HTTP calls.
- Add a shared supporter feature in `packages/ui`: billing hooks (`offers`, `me`, `checkout`, `portal`, `cancel`, `restore`), offer/plan presentation, current-subscription status, confirmation and result states, and error mapping for 401, 404, 409 and 503.
- Add a public `/supporter` page on web. It reads `?checkout=success|cancel`, refreshes `GET /v1/billing/me`, shows the activation state, and is the single place for buying and managing a subscription. The server owns the success, cancel and return URLs and already points them at `https://gamenode.app/supporter`.
- Rework the web landing supporter section: prices come from `GET /v1/billing/offers` (BRL for Brazil, USD elsewhere), the CTA opens `/supporter` with the selected interval, and the Patreon link is removed. The landing no longer hardcodes R$ 9.90 / R$ 99.00 or claims that checkout does not exist.
- Rework the web settings Premium tab into the real supporter subscription state and management surface: current status, period end, pending cancellation, starting a plan, Customer Portal, cancel at period end and restore. The interactive locked feature switches and the Patreon CTA are removed; upcoming benefits appear as a non-interactive "Coming soon" list, and the tab is labeled Supporter/Apoiador.
- Add the same supporter experience to mobile: a `/supporter` route reachable from a new Supporter section in Preferences, checkout opened in the system in-app browser (`@capacitor/browser`), status refreshed when the browser closes or the app resumes, and the existing `https://gamenode.app` App Link routes `/supporter?checkout=success` back into the app.
- Remove every remaining Patreon destination: the landing plan CTA, the Premium settings CTA, and the About page link.
- Add English and Brazilian Portuguese copy under a `supporter` namespace, align Premium copy with the Supporter plan, and regenerate locale types.
- Keep the unshipped benefits visible as a roadmap: the supporter badge, theme, video cover, animated border, custom covers, live profile, supporters wall and collection limit are labeled "Coming soon" / "Em breve", clearly separated from what is available today. They are not usable or gated in this change, and nothing free becomes paid. The supporter system ships first; those benefits are implemented in the following changes.
- Out of scope: server changes, admin and desktop clients, the supporter badge, any premium feature or feature gate, invoices/refunds UI, tax handling, Stripe SDK or price/amount/currency handling in the clients, and native iOS work.
- No API-breaking client change. The user-visible removal of the Patreon purchase path is intentional and is replaced by the in-app Stripe flow.

## Capabilities

### New Capabilities

- `supporter-subscriptions`: how the web and mobile clients present supporter offers, start checkout, return from checkout, display the server-authoritative entitlement, manage or cancel a subscription, and degrade when billing is unavailable or not configured.

### Modified Capabilities

None. The only published specs are `blog-reading` and `blog-editorial-access`; `web-landing` exists only inside the in-flight `implement-web-landing-figma` change, so this change supersedes its Patreon destination through the new capability rather than editing a main spec.

## Impact

- **Wrapper:** refresh `packages/wrapper/input/server_swagger.json` and regenerate `packages/wrapper/src/server` (`BillingService`, billing models), then update `packages/wrapper/src/server/index.ts` exports as generated.
- **Shared UI:** new `packages/ui/src/components/supporter/**` (hooks, views, components, query keys), rewired `SettingsPremiumTab`, `settingsTabs`/`SettingsTabContent` wiring, and barrel exports.
- **Web:** `apps/web/src/pages/supporter.tsx`, `apps/web/src/components/landing/SupporterSection.tsx`, the landing footer Premium anchor and copy, and the About page Patreon button/copy.
- **Mobile:** `apps/mobile/src/pages/supporter.tsx`, `getCommonRoutes`, `pages/preferences.tsx` and a new Preferences supporter section, `AppUrlListener`/`getAppUrlTarget` locale-prefix handling, plus browser-close/resume invalidation.
- **Locales:** new `supporter.*` keys and revised `settings.premium.*`/`landing.presentation.supporter.*` keys in `en.json` and `pt-BR.json`; regenerated `packages/locales/src/generated`.
- **Observability/ops:** no new environment variables or secrets in the clients; the server must have Stripe configured, otherwise clients show the 503 state. Checkout requires the deployed `/supporter` page and the server's existing success/cancel URLs.
