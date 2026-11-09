# Spec Delta

## Purpose

Defines how the GameNode web and mobile clients present the Stripe-backed supporter plan, start and return from checkout, display the server-authoritative entitlement, manage or cancel a subscription, and behave when billing is unavailable. The clients display and request; the server and Stripe remain the only source of prices, currency and entitlement.

## ADDED Requirements

### Requirement: Server-authoritative offers
The clients SHALL render supporter prices from `GET /v1/billing/offers` for both monthly and yearly intervals and SHALL NOT hardcode amounts, currencies, Stripe Price IDs or other provider identifiers. Offer data SHALL be treated as display-only; clients SHALL NOT send a price, amount or currency back for a charge.

#### Scenario: Brazilian offer display
- **WHEN** the offers response contains `currency: "BRL"` with amounts `990` and `9900`
- **THEN** the clients show R$ 9,90 for monthly and R$ 99,00 for yearly using the server-provided display amounts

#### Scenario: International offer display
- **WHEN** the offers response contains `currency: "USD"` with amounts `190` and `1900`
- **THEN** the clients show US$ 1.90 for monthly and US$ 19.00 for yearly using the server-provided display amounts

#### Scenario: Offers unavailable
- **WHEN** the offers request fails, returns 503 or is still loading
- **THEN** the client explains that pricing is unavailable, shows no invented amount and keeps the rest of the page usable with a retry action

#### Scenario: Client cannot choose the charge
- **WHEN** a client starts checkout
- **THEN** its request contains only the selected interval and an optional locale, and never a price, amount, currency or Stripe identifier

### Requirement: Checkout entry and authentication
Web and mobile SHALL let a signed-in user start a monthly or yearly checkout from a supporter surface. A signed-out user SHALL be sent to sign in and returned to the same supporter surface with the selected interval preserved.

#### Scenario: Signed-in checkout
- **WHEN** a signed-in user without an active subscription chooses monthly or yearly on a supporter surface
- **THEN** the client requests a checkout session for that interval and follows the server-returned URL

#### Scenario: Signed-out checkout
- **WHEN** a signed-out user chooses a plan on the supporter surface
- **THEN** the client sends them to sign in with the supporter surface as the return target, and after sign-in they can continue with the same interval

#### Scenario: Existing subscription
- **WHEN** checkout returns 409 because an active or trialing subscription already exists
- **THEN** the client shows the current subscription and its management actions instead of creating another subscription

### Requirement: Checkout return and activation
Clients SHALL handle the server-owned `/supporter?checkout=success|cancel` return. After either result the client SHALL refresh subscription status from `GET /v1/billing/me`, SHALL show an activation-pending state after a successful checkout until the server confirms entitlement, and SHALL NOT grant entitlement locally.

#### Scenario: Successful checkout
- **WHEN** Stripe returns the user to `/supporter?checkout=success` and the server reports `isSupporter: true`
- **THEN** the page confirms the active subscription with its interval and renewal date

#### Scenario: Webhook still pending
- **WHEN** the page loads with `checkout=success` while the server still reports no active subscription
- **THEN** the page shows that activation is being confirmed, re-queries the status for a bounded period, stops and offers a manual refresh after that period, and never assumes success on its own

#### Scenario: Cancelled checkout
- **WHEN** the user returns to `/supporter?checkout=cancel`
- **THEN** the page shows a neutral message that no subscription was created and does not claim supporter status

#### Scenario: Mobile browser return
- **WHEN** a native mobile checkout finishes and the in-app browser closes or the app resumes
- **THEN** the app refreshes subscription status, shows activation pending while the server catches up, and does not require a full reload

#### Scenario: Supporter deep link
- **WHEN** the app receives a `https://gamenode.app/supporter?checkout=success` App Link, including a locale-prefixed form such as `/pt-BR/supporter` produced by the website
- **THEN** it opens its own supporter route with the checkout result preserved and without treating the locale segment as a tab

### Requirement: Supporter status display
The client SHALL display the subscription state reported by `GET /v1/billing/me`: supporter flag, status, plan, billing interval, current period end and cancel-at-period-end. It SHALL distinguish free, active or trialing, past-due grace, canceled-but-paid and pending cancellation, and SHALL NOT infer entitlement from local state.

#### Scenario: Free user
- **WHEN** the server reports `isSupporter: false` with no subscription
- **THEN** the client shows the available plans and the checkout action

#### Scenario: Active supporter
- **WHEN** the server reports an active or trialing subscription
- **THEN** the client shows the plan, billing interval and renewal date instead of the purchase action

#### Scenario: Past-due grace
- **WHEN** the server reports `isSupporter: true` for a past-due subscription inside the grace period
- **THEN** the client presents the subscription as active-with-payment-issue and offers the billing portal

#### Scenario: Pending cancellation
- **WHEN** the server reports `cancelAtPeriodEnd: true`
- **THEN** the client shows that benefits continue until the period end and offers the restore action

### Requirement: Self-service management
A supporter SHALL be able to open the Stripe Customer Portal, cancel the subscription at the end of the paid period after confirming the action, and restore a pending cancellation. These actions SHALL use the server endpoints and SHALL update the displayed state from the response or a refetch.

