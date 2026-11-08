# Spec Delta

## ADDED Requirements

### Requirement: Supporter surface in settings
Each client SHALL present supporter offers, checkout, subscription status, management and the feature catalog only inside its settings: the Supporter tab of the web settings modal and the Supporter screen under mobile Preferences. Neither client SHALL render a standalone supporter page.

#### Scenario: Web settings entry
- **WHEN** a signed-in web user opens settings and selects the Supporter tab
- **THEN** the panel shows the subscription state, plan choice or management actions, the feature catalog and billing help

#### Scenario: Mobile Preferences entry
- **WHEN** a signed-in mobile user opens Preferences and selects Supporter
- **THEN** the app opens its Supporter settings screen with the same content as the web tab, using the same visual style

#### Scenario: No standalone page
- **WHEN** a user follows any in-app supporter link, including the landing call to action and the About page link
- **THEN** they end up on the settings Supporter surface, not on a separate supporter page

### Requirement: Supporter entry URL
Clients SHALL NOT register a `/supporter` route, page, redirect or App Link mapping. The only supporter entry URL SHALL be `/home?settings=premium`, with optional `interval=monthly|yearly` and `checkout=success|cancel`. Every in-app supporter link SHALL be built from one shared helper, and a link shown to a visitor known to be signed out SHALL point to sign-in with that URL as the return target.

#### Scenario: Landing CTA signed in
- **WHEN** a signed-in visitor picks Yearly on the landing pricing section and selects its call to action
- **THEN** the browser opens `/home?settings=premium&interval=yearly` with the Supporter tab open and yearly selected

#### Scenario: Landing CTA signed out
- **WHEN** a signed-out visitor picks Yearly on the landing pricing section and selects its call to action
- **THEN** they go straight to sign-in and, after signing in, reach the Supporter tab with yearly selected

#### Scenario: Checkout return on web
- **WHEN** Stripe redirects a signed-in user to `/home?settings=premium&checkout=success`
- **THEN** the settings modal opens on the Supporter tab with the checkout result applied

#### Scenario: Locale-prefixed entry
- **WHEN** a user opens `/pt-BR/home?settings=premium&checkout=cancel`
- **THEN** they reach the Supporter tab in Portuguese with the cancelled-checkout notice

#### Scenario: Old URL
- **WHEN** anyone opens `/supporter` on web
- **THEN** the site responds with its normal not-found page

### Requirement: Signed-out settings links
The web settings modal SHALL send a signed-out visitor who opens any `?settings=<tab>` URL to sign-in with the full URL, query included, as the return target, instead of rendering nothing. Without a `settings` parameter it SHALL NOT redirect.

#### Scenario: Settings link while signed out
- **WHEN** a signed-out visitor opens `/home?settings=premium&interval=monthly` directly, for example from a shared link or before the landing knew their session state
- **THEN** the settings modal sends them to sign-in and, after signing in, they reach the Supporter tab with monthly selected

#### Scenario: No settings parameter
- **WHEN** a signed-out visitor opens `/home` without `settings`
- **THEN** the home page renders as before and no sign-in redirect happens

### Requirement: Settings checkout result lifecycle
A checkout result opened through the settings Supporter surface SHALL apply only to that visit. Closing the settings modal or switching to another tab SHALL clear the checkout result and requested interval from the URL.

#### Scenario: Closing after a cancelled checkout
- **WHEN** a user closes the settings modal that was opened with `checkout=cancel` and later reopens the Supporter tab
- **THEN** no cancelled-checkout notice is shown

#### Scenario: Small screen checkout return
- **WHEN** the web settings modal opens full screen on a small viewport from a checkout return
- **THEN** it shows the Supporter panel directly instead of the tab list

### Requirement: Supporter settings content
The Supporter surface SHALL show, in order: a summary with the current plan state, the plan choice for users without a subscription or the subscription details and actions for users with one, the catalog of upcoming features, the features that stay free, and how to get billing help.

#### Scenario: Free user layout
- **WHEN** a signed-in user without a subscription opens the Supporter surface
- **THEN** they see the monthly/yearly selector with the server price and a subscribe action, followed by the upcoming features and the free features

#### Scenario: Supporter layout
- **WHEN** a supporter opens the Supporter surface
- **THEN** they see their plan, billing interval, renewal or end date and the billing, cancel or keep actions, with no subscribe action

#### Scenario: Billing unavailable
- **WHEN** billing returns 503 while the Supporter surface is open
- **THEN** the summary explains that subscriptions are temporarily unavailable, no subscribe action is enabled, and the feature catalog and free features still render

## MODIFIED Requirements

### Requirement: Checkout entry and authentication
Web and mobile SHALL let a signed-in user start a monthly or yearly checkout from the settings Supporter surface. A signed-out user SHALL be sent to sign in and returned to the settings Supporter surface with the selected interval preserved.

#### Scenario: Signed-in checkout
- **WHEN** a signed-in user without an active subscription chooses monthly or yearly on the settings Supporter surface
- **THEN** the client requests a checkout session for that interval and follows the server-returned URL

