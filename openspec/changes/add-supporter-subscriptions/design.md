# Design

## Context

See `proposal.md` for motivation and the server change `game-node-server/openspec/changes/add-supporter-subscriptions` for the HTTP contract (`handoff-clients.md`). Current state that shapes the approach:

- The generated wrapper still reflects a server without billing. `packages/wrapper/input/server_swagger.json` must be replaced with the server output that contains `GET /v1/billing/offers`, `GET /v1/billing/me`, `POST /v1/billing/checkout`, `POST /v1/billing/portal`, `POST /v1/billing/cancel` and `POST /v1/billing/restore`, then regenerated with `yarn wrapper:generate`.
- The server's success, cancel and return URLs are fixed to `https://gamenode.app/supporter?checkout=success|cancel` and `https://gamenode.app/supporter`. There is no `/supporter` page in `apps/web` today, so a real checkout would redirect to a 404.
- The web landing (`apps/web/src/components/landing/SupporterSection.tsx`) hardcodes R$ 9.90 / R$ 99 and sends the supporter CTA to Patreon. The settings modal's Premium tab (`packages/ui/src/components/settings/tabs/SettingsPremiumTab.tsx`) has no billing API, always renders a "not a subscriber" state, uses fake locked feature switches and links to Patreon. `apps/web/src/pages/about.tsx` has another Patreon button.
- Mobile (`apps/mobile`) has no premium or supporter surface at all. Preferences is an Ionic page composed of section components (`apps/mobile/src/pages/preferences.tsx`), routes are registered per tab in `getCommonRoutes`, and the app already uses `@capacitor/browser` for external flows. The Android manifest verifies `https://gamenode.app` App Links, and `AppUrlListener` already maps a `gamenode.app` path to a tab-aware in-app route.
- Web and mobile share UI through `packages/ui` and inject framework behavior through `UIProvider` (`useRouter`, `Link`, `Modal`, hooks). Web uses cookies and transactional React Query defaults (`staleTime: Infinity`, `refetchOnMount: false`); mobile uses cookie or bearer depending on the platform and `refetchOnMount: true`.
- The server's generated `BillingOfferDto.interval` and `currency` are emitted as `object` in Swagger (the DTOs use TypeScript unions without enum metadata in the response schema). The generated client types must be narrowed locally; they cannot be trusted to be `"monthly" | "yearly"` or `"BRL" | "USD"`.
- The `implement-web-landing-figma` change is in flight but not archived. Its landing spec still requires a Patreon destination. This change supersedes that specific behavior through the new capability; it does not edit the in-flight change or a main `web-landing` spec that does not exist yet.

## Goals / Non-Goals

**Goals:**

- One shared supporter feature in `packages/ui` for offers, status, checkout, portal, cancel and restore, reused by web and mobile with thin app-specific routing and URL opening.
- A real `/supporter` page on web and a real `/supporter` route on mobile, both handling the server-owned return URLs.
- Delete the Patreon purchase path and replace every former destination with the in-app flow.
- Keep entitlement server-authoritative; the client never assumes success from a redirect or a local flag.
- Make the landing and settings copy clearly separate what the paid plan delivers today from what is announced as "Coming soon".

**Non-Goals:**

- Badge, feature gating, theme, covers, live profile, supporters wall or collection limit. They remain future changes.
- Desktop/admin clients, Stripe SDK integration in clients, invoice/refund UIs, tax handling, price or currency calculation.
- A new design system or a new payment provider abstraction. Existing Mantine/Tailwind patterns and `@capacitor/browser` are enough.

## Decisions

### D1. Shared supporter feature, thin app pages

Create `packages/ui/src/components/supporter/` with:

- `hooks/useSupporterOffers.ts`, `useSupporterStatus.ts`, `useSupporterCheckout.ts`, `useSupporterManagement.ts` (portal, cancel, restore).
- Presentation components for plan selection, status, management actions, activation result and error states.
- `SupporterScreen` used by web `/supporter` and mobile `/supporter`.

