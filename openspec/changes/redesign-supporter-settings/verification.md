# Verification: redesign-supporter-settings

Run on 2026-11-07 in the T3 built-in browser against a local stack: web `:3000`, mobile web `:3002`, API `:5000` with Stripe test mode, and local MySQL/Redis. The test account was throwaway (`browser-player@example.invalid`), set up per `docs/local-browser-testing.md`. Subscription states were produced by editing the local `subscription` row only, and the row was restored to `active` / `cancelAtPeriodEnd=0` afterwards. No production data or real payment details were used.

Screenshots are in `~/.t3/userdata/browser-artifacts/` and are named `browser-screenshot-localhost-<id>.png`.

## Task 4.2: states and surfaces

Earlier screenshots in this session were not labelled by viewport, so they are listed per state.

| State | Web 1440px | Web 375px (full-screen modal) | Mobile web 375px (`/home/preferences/supporter`) | Screenshots |
|---|---|---|---|---|
| Free (yearly preselected, prices, `aria-pressed`, Tab focus on plan cards and CTA) | Pass | Pass | Pass | `mw7286cd-fcc5b0c4`, `mw72a6rf-24a94600`, `mw72ap3q-b3fe7883`, `mw72b4my-b0a53710`, `mw72fgbu-5c7022cf`, `mw72g4zd-3693cb1d` |
| Active | Pass | Pass | Pass | `mw73vrad-7abfa699`, `mw73wg6u-85f3056d`, `mw73xyc6-16be7a2f` |
| Pending cancellation ("Ending on …", Ends row, Keep subscription) | Pass | Not captured separately | Pass | `mw746pln-c011f844` (web 1440), `mw742i65-0e7b3bd7` (mobile) |
| Past due ("Payment issue" pill, Update payment method) | Pass | Not captured separately | Failed first (grey button), then passed after defect 4 was fixed | `mw747c05-722ba4fb`, `mw74qfsc-d288e6d2` (web 1440), `mw747tp2-4f3da820` (mobile before), `mw74pnhf-579b50bf` (mobile after) |
| 503 (API started with an empty `STRIPE_SECRET_KEY`) | Pass | Pass | Pass | `mw74y5lw-dee99e06`, `mw752bn2-3e115027`, `mw74z4l1-d1806362` |

Web 375px renders the same view as mobile 375px, inside the full-screen modal. Its pending-cancellation and past-due states were not screenshotted on their own.

In the 503 state, the hero reads "Subscriptions are temporarily unavailable. Try again later." and offers a "Try again" button, with no enabled subscribe action. The feature catalog, profile preview and "Always free" list still render. Mobile kept showing the cached past-due status alongside the error, which is acceptable.

### Checkout returns

| Return | Result |
|---|---|
| `/home?settings=premium&interval=yearly&checkout=cancel` | Pass: "Purchase cancelled" banner on the Supporter tab, yearly kept (`mw72c6g2-79c7c056`) |
| `/pt-BR/home?settings=premium&checkout=success`, including pending and slow-confirmation banners | Pass (`mw72cmb0-6daba0a9`, `mw72dwcv-6b7e3de0`) |
| `/home?settings=premium&checkout=cancel`, signed in | Pass (`mw73ydcf-9f1c14da`) |

### "Coming soon" / "Em breve"

- **en, signed-in supporter:** every upcoming feature row, the catalog header and the preview label read "Coming soon".
- **pt-BR:** `/pt-BR/home?settings=premium&checkout=cancel` at 375px shows 11× "Em breve" and 0× "Coming soon", with the "Compra cancelada" banner (`mw74bgvg-ac935ba8`).

### Other checks

- Switching away from the Supporter tab clears `checkout` and `interval`, and Esc closes the modal.

## Task 2.5: entry points

| Check | Result |
|---|---|
| `/supporter` on web | Pass: 404 |
| `/pt-BR/home?settings=premium&checkout=cancel` | Pass (see above) |
| Signed-out visit to `?settings=premium…` | Pass: redirects to sign-in with the full URL as `redirectTo` |
| Signed-in landing Yearly CTA | Not reachable as written: `/` redirects signed-in users to `/home` (`apps/web/src/pages/index.tsx`). The signed-in `useSupporterEntryHref` link on `/home` was checked and points to `/home?settings=premium&interval=…`. |
| Signed-out landing Yearly CTA → sign-in → back with yearly selected | **Not completed:** the machine rebooted twice during the session |
| Signed-out `/home?settings=premium&interval=monthly` → sign-in → back | **Not completed:** same reason |
| About page "Become a Supporter" link | **Not completed:** same reason |

## Defects found and fixed during validation

1. **Mobile `/home/preferences/supporter` showed the Preferences list.**
   - Cause: `@ionic/react-router` takes the last matching route, so `:category` swallowed `supporter`.
   - Fix: `getCommonRoutes` now restricts `:category` to a regex of the existing categories.
2. **The web profile preview briefly showed skeletons after loading.**
   - Fix: `SupporterProfilePreview` renders the skeleton only while the query is loading.
3. **Cramped rows at 375px.**
   - Fix: `SupporterHeroCard` and `SettingsRow` (new `stackRightSection` prop) stack by default and go side-by-side only at container widths of `@[520px]` and `@[420px]`.
4. **On mobile, primary and danger `SettingsButton`s rendered as grey outlines.**
   - Cause: `apps/mobile/src/components/theme.tsx` adds `classes.button` to every Mantine Button, and `.button[data-variant="default"]` (specificity 0,2,0) overrode the Tailwind colours.
   - Fix: `SettingsButton` maps to `filled` / `subtle` / `outline` and sets colours through Mantine's `--button-*` variables.
   - This affects every settings button on mobile. Rechecked on mobile and web.
