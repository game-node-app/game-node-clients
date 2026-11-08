# Verification — add-supporter-subscriptions

## 1. Wrapper contract

- Replaced `packages/wrapper/input/server_swagger.json` with `game-node-server/server_swagger.json`
  (the checkout containing the six `/v1/billing/*` routes) and ran `yarn wrapper:generate`.
- Generated `BillingService` exposes `billingControllerGetOffersV1`,
  `billingControllerGetMeV1`, `billingControllerCreateCheckoutV1`,
  `billingControllerCreatePortalV1`, `billingControllerCancelV1` and `billingControllerRestoreV1`.
- `yarn workspace @repo/wrapper type-check`, `lint` and `build` pass.

### Unrelated generated drift (recorded per task 1.1)

The refreshed server output also changes the Daily contract, unrelated to billing:

- `DailyGuessTraitsDto` removed; `DailyGuessFeedbackDto.traits` removed.
- `DailyPlayResponseDto.community` doc comment changed to "Only once the puzzle is finished".

`DailyGuessRow` did reference `DailyGuessFeedbackDto.traits`, so the refresh broke `@repo/ui`
type-check. The component already had a fallback for servers that only send the result and common
values; the traits branch was removed so the client now always uses that fallback. This is an
explicit, minimal adaptation to the unrelated server contract change, not a silent model update.

### Runtime narrowing required (task 1.2)

The generated Swagger types the union fields as `Record<string, any>` / free strings:

- `BillingOfferDto.interval` → `Record<string, any>`; narrowed to `"monthly" | "yearly"`.
- `BillingOffersResponseDto.currency` → `Record<string, any>`; narrowed to `"BRL" | "USD"`.
- `BillingMeResponseDto.status` → free string; known statuses mapped, generic label otherwise.
- `BillingMeResponseDto.billingInterval` → free string (`"month"`/`"year"`); narrowed for display.
- `periodEnd` → ISO string or `null`; formatted with `dayjs` and a locale date format.

`CheckoutRequestDto.interval` is a real generated enum; `PortalRequestDto.locale` is optional.
Checkout sends only `interval` (and optional `locale`).

## 2. Automated checks

### Locales (task 2.4)

- `en.json` and `pt-BR.json` have identical flattened key sets (1571 keys after the final cleanup).
- `supporter.benefits.comingSoon` is "Coming soon" in English and "Em breve" in Portuguese.
- No key or value contains Patreon.
- Deleted keys for the removed mock preview/locked switches and the hardcoded landing prices:
  `settings.premium.preview.*`, `settings.premium.features.*`, `settings.premium.appearance.*`,
  `landing.presentation.supporter.plan.{monthlyPrice,monthlyPeriod,yearlyPrice,yearlyPeriod,limit}`,
  `landing.presentation.supporter.free.limit`, `landing.support.buyCoffe`.
- `yarn locales:generate-types` regenerated `packages/locales/src/generated/translation-schema.d.ts`.

### Shared UI and mobile tests

- `yarn workspace mobile vitest run src/components/supporter src/components/preferences/supporter src/components/general/getAppUrlTarget.test.ts`
  — **13 files, 62 tests passed**. Covers offers normalization (BRL/USD/unknown interval),
  auth gating, checkout payload, cancel/restore cache reconciliation, 404/409/503 mapping,
  openExternalUrl default/override, free/active/trialing/past-due/pending-cancel states,
  activation polling, checkout cancel, 503, signed-out redirect, preferences entry and
  tab-aware routes, plus the bare/locale-prefixed `/supporter` deep links.

### Full repository checks (task 5.1)

- `yarn type-check` — **7/7 tasks successful** (wrapper, ui, web, admin, mobile, …).
- `yarn lint` — **6/6 tasks successful**, 0 errors (pre-existing prettier warnings only).
- `yarn build -F web` — successful; `/supporter` built as a static page.
- `yarn workspace mobile build` — Vite build + `cap sync android` successful; 14 Capacitor
  plugins copied/synced.

### Patreon audit (task 5.3)

- `grep -rni "patreon" apps packages` (excluding `node_modules`) → **0 matches**.
- Upcoming benefits are explicitly labeled "Coming soon"/"Em breve" and are non-interactive on
  the landing, supporter page and settings tab.

## 3. Browser validation

Environment: local web `http://localhost:3000`, mobile web `http://localhost:3002`, API
`http://localhost:5000`, local MySQL, Stripe **test** keys from `game-node-server/.env`.
The built-in T3 browser was used. The test browser sends `Accept-Language: en-US`, so UI runs
showed USD; BRL was verified against the real API with a `pt-BR`/`CF-IPCountry: BR` request.

### Offers

- `GET /v1/billing/offers` with `Accept-Language: pt-BR` → BRL 990/9900, display `R$ 9,90` /
  `R$ 99,00`.
- With `CF-IPCountry: BR` → BRL.
- Default (en-US) → USD 190/1900, display `US$ 1.90` / `US$ 19.00`.
- Landing at 1440px: monthly US$ 1.90; selecting Yearly switches to US$ 19.00 and the CTA href
  to `/supporter?interval=yearly`. No hardcoded amount and no Patreon link.

### Checkout entry and return