The screens receive the checkout result and selected interval as props from the app page (or parse them in a thin app wrapper), and use `Link`/`useRouter` from `#@/util` for internal navigation. The only platform-specific operation is opening an external Stripe URL; it goes through a new `openExternalUrl` hook in `UIHookRegistry`, defaulting to `window.location.assign` and overridden by mobile with `Browser.open`.

Rationale: two clients must show the same six-endpoint contract and the same error semantics. Reimplementing hooks and status logic in each app would drift. Alternatives considered:

- **Web and mobile implementations per app.** More duplication, and the settings surface would diverge immediately.
- **Direct `authClient`/Stripe calls from clients.** Rejected; the server change deliberately hides plan, price and checkout details and exposes one stable contract.

### D2. Checkout handoff and return

- Web calls `BillingService.billingControllerCheckoutV1({ interval, locale })`, then opens the returned absolute URL in the same tab. The browser returns to `/supporter?checkout=success|cancel` through Stripe and the server-owned redirect.
- Mobile calls the same endpoint and passes the URL to `openExternalUrl` (implemented with `Browser.open`). `apps/mobile/src/pages/supporter.tsx` tracks that a checkout was started, registers `browserFinished` and app-resume listeners, and invalidates `["billing", "me"]` so the page refreshes when the sheet closes. Closing the sheet also enters the same bounded activation-pending state as a `checkout=success` return, because the App Link may or may not be delivered before the user dismisses the browser. The existing `https://gamenode.app` App Link routes `/supporter?checkout=success` back to the in-app route.
- No client ever builds a Stripe URL, sends a price, amount, currency or Price ID, or embeds Stripe Checkout in an iframe or the WebView.

Rationale: Stripe Checkout is a hosted page and must run in a real browser context. The server already provides the only redirect points; using them keeps success/cancel behavior consistent. Alternatives considered:

- **Open checkout in a new tab on web.** Rejected: pop-up blocking and no automatic return to the page.
- **A custom deep link for mobile checkout success.** Rejected: the server contract is fixed to the website URL; the existing App Link already covers it.

### D3. Server-authoritative status and bounded activation polling

`useSupporterStatus` reads `GET /v1/billing/me` with key `["billing", "me", userId]`, `enabled: !!userId`, explicit `staleTime: 0`, `refetchOnMount: "always"` and `refetchOnReconnect: true`, overriding the web defaults. The screen shows the free state only when the request has succeeded with `isSupporter: false`; loading and error are distinct.

When the page opens with `checkout=success` and the server has not confirmed entitlement, the page shows "confirming your subscription" and refetches every few seconds for a bounded window (about one minute). It then stops and offers a manual refresh instead of polling forever. A `checkout=cancel` return clears the pending state and shows a neutral notice. Entitlement is never written to the cache by the checkout mutation.

Rationale: Stripe redirects the customer before the webhook necessarily reaches the server, so an immediate "not a supporter" would be wrong and an immediate "success" would be false. Alternatives considered:

- **Optimistic supporter state after redirect.** Rejected: the webhook can fail or the checkout can be abandoned.
- **Unbounded polling.** Rejected: wasted requests and a page that never settles.

### D4. Query keys, cache updates and management actions

- Offers: `["billing", "offers"]`, public, `staleTime` about five minutes; the landing and `/supporter` can share the cache.
- Status: `["billing", "me", userId]`, as in D3.
- Checkout: mutation returning `{ url }`; does not mutate status.
- Portal: mutation returning `{ url }`; opens the URL through `openExternalUrl`; does not mutate status.
- Cancel/restore: mutations that merge `status`, `cancelAtPeriodEnd` and `periodEnd` into the cached status immediately, then invalidate `["billing", "me"]` to reconcile with the webhook. The UI disables an action while it runs and surfaces 404/409/503 with specific copy. Cancel and restore are offered only for an active or trialing subscription, matching the server's active-row lookup; a canceled-but-paid row keeps its end date but shows no restore action, and a past-due row shows the billing portal to resolve payment instead of cancel.
- A 409 from checkout switches the screen into the management state instead of showing a generic error, and refetches the status. Billing-specific errors stay inline on the supporter surface; the generic error notification is not the only feedback for checkout, portal, cancel or restore.

