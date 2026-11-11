# Spec Delta

## MODIFIED Requirements

### Requirement: Supporter settings content
The Supporter surface SHALL show, in order: a summary with the current plan state, the plan choice for users without a subscription or the subscription details and actions for users with one, the supporter features (the "How you appear" perks controls with a preview: working controls for users whose profile read returns supporter preferences, otherwise the same controls locked), the features that stay free, and how to get billing help. On mobile the supporters wall SHALL follow the billing help.

#### Scenario: Free user layout
- **WHEN** a signed-in user without a subscription opens the Supporter surface
- **THEN** they see the monthly/yearly selector with the server price and a subscribe action, followed by the locked supporter perks with an example preview and the free features

#### Scenario: Supporter layout
- **WHEN** a supporter opens the Supporter surface
- **THEN** they see their plan, billing interval, renewal or end date and the billing, cancel or keep actions, with no subscribe action, followed by the profile perks controls next to a live preview of their profile

#### Scenario: Billing unavailable
- **WHEN** billing returns 503 while the Supporter surface is open
- **THEN** the summary explains that subscriptions are temporarily unavailable, no subscribe action is enabled, and the supporter perks and free features still render

#### Scenario: Activation reaches the perks
- **WHEN** a checkout return confirms the subscription while the Supporter surface is open
- **THEN** the client refreshes the user's profile and the locked perks become working controls without a reload

#### Scenario: Mobile wall
- **WHEN** a signed-in mobile user scrolls to the end of the Supporter screen
- **THEN** the supporters wall is shown after the billing help

### Requirement: Benefit availability labeling
Clients SHALL distinguish benefits available today from benefits announced for later. The video cover, supporter badge, title, supporter theme with accent color, animated avatar border, live profile, supporters wall and unlimited collections SHALL be presented as available supporter benefits. Uploading your own game covers and other unshipped items SHALL be labeled "Coming soon" / "Em breve" for every user, supporters included, and SHALL NOT be presented as included, unlocked or usable today. Clients SHALL NOT gate any feature for free users except collection creation beyond the server's free limit, SHALL show locks only on supporter perks inside the Supporter settings, and SHALL NOT claim that everything free today stays free.

#### Scenario: Plan copy
- **WHEN** a user reads the supporter plan description
- **THEN** available benefits are presented as available, unshipped benefits are explicitly marked "Coming soon" / "Em breve", and the free plan states its collection limit

#### Scenario: Localized coming-soon label
- **WHEN** the active language is English or Brazilian Portuguese
- **THEN** upcoming benefits use "Coming soon" or "Em breve" respectively, without exposing a translation key

#### Scenario: Settings surface for free users
- **WHEN** a user without supporter preferences opens the Supporter settings
- **THEN** each available perk appears as a row with an icon, a title, a description and a disabled switch marked with a lock, a note says the perks are available with the Supporter plan and that the preview shows how the profile would look, no control can be changed and no request is sent, and unshipped items appear only with "Coming soon" and no switch or lock

#### Scenario: Supporter sees their perks
- **WHEN** a user whose profile read returns supporter preferences opens the Supporter settings
- **THEN** the available perks appear as working controls, unshipped items keep their "Coming soon" label, and nothing unshipped is shown as active

#### Scenario: Profile preview
- **WHEN** the Supporter settings show a preview of the user's profile with supporter styling
- **THEN** the preview is not interactive, is built only from the user's own public profile data, the billing status and the current perks values, and is labeled as an example for users without supporter preferences

#### Scenario: Supporter since
- **WHEN** a supporter opens the Supporter settings and `GET /v1/billing/me` returns `supporterSince`
- **THEN** the preview shows "Supporter since {year}" from that value, and when the server returns `null` (free users, or a server without the field) no "since" line is shown and no date is derived locally

#### Scenario: Free features unchanged
- **WHEN** a free user uses the library, existing collections, imports, achievements or reviews
- **THEN** no supporter paywall or lock is shown

#### Scenario: Collection creation limit
- **WHEN** a free user tries to create a collection and the server refuses it with `collection_limit_reached`
- **THEN** the client explains the free limit and offers the supporter plan, and this is the only feature the clients gate

#### Scenario: No blanket free promise
- **WHEN** a user reads the landing pricing, the About page or the Supporter settings in either language
- **THEN** no copy says that everything used today stays free or that nothing free will become paid, and the free plan lists collections as "Up to 5 collections"

#### Scenario: Video cover availability
- **WHEN** a user reads the supporter plan copy or the supporter features in settings
- **THEN** the video cover is presented as an available supporter benefit and is not labeled "Coming soon" / "Em breve"

#### Scenario: GIF retirement ownership
- **WHEN** a client explains why GIF avatar or banner uploads are no longer accepted for any user
- **THEN** the restriction is presented as a format change owned by `profile-video`, not as a supporter entitlement, gate or lock