#### Scenario: Signed-out checkout
- **WHEN** a signed-out user opens a supporter entry point, such as the landing call to action or the About page link
- **THEN** the client sends them to sign in with the settings Supporter surface as the return target, and after sign-in they can continue with the same interval

#### Scenario: Existing subscription
- **WHEN** checkout returns 409 because an active or trialing subscription already exists
- **THEN** the client shows the current subscription and its management actions instead of creating another subscription

### Requirement: Checkout return and activation
The server SHALL return Stripe checkout and portal sessions to `/home?settings=premium`, adding `checkout=success|cancel` for checkout, and clients SHALL handle that return by opening the settings Supporter surface. After either result the client SHALL refresh subscription status from `GET /v1/billing/me`, SHALL show an activation-pending state after a successful checkout until the server confirms entitlement, and SHALL NOT grant entitlement locally.

#### Scenario: Successful checkout
- **WHEN** Stripe returns the user to `/home?settings=premium&checkout=success` and the server reports `isSupporter: true`
- **THEN** the Supporter surface confirms the active subscription with its interval and renewal date

#### Scenario: Webhook still pending
- **WHEN** the Supporter surface opens with `checkout=success` while the server still reports no active subscription
- **THEN** it shows that activation is being confirmed, re-queries the status for a bounded period, stops and offers a manual refresh after that period, and never assumes success on its own

#### Scenario: Cancelled checkout
- **WHEN** the user returns to `/home?settings=premium&checkout=cancel`
- **THEN** the Supporter surface shows a neutral message that no subscription was created and does not claim supporter status

#### Scenario: Mobile browser return
- **WHEN** a native mobile checkout finishes and the in-app browser closes or the app resumes
- **THEN** the app refreshes subscription status, shows activation pending while the server catches up, and does not require a full reload

#### Scenario: Supporter deep link
- **WHEN** the app receives a `https://gamenode.app/home?settings=premium&checkout=success` App Link, including a locale-prefixed form such as `/pt-BR/home?settings=premium&checkout=success`
- **THEN** it opens its Preferences Supporter screen in the current tab with `checkout` and `interval` preserved, without opening the Home tab and without treating the locale segment as a tab

### Requirement: Mobile supporter surface
Mobile SHALL expose the Supporter settings screen from Preferences and SHALL open checkout in the system in-app browser rather than an embedded Stripe page or the app WebView. The Supporter screen SHALL require sign-in, like the rest of Preferences.

#### Scenario: Preferences entry
- **WHEN** a signed-in mobile user opens Preferences
- **THEN** a Supporter row shows the current state and opens the Supporter settings screen

#### Scenario: Mobile checkout
- **WHEN** a mobile user starts checkout
- **THEN** the server-returned URL opens in the system in-app browser and the app remains responsible for refreshing status afterwards

#### Scenario: Signed-out mobile supporter screen
- **WHEN** a signed-out mobile user opens the Supporter settings screen, for example from a checkout-return App Link
- **THEN** the app sends them to sign in and returns them to the Supporter screen with the query preserved

### Requirement: Benefit availability labeling
Clients SHALL distinguish benefits available today from benefits announced for later. The supporter badge, supporter theme, video cover, animated border, custom covers, live profile, supporters wall, collection limit and similar unshipped items SHALL be labeled "Coming soon" / "Em breve" for every user, supporters included, SHALL NOT be presented as included, unlocked or usable today, and SHALL NOT gate features that are free today.

#### Scenario: Plan copy
- **WHEN** a user reads the supporter plan description
- **THEN** available benefits are presented as available and unshipped benefits are explicitly marked "Coming soon" / "Em breve"

#### Scenario: Localized coming-soon label
- **WHEN** the active language is English or Brazilian Portuguese
- **THEN** upcoming benefits use "Coming soon" or "Em breve" respectively, without exposing a translation key

#### Scenario: Settings surface
- **WHEN** a user opens the Supporter settings
- **THEN** each upcoming feature appears as a non-interactive row with an icon, a title, a description and a "Coming soon" label, with no toggle, switch or lock presented as a control

#### Scenario: Supporter sees upcoming features
- **WHEN** a user with an active subscription opens the Supporter settings
- **THEN** the upcoming features keep their "Coming soon" label, and the copy says they will be added to the subscription as they ship, without claiming any of them is active

#### Scenario: Profile preview
- **WHEN** the Supporter settings show a preview of the user's profile with supporter styling
- **THEN** the preview is labeled as a preview of upcoming features, is not interactive, and is built only from the user's own public profile data and the server's billing status

#### Scenario: Supporter since
- **WHEN** a supporter opens the Supporter settings and `GET /v1/billing/me` returns `supporterSince`
- **THEN** the preview shows "Supporter since {year}" from that value, and when the server returns `null` (free users, or a server without the field) no "since" line is shown and no date is derived locally

#### Scenario: Free features unchanged
- **WHEN** a free user uses the library, collections, imports, achievements or reviews
- **THEN** no supporter paywall or lock is shown