Rationale: cancel/restore responses are authoritative for the fields they return, so the UI can update without waiting for a webhook, while the invalidation handles the rest.

### D5. Generated DTO normalization

Because `BillingOfferDto.interval` and `BillingOffersResponseDto.currency` are typed as `object` by the generated client, add a small runtime guard:

- `"monthly" | "yearly"` for offers and `"BRL" | "USD"` for currency; unknown values are ignored or treated as unavailable.
- `BillingMeResponseDto.status` is a free string; map known statuses (`active`, `trialing`, `past_due`, `canceled`, `incomplete`, `unpaid`, `paused`) to localized labels and use a generic label for anything else.
- `BillingMeResponseDto.billingInterval` is a free string (`"month"`/`"year"`); map it for display without assuming the exact value.
- `periodEnd` is an ISO string or null; parse with `dayjs` and format with the active locale.

Rationale: the server's Swagger plugin does not emit union enums for these fields. Casting blindly would hide a contract drift; failing closed avoids showing an invalid plan.

### D6. Landing and settings surfaces

- The landing keeps its visual structure but becomes offers-driven: the supporter card shows the server `displayAmount` for the selected interval, the free card shows "Free"/"Grátis" instead of a currency amount, and the CTA is `Link` to `/supporter?interval=<monthly|yearly>`. The landing does not start checkout.
- If offers fail, the supporter card shows "pricing unavailable" and the CTA still opens `/supporter`, where the error is explained. No stale hardcoded price is shown.
- The landing keeps the upcoming benefit rows (badge, theme, video cover, animated border, custom covers, live profile, supporters wall, collection limit) but labels them "Coming soon" / "Em breve", visually separated from the benefits available today. They are not marked as included, are not interactive, and do not gate free features. This intentionally keeps the roadmap visible while the supporter system ships first and overrides the in-flight landing change's Patreon-era copy.
- The web settings tab keeps the internal tab id `premium` (so existing `?settings=premium` links and tests keep working) but its label, title and subtitle become Supporter/Apoiador. It is rebuilt from the shared status/management components; `SettingsPremiumProfilePreview` and `settingsPremiumLinks.ts` are deleted, and the premium tab stops using `SettingsLockedSwitch` (the shared component stays for notifications). A short non-interactive "Coming soon" list replaces the locked switches. The existing sidebar highlight treatment is kept; this change only changes labels and content.
- The About page's Patreon button and "buy us a coffee" label become a `/supporter` link and supporter copy. The Apoia.se button remains as a separate community donation channel and is not presented as a GameNode subscription or as granting supporter status.

Rationale: the server change warns that clients must not advertise unshipped benefits as available. Explicit "Coming soon" labels keep the roadmap visible without granting or implying entitlement. The old settings tab was a mock; keeping the tab id avoids a needless routing migration.

### D7. Mobile entry point and deep link

- Add a `/supporter` route to `getCommonRoutes(prefix)` so it exists under every tab, plus `apps/mobile/src/pages/supporter.tsx` using `AppPage`.
- Add `PreferencesSupporterItems` as the first Preferences group: a divider, the current status (Supporter/Apoiador or a support prompt), and an `IonItem` with `routerLink={getTabAwareHref("/supporter")}`. It must not block Preferences when billing is 503.
- The existing `AppUrlListener` already maps `https://gamenode.app/supporter?checkout=success` to the tab-aware route; no new App Link configuration is needed. Because Next.js may add a locale prefix (`/pt-BR/supporter`) before the App Link is delivered, the listener must strip a leading `/en` or `/pt-BR` segment before mapping the path, the same way `isBrowserOAuthUrl` already does for auth URLs.
- The mobile supporter screen itself is reachable while signed out, shows offers, and sends the user to sign-in when they choose a plan.