#### Scenario: Open billing portal
- **WHEN** a supporter chooses to manage billing
- **THEN** the client requests the portal URL from the server and opens it in the browser or system in-app browser

#### Scenario: Cancel at period end
- **WHEN** a supporter confirms cancellation
- **THEN** the client shows the pending cancellation, keeps the entitlement until the period end, and offers restore

#### Scenario: Restore pending cancellation
- **WHEN** a supporter with a pending cancellation chooses restore
- **THEN** the client clears the pending-cancellation state and shows the subscription renewing normally

#### Scenario: Nothing to manage
- **WHEN** the portal, cancel or restore request returns 404 because no customer or active subscription exists
- **THEN** the client refreshes the status and shows the free state without reporting a false success

#### Scenario: Repeated submission
- **WHEN** a management action is already running
- **THEN** the action is disabled until it finishes

### Requirement: Billing failure states
When billing is not configured or temporarily unavailable, clients SHALL explain the situation, offer a retry where meaningful, and keep the rest of the app usable. Clients SHALL map 401 to sign-in, 404 to no subscription, 409 to existing subscription or no pending cancellation, and 503 to billing unavailable.

#### Scenario: Billing not configured
- **WHEN** a billing endpoint returns 503
- **THEN** the client shows that subscriptions are temporarily unavailable, starts no checkout and makes no entitlement claim

#### Scenario: Unauthenticated status read
- **WHEN** a protected billing request returns 401
- **THEN** the client treats the user as signed out and sends them to sign in without showing another user's data

#### Scenario: Network failure
- **WHEN** a billing request fails without a response
- **THEN** the client shows a retryable error and keeps the last server-confirmed state rather than inventing a new one

### Requirement: Web landing supporter offer
The public web landing SHALL present the supporter plan using server offers, a monthly/yearly selector and a call to action that opens `/supporter` with the selected interval. The landing SHALL NOT link to Patreon and SHALL NOT start checkout itself.

#### Scenario: Landing call to action
- **WHEN** a visitor selects yearly and activates the supporter call to action
- **THEN** the browser opens `/supporter?interval=yearly`

#### Scenario: Landing pricing
- **WHEN** the landing loads with a successful offers response
- **THEN** the monthly and yearly prices match the server-provided currency and display amounts

#### Scenario: No Patreon destination
- **WHEN** a visitor inspects the landing supporter section or footer
- **THEN** no link points to Patreon and every supporter action leads to the in-app flow

### Requirement: Mobile supporter surface
Mobile SHALL expose the supporter screen from Preferences and SHALL open checkout in the system in-app browser rather than an embedded Stripe page or the app WebView. The supporter route SHALL remain reachable while signed out so it can explain the plan and start sign-in.

#### Scenario: Preferences entry
- **WHEN** a signed-in mobile user opens Preferences
- **THEN** a Supporter section shows the current state and opens the in-app supporter screen

#### Scenario: Mobile checkout
- **WHEN** a mobile user starts checkout
- **THEN** the server-returned URL opens in the system in-app browser and the app remains responsible for refreshing status afterwards

#### Scenario: Signed-out mobile supporter screen
- **WHEN** a signed-out mobile user opens the supporter screen
- **THEN** the screen shows the plans and sends the user to sign in when they choose one

### Requirement: Benefit availability labeling
Clients SHALL distinguish benefits available today from benefits announced for later. The supporter badge, supporter theme, animated border, custom covers, live profile, supporters wall, collection limit and similar unshipped items SHALL be labeled "Coming soon" / "Em breve", SHALL NOT be presented as included or usable today, and SHALL NOT gate features that are free today. The video cover SHALL NOT be labeled "Coming soon" / "Em breve".

#### Scenario: Plan copy
- **WHEN** a user reads the supporter plan description
- **THEN** available benefits are presented as available and unshipped benefits are explicitly marked "Coming soon" / "Em breve"

#### Scenario: Localized coming-soon label
- **WHEN** the active language is English or Brazilian Portuguese
- **THEN** upcoming benefits use "Coming soon" or "Em breve" respectively, without exposing a translation key

#### Scenario: Settings surface
- **WHEN** a user opens the supporter settings
- **THEN** upcoming benefits appear as a non-interactive coming-soon list, with no locked toggle or fake profile preview presented as usable

#### Scenario: Free features unchanged
- **WHEN** a free user uses the library, collections, imports, achievements or reviews
- **THEN** no supporter paywall or lock is shown

#### Scenario: Video cover availability
- **WHEN** a user reads the supporter plan copy or the supporter feature catalog
- **THEN** the video cover is presented as an available supporter benefit and is not labeled "Coming soon" / "Em breve"

#### Scenario: GIF retirement ownership
- **WHEN** a client explains why GIF avatar or banner uploads are no longer accepted for any user
- **THEN** the restriction is presented as a format change owned by `profile-video`, not as a supporter entitlement, gate or lock

### Requirement: Patreon removal
All previous Patreon purchase destinations in web and mobile SHALL be removed and replaced by the in-app supporter flow.

#### Scenario: Legacy Patreon links
- **WHEN** a user checks the landing, the settings supporter tab or the About page
- **THEN** no Patreon link remains and each former destination leads to the supporter flow or the support contact instead
