# Tasks

## 1. Wrapper contract

- [x] 1.1 Replace `packages/wrapper/input/server_swagger.json` with the `game-node-server` output that includes the six `/v1/billing/*` routes, run `yarn wrapper:generate`, and verify the generated `BillingService` exposes `billingControllerGetOffersV1`, `billingControllerGetMeV1`, `billingControllerCreateCheckoutV1`, `billingControllerCreatePortalV1`, `billingControllerCancelV1` and `billingControllerRestoreV1`; record any unrelated generated diff before proceeding.
- [x] 1.2 Inspect the generated billing models and verify `BillingOfferDto.interval`, `BillingOffersResponseDto.currency`, `BillingMeResponseDto` and the checkout/portal DTOs match `handoff-clients.md`; document the `object`-typed union fields that need runtime narrowing.
- [x] 1.3 Run `yarn workspace @repo/wrapper type-check` and `yarn workspace @repo/wrapper lint`, and verify the package still builds with `yarn workspace @repo/wrapper build`.

## 2. Shared supporter feature

- [x] 2.1 Add an `openExternalUrl` capability to `packages/ui/src/context/registry.ts`/`UIProvider` with a `useOpenExternalUrl` helper, a web default, and a mobile `UI_HOOK_REGISTRY` override that opens URLs with `Browser.open`; cover the default and override with a unit test.
- [x] 2.2 Implement `useSupporterOffers`, `useSupporterStatus`, `useSupporterCheckout` and `useSupporterManagement` (portal, cancel, restore) in `packages/ui/src/components/supporter/hooks/` with the query keys, stale-time overrides, runtime interval/currency narrowing and cache reconciliation from `design.md`; verify mobile Vitest tests cover BRL/USD offers, unknown interval values, auth gating, the checkout payload (interval and locale only), cancel/restore cache updates and 404/409/503 mapping.
- [x] 2.3 Implement the shared supporter screen and components (plan selection, current status, actions, cancel confirmation, activation-pending result, signed-out prompt, coming-soon benefit list, error/retry and 503 state) with Mantine/Tailwind and the injected `Link`, `Modal`, `useRouter` and `openExternalUrl`; verify component tests cover free, active, trialing/past-due grace, pending cancellation, activation pending, checkout cancel, coming-soon labels and billing-unavailable states.
- [x] 2.4 Add the `supporter.*` keys (including the localized "Coming soon"/"Em breve" label) and revise `settings.tabs.premium.*`, `settings.premium.*`, `landing.presentation.supporter.*` and the landing nav `landing.presentation.premium` label in `en.json` and `pt-BR.json`; keep the benefit feature keys used by the upcoming list, remove only keys for deleted preview/switch mock features, run `yarn locales:generate-types`, and verify both locale files keep the same key set and that no Patreon-specific key remains.
- [x] 2.5 Export the new feature through the `packages/ui` barrels with `yarn workspace @repo/ui barrels:generate`, and verify `yarn type-check -F @repo/ui` and `yarn lint -F @repo/ui` pass.

## 3. Web

- [x] 3.1 Add `apps/web/src/pages/supporter.tsx` rendering the shared supporter screen, passing `checkout` and `interval` from the Next router, handling signed-out sign-in return, bounded activation polling and page metadata; verify `yarn type-check -F web` and a local visit to `/supporter` with and without a session.
- [x] 3.2 Rework `apps/web/src/components/landing/SupporterSection.tsx` to use server offers, show the selected interval price from `displayAmount`, send the CTA to `/supporter?interval=...`, show the pricing-unavailable state, and keep the upcoming benefit rows explicitly labeled "Coming soon"/"Em breve" and separated from available benefits; update the hardcoded landing footer Premium link label, and verify the BRL and USD renderings with a mocked offers response, the coming-soon labels in both languages, and that the free plan no longer shows a hardcoded currency amount.
- [x] 3.3 Rebuild `SettingsPremiumTab` around the shared status/management components, show upcoming benefits as a non-interactive "Coming soon"/"Em breve" list, keep the `premium` tab id while changing labels to Supporter/Apoiador, and delete `SettingsPremiumProfilePreview` and `settingsPremiumLinks.ts` plus their `premium/index.ts` exports; remove the premium tab's `SettingsLockedSwitch` usage but keep the shared component for notifications, then verify no unused imports remain and the settings modal opens `?settings=premium` correctly.
- [x] 3.4 Replace the About page Patreon button and its "buy us a coffee" label with a `/supporter` link and supporter copy, keep Apoia.se clearly presented as a separate donation channel, and verify `yarn type-check -F web` plus a keyboard pass over `/about` and `/supporter`.

