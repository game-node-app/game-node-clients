# Proposal

## Why

The server change `add-supporter-profile-perks` (game-node-server) now ships supporter preferences, live presence, the supporters wall and a 5-collection creation limit for free accounts. The clients still show every one of these perks as "Coming soon", have no way to edit them, and promise that "everything you use today stays free", which the new collection limit makes false. The client work must ship with or before the server deploy so the copy is never wrong and supporters can use what they pay for.

## What Changes

- **Wrapper:** copy the regenerated `server_swagger.json` from game-node-server and run `yarn wrapper:generate`. New: `ProfileResponseDto.isSupporter` / `supporterPreferences`, `ProfileService.supporterPreferencesControllerUpdateV1`, `ProfileService.profilePresenceControllerGetPresenceV1`, `SupportersService.supportersControllerGetWallV1`, and their DTOs (method names follow the swagger `operationId`s; confirm after generation).
- **Profile header perks (web and mobile, shared `ProfileUserInfoWithBanner`):** for a supporter whose preferences are present, render
  - an animated accent ring around the avatar (`showAnimatedAvatarBorder`), static when the viewer prefers reduced motion;
  - a "Supporter" badge next to the username (`showBadge`) and the selected title under it (`titleKey`, client-owned catalog; unknown keys render nothing);
  - the supporter theme on the profile header only (`showSupporterTheme` + `accentColor`): an accent strip under the banner with a "Supporter" label and a tinted info column, with client-enforced contrast;
  - a "Playing now" chip from `GET /v1/profile/:id/presence` when `showLiveProfile` is on, polled at most every 60 s and only while the profile screen is visible.
- **Compact badge elsewhere:** the shared avatar-with-name component (`UserAvatarGroup`, used in reviews, activity, comments and user lists) shows a small static crown next to a supporter's username when `showBadge` is on. No animated rings and no presence outside the profile header.
- **Supporter settings (web tab and mobile screen):** replace the "Coming soon" catalog with a "How you appear" section following the Figma Version 3.0 frames (P-D01/P-D07): for supporters, real controls (theme + accent color, badge, title, animated border, supporters wall, live profile) saved immediately through `PATCH /v1/profile/supporter-preferences` with a "Saved" status, next to a live profile preview. Free users see the same rows with locked, disabled switches and an example preview of their own profile. A Library card shows unlimited collections ("Included" / "Supporters") and uploaded custom covers as "Coming soon".
- **Supporters wall:** a shared, paginated `SupportersWall` (avatar + username, links to the profile) rendered as a section of the web About page and, since mobile has no About page, at the end of the mobile Supporter screen.
- **Collection limit (BREAKING for free users, server-driven):** `CollectionCreateOrUpdateForm` branches on the 403 body `code === "collection_limit_reached"` and shows an inline limit notice with the server's `limit` and a "Become a Supporter" link, instead of the generic error notification. Other errors keep the existing handling.
- **Copy reconciliation (en + pt-BR):** remove "Everything you use today stays free" and "Nothing that's free today will become paid" everywhere, state the 5-collection free limit, list collections as "Up to 5 collections" in the always-free lists, move the shipped perks to "available" on the landing pricing card and in settings, and fix the live-profile copy (Steam game, not Twitch/Kick).
- **Spec reconciliation:** modify `supporter-subscriptions` so shipped perks are no longer required to be "Coming soon", free users may see supporter perks as locked switches in the Supporter settings, and clients may gate collection creation past the server's free limit.

## Capabilities

### New Capabilities

- `supporter-profile-perks`: how clients render a supporter's badge, title, animated avatar border, profile theme and accent color, and how supporters edit those preferences.
- `profile-live-presence`: the "Playing now" indicator on a profile and its polling rules.
- `supporters-wall`: the public list of supporters and where clients show it.
- `collection-creation-limit`: how clients handle the server's free-account collection creation limit.

### Modified Capabilities

- `supporter-subscriptions` (introduced by the unarchived `add-supporter-subscriptions` and modified by `redesign-supporter-settings`; archive this change after both): "Benefit availability labeling" no longer forbids gating collection creation and lists only unshipped perks as "Coming soon"; "Supporter settings content" adds the perks controls for supporters and the wall on mobile.

## Impact

- **Wrapper (`packages/wrapper`):** `input/server_swagger.json` replaced from game-node-server; generated `server/` regenerated. Only additive changes (6 schemas, 3 paths, 2 fields on `ProfileResponseDto`).
- **Shared UI (`packages/ui`):** new `components/supporter/perks/` (badge, title, avatar frame, theme helpers, accent contrast util, title catalog, preferences form, presence chip), `components/supporter/wall/`, new hooks (`useUpdateSupporterPreferences`, `useProfilePresence`, `useInfiniteSupportersWall`), edits to `ProfileUserInfoWithBanner`, `UserAvatarGroup`, `SupporterSettingsView`, `SupporterProfilePreview` (reworked), `SupporterFeatureCatalog` (replaced by `SupporterPerksSettings`), `SupporterAlwaysFreeCard`, `CollectionCreateOrUpdateForm`; barrels regenerated.
- **Web (`apps/web`):** About page gets the wall section; landing `SupporterSection` item lists change.
- **Mobile (`apps/mobile`):** Supporter screen shows the wall; new Vitest suites for the hooks and components.
- **Locales:** new `supporter.perks.*`, `supporter.titles.*`, `supporter.wall.*`, `supporter.presence.*`, `collection.limit.*` keys; revised free/always-free/landing copy in both languages; regenerated types.
- **Deploy order:** the copy and limit handling must ship no later than the server deploy. Rendering code tolerates a server without the new fields (`isSupporter` missing → not a supporter).
- **Changeset:** `web` and `mobile` (minor).
- **No new dependencies.** Admin and desktop clients are out of scope.