- Signed-in free user on `/supporter`: plans render with server prices; `Subscribe monthly`
  created a real Stripe Checkout session and navigated to
  `https://checkout.stripe.com/c/pay/cs_test_…` (test mode, "GameNode sandbox").
- Completed the hosted checkout with the Stripe test card `4242 4242 4242 4242` (test mode only).
  Stripe redirected to `http://localhost:3000/supporter?checkout=success`; the page showed
  "You're a Supporter", active status, monthly interval and the Dec 7, 2026 renewal date.
- Pending state: deleted the local `subscription` row and loaded `?checkout=success`; the page
  showed "Confirming your subscription" and did **not** claim success or grant entitlement.
  Re-inserted the row from the real Stripe subscription while the page stayed open; the bounded
  polling (4s) confirmed it and switched to the success state without a reload.
- Actual resubmission errors: a second checkout with an active subscription is the 409 path
  (covered by the unit test and mapped inline + status invalidation).

### Signed-out return

- Web: `/supporter?interval=yearly` → `Subscribe yearly` → `/auth?redirectTo=%2Fsupporter%3Finterval%3Dyearly`
  (interval preserved). Fixed `useNextRouterWrapper` to expose `asPath`; the previous wrapper
  returned only `pathname` and dropped the query.
- Mobile web: `/home/supporter` → `Subscribe monthly` → `/m/auth?redirectTo=%2Fhome%2Fsupporter`.
- Signed-out `/supporter` and `/home/supporter` show the plans plus the sign-in prompt.

### Management

- Customer Portal: `Manage billing` opened a real
  `https://billing.stripe.com/p/session?secret=test_…` (secret redacted).
- Cancel: confirmation dialog opened with `Your benefits continue until Dec 7, 2026…`; keyboard
  focus was trapped inside the dialog (`document.activeElement` was a dialog button). Confirming
  immediately showed "Your subscription is ending" / "Keep subscription" without waiting for the
  webhook. The local DB row was then synced from Stripe (`cancelAtPeriodEnd: true`) and the state
  persisted after reload.
- Restore: `Keep subscription` immediately returned to "Renews on Dec 7, 2026"; the DB was then
  synced (`cancelAtPeriodEnd: false`) and the state persisted after reload.

### Issues found and fixed during browser validation

- The web router wrapper returned `pathname` but not `asPath`, so sign-in dropped the supporter
  interval. Added the locale-normalized `asPath`.
- Cancel/restore marked `["billing","me"]` invalid and refetched immediately; a webhook-lagging row
  overwrote the authoritative action response. Changed to `refetchType: "none"` so the response is
  displayed immediately and a later mount/focus refetches.
- The settings tab repeated the coming-soon header (section + component). It now renders the shared
  `SupporterBenefits` list directly.
- The status card showed the server plan id ("supporter") in all languages. Added
  `supporter.planName` ("Supporter"/"Apoiador").

### 503

- Stopped the API, emptied `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` and restarted. `GET
  /v1/billing/offers` and `/v1/billing/me` returned real 503 responses.
- Web `/supporter`: "Subscriptions are temporarily unavailable. Try again later." + retry,
  no plan/checkout CTA, benefits still visible.
- Mobile web `/home/preferences`: the Supporter entry still rendered and Preferences stayed
  usable (no error boundary/crash).
- Restored the original server env and restarted; offers returned 200 again.

### Settings, About and mobile surfaces

- `?settings=premium`: Supporter label, active status, manage/cancel actions, non-interactive
  "Coming soon" list, billing help. No locked switches, fake profile preview or Patreon.
- Free user in settings: "You're on the free plan" + `Become a Supporter` link to `/supporter`.
- About page: internal `Become a Supporter` link to `/supporter`, Apoia.se kept as a separate
  donation link with the explanation that it does not grant Supporter benefits, no Patreon.
- Mobile web `/home/supporter`: shared supporter screen renders under the app shell.
  `/home/preferences`: Supporter group is first, shows the current status, and clicking navigates
  to `/home/supporter`.
- Mobile web signed out: plans + sign-in prompt; selecting a plan redirects to `/m/auth` with the
  tab-aware return target.

### Responsive and accessibility (task 5.4)

- 375×812 and 1440×900: no horizontal overflow (`scrollWidth === innerWidth`).
- Interval selector: labeled region "Choose your plan", buttons expose `aria-pressed`, visible
  focus ring (`outline: solid 2px`).
- Cancel dialog: focus moved inside the dialog; keyboard-reachable confirm/keep buttons.
- Action button keyboard focus: `Manage billing` matched `:focus-visible` with a 2px brand outline.
- Portuguese UI (`/pt-BR/supporter`): "Em breve" everywhere, no "Coming soon", "Apoiador" labels.
- Errors/503 are text-based, readable and keep the rest of the page usable.

## 4. Mobile device limitation

`adb devices` returned no attached device/emulator. The Android-specific checks required by task
4.3 — checkout opening outside the WebView via `Browser.open` and the
`https://gamenode.app/supporter?checkout=success` App Link returning to the in-app route — were
**not executed on a device**. They are covered by unit tests (browser listener/resume invalidation,
locale-prefixed deep links, tab-aware route) and by mobile web, but the native confirmation remains
an environment limitation. Mobile web and the native build/sync passed.