Rationale: Preferences is the existing mobile settings home, and the App Link mechanism is already verified in the manifest. Mounting the web settings modal in mobile would be a larger, unrelated navigation change.

### D8. Localization and naming

Add a `supporter.*` namespace in both `en.json` and `pt-BR.json` for the page, statuses, actions, errors and checkout results. Revise `landing.presentation.supporter.*` and `settings.premium.*` in place, remove keys for deleted mock features, keep the existing `settings.tabs.premium` route key, and change user-facing labels from Premium to Supporter/Apoiador. Regenerate locale types with `yarn locales:generate-types`.

Rationale: "Premium" is the old Patreon-era name; the server calls the plan `supporter`, and the landing already uses Supporter/Apoiador. Keeping keys stable where routing depends on them avoids a URL migration.

## Risks / Trade-offs

- **`/supporter` is missing while server checkout is already enabled** → Deploy the client page before enabling Stripe checkout, or enable server billing only after the web deploy. The server can boot with Stripe disabled (503), so this order is safe.
- **Webhook lag after checkout** → Bounded polling plus a manual refresh; never optimistic entitlement.
- **Currency display vs actual charge** → The offers endpoint is a display hint based on `CF-IPCountry`/`Accept-Language`; Stripe remains authoritative at checkout. Copy says the amount is confirmed in checkout, and clients never send currency.
- **Native browser flow is not device-tested in CI** → Validate on an Android device/emulator during implementation; mobile web is covered by the web path. If no device is available, record the limitation in the change verification and ship behind the existing web fallback.
- **App Links may open the app while the user is in the mobile browser** → Desired for checkout return; `browserFinished` and App Links both trigger a refresh, and duplicate refreshes are harmless.
- **Upcoming benefits may be mistaken for available** → Label them explicitly "Coming soon"/"Em breve", keep them visually separate from available benefits, and make them non-interactive. Revisit labels as each feature ships.
- **Wrapper regeneration may include unrelated server API changes** → Review the generated diff and keep app changes limited to billing; do not silently absorb unrelated model/service changes.
- **In-flight `implement-web-landing-figma` spec can reintroduce the Patreon requirement** → Reconcile that change before archiving it; this change is the current source of truth for the supporter CTA. Once `web-landing` exists in main specs, a future delta must carry the `/supporter` destination.
- **Stale billing cache on web** → Explicit `staleTime: 0`/`refetchOnMount` on billing queries; the global `staleTime: Infinity` default must not apply.
- **Apoia.se still exists as a donation link** → It is clearly a separate donation channel, not a GameNode subscription, and does not grant entitlement. Remove it later if the product decides the supporter plan is the only support path.

## Migration Plan

1. Merge/deploy the server change with Stripe disabled (billing endpoints return 503) or keep it undeployed until step 2 is ready.
2. Refresh the wrapper input from the server's `server_swagger.json`, regenerate `@repo/wrapper`, and implement the shared supporter feature plus web `/supporter`.
3. Deploy web and mobile web with `/supporter` live. Verify offers, signed-out sign-in return, checkout session creation, cancel return and 503 states without completing a card.
4. Enable the four Stripe environment values and the plugin on the server. Run a test-mode checkout; verify the success return, status polling, portal, cancel and restore.
5. Ship the mobile build after Android browser/App Link validation. Mobile web can ship with the web deploy.
6. Rollback: redeploy the previous web/mobile build and disable Stripe on the server (billing returns 503). The client has no schema or persisted billing state to migrate; React Query caches expire naturally.

## Open Questions

None that change the approach or task breakdown.