## 4. Mobile

- [x] 4.1 Add `apps/mobile/src/pages/supporter.tsx` and the tab-aware `/supporter` route in `getCommonRoutes`; parse `checkout`/`interval`, show the shared screen inside `AppPage`, and verify `yarn workspace mobile type-check` plus a mobile-web visit to `/home/supporter`.
- [x] 4.2 Add `PreferencesSupporterItems` as the first Preferences group with the current status and an `IonItem` to `getTabAwareHref("/supporter")`, keeping Preferences usable when billing returns 503; verify with a component test that free and supporter users see the correct entry and that it navigates to the tab-aware route.
- [ ] 4.3 Wire native checkout to `Browser.open` through `openExternalUrl`, track that checkout was started, invalidate `["billing", "me"]` and enter the bounded activation-pending state on `browserFinished` and app resume, and verify tests mock the browser listener and assert the refetch/pending behavior; on Android, confirm the checkout URL opens outside the WebView and the `https://gamenode.app/supporter` App Link returns to the in-app route with `checkout=success`. If no device or emulator is available, record that limitation in `verification.md` instead of marking the check passed.
- [x] 4.4 Verify the existing `AppUrlListener` maps `/supporter?checkout=success` to the tab-aware route, strip a leading `/en` or `/pt-BR` locale segment before mapping, and add or extend a test for both bare and locale-prefixed URLs; run `yarn workspace mobile vitest run` for the supporter, preferences and URL-listener suites.

## 5. Integration validation

- [x] 5.1 Run `yarn type-check` (or the per-package equivalents), `yarn lint`, `yarn build -F web` and `yarn workspace mobile build`; verify the web `/supporter` page, mobile route, settings tab and landing all compile and the mobile bundle still syncs with Capacitor.
- [x] 5.2 With the local server in Stripe test mode, verify `GET /v1/billing/offers` for BRL and USD, signed-out and signed-in checkout entry, checkout-session creation without completing a card, the `checkout=cancel` return, the `checkout=success` pending/confirmed states, the Customer Portal URL, cancel at period end and restore; record redacted commands and outcomes in `openspec/changes/add-supporter-subscriptions/verification.md`.
- [x] 5.3 Run a repository-wide audit for `patreon` in `apps/` and `packages/` and verify no runtime Patreon link remains; historical and in-flight OpenSpec documents are out of scope for this audit. Also verify badge, theme, video cover, animated border, custom covers, live profile, supporters wall and collection limit are labeled "Coming soon"/"Em breve" and are not presented as included or usable today.
- [x] 5.4 Validate responsive and accessible behavior at 375px and 1440px: keyboard reachability, visible focus, labeled interval selector, confirmation dialog focus handling and readable error/503 states on web and mobile web.

## Deferred

- Implement and gate premium features, the supporter badge, the theme, covers, live profile, supporters wall and collection limit in separate changes.
- Admin and desktop billing surfaces.
- Invoice history, refunds, coupons and tax handling in the clients.
- Native iOS project and device validation.

## Workflow follow-up

- Reconcile the in-flight `implement-web-landing-figma` change before archiving it: its `web-landing` delta still names Patreon as the supporter destination and would contradict this change once archived.
- Archive the change after implementation, validation and the project's review requirements are satisfied.
- Verify the archived result and the main `supporter-subscriptions` spec.
