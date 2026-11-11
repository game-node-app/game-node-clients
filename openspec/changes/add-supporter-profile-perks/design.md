# Design

Visual reference: `mockups.html` in this folder (open it in a browser). It shows every surface below at real sizes, with the tokens used here. Where this document and the mockup disagree, this document wins.

Figma source (file `ikcThguwowTdynGz0L2YkS`, page "Version 3.0"), followed where it applies:

| Frame | Node | Used for |
| --- | --- | --- |
| P-D01 · Premium · Ativa (desktop) · v2 | `4967:8272` | Supporter view of the settings: "How you appear" card, live preview, "Saved" indicator (D7) |
| P-D07 · Premium · Não assinante, recursos bloqueados (desktop) · v2 | `4967:11450` | Free view: locked switches, footer note, "how it would look" preview (D9) |
| Profile | `5147:13867`, `4049:464` | Supporter strip under the banner with the "Supporter" label (D4) |
| Comparação / Grátis x Apoiador | `4786:3054` | Landing pricing groups and the "Up to 5" collections row (D14) |
| Grupo / Badge Premium (roxo só para Premium) | `5051:14621` | Badge pill colors (D4) |

Deliberate differences from Figma, decided with the product owner: the frames say "Premium" while the shipped product says "Supporter"/"Apoiador" (keep Supporter); "Título Premium" in Figma is an on/off "Premium desde 2025" line, but we build a title picker from the client catalog (the server stores a `titleKey`, and the public profile has no subscription start date); Figma has no accent color, we keep a picker with violet as default; Figma's live row says Twitch/Kick, the server ships Steam "now playing". The animated border and live profile rows are additions Figma's settings card does not show (its pricing comparison lists both). The "Temas especiais" app themes in "Aparência e idioma" (`4993:13889`) are free app themes, not supporter perks, and are out of scope.

## Context

See `proposal.md` for motivation and `specs/` for the behavior. Current state that shapes the approach:

- **Contract.** game-node-server's working tree (`feature/add-custom-game-covers` branch, uncommitted `add-supporter-profile-perks`) has the regenerated `server_swagger.json`. Compared with ours it only adds: paths `PATCH /v1/profile/supporter-preferences` (`SupporterPreferencesController_update_v1`, tag `profile`), `GET /v1/profile/{id}/presence` (`ProfilePresenceController_getPresence_v1`, tag `profile`), `GET /v1/supporters` (`SupportersController_getWall_v1`, tag `supporters`); schemas `SupporterPreferencesResponseDto`, `UpdateSupporterPreferencesDto`, `SupporterWallItemDto`, `PaginatedSupportersResponseDto`, `ProfilePresenceResponseDto`, `PlayingGameDto`; and `isSupporter` + `supporterPreferences` on `ProfileResponseDto`. `POST /v1/collections` has no typed error body; the 403 body arrives in `ApiError.body`.
- **Profile data.** `useUserProfile(userId)` (key `["userProfile", userId]`) calls the public `GET /v1/profile/:id` and is used by ~95 components, including `UserAvatar` and `UserAvatarGroup`. Every avatar therefore already has its owner's `isSupporter`/`supporterPreferences` in cache: badges in lists cost no extra request.
- **Profile header.** `ProfileUserInfoWithBanner` (shared) renders banner, avatar, username and the `ProfileUserInfo` presenter for both web (`pages/profile/[userId]/index.tsx`, SSR-prefetches the profile) and mobile (`pages/profile/profile.tsx`; branches on `useOnMobilePlatform`; mobile swaps `ProfileUserInfo` for `MobileProfileUserInfo`).
- **Supporter settings.** `SupporterSettingsView` (web `SettingsPremiumTab`, mobile `preferences_supporter.tsx`) renders banners → `SupporterHeroCard` → `SupporterSubscriptionCard` → `SupporterFeatureCatalog` (rows with "Coming soon", plus `SupporterProfilePreview`, a hard-coded violet mock) → `SupporterAlwaysFreeCard` → billing help. Primitives: `SettingsSection`, `SettingsCard`, `SettingsRow` (`leftSection`/`rightSection`/`stackRightSection`/`disabled`), `SettingsIconTile`, `SettingsPill` (`premium` tone `bg-[rgba(151,71,255,0.16)] text-[#c7a6ff]`), `SettingsComingSoonBadge`. Supporter violet is `#9747ff`.
- **Visibility.** `UIHookRegistry.useIsViewActive` (mobile: `useIonViewActive`) tells whether an Ionic page is the visible one; web has no entry (treat as `true`). Plain values also live in the registry (`authPath`).
- **Supporter links.** `getSupporterSettingsHref()` returns `/home?settings=premium`. Mobile's `LinkWrapper` only prefixes the tab, so that href does not reach `/preferences/supporter` on mobile; `PreferencesSupporterItems` links to `getTabAwareHref("/preferences/supporter")` directly.
- **Reduced motion.** Existing code uses `useReducedMotion` from `@mantine/hooks` and `@media (prefers-reduced-motion: reduce)` in CSS modules.
- **Mobile WebView.** Android WebView versions vary; avoid `color-mix()` and other recent CSS. Precompute colors in JS.

## Goals / Non-Goals

**Goals:**

- One set of shared perk components (badge, title, avatar frame, theme variables, presence chip) used by the profile header, lists and the settings preview, so all three always agree.
- Optimistic, per-field preference saves that never let a failed request clobber a concurrent one.
- Presence requests that cost nothing unless someone is looking at a live profile.
- Copy that is true on the day the server deploys.

**Non-Goals:**

- App-wide theming. The theme is the profile header only; `DEFAULT_MANTINE_THEME` and Mantine palettes do not change.
- Animated borders or presence outside the profile header and the settings preview.
- Proactively blocking the collection form from a client-side count. The server decides (see D8).
- Admin and desktop clients. Uploading your own game covers (stays "Coming soon").

## Decisions

### D1. Wrapper regeneration first

Copy `/home/cassi/projects/game-node-server/server_swagger.json` over `packages/wrapper/input/server_swagger.json`, run `yarn wrapper:generate`, and confirm the generated method names (`ProfileService.supporterPreferencesControllerUpdateV1`, `ProfileService.profilePresenceControllerGetPresenceV1`, `SupportersService.supportersControllerGetWallV1`). The diff must be additive only; if anything else changes, stop and compare with the server branch. Everything else builds on these types.

### D2. One derived "active perks" object

`packages/ui/src/components/supporter/perks/supporterPerks.ts`:

```ts
export const DEFAULT_SUPPORTER_ACCENT = "#9747FF";
export const DEFAULT_SUPPORTER_PREFERENCES: SupporterPreferencesResponseDto = {
  showBadge: true, titleKey: null, showAnimatedAvatarBorder: true,
  showSupporterTheme: true, accentColor: null,
  showOnSupportersWall: true, showLiveProfile: false,
};

export interface ActiveSupporterPerks {
  badge: boolean;
  titleKey: SupporterTitleKey | null;   // null when unknown to the catalog
  border: boolean;
  theme: boolean;
  liveProfile: boolean;
  accent: string;         // stored or default, "#RRGGBB"
  accentText: string;     // readable on #161616 (>= 4.5:1)
  accentDecor: string;    // readable on #161616 (>= 3:1)
  accentSoft: string;     // rgba(accent, 0.14) for tinted panels
  accentBorder: string;   // rgba(accent, 0.45) for pill borders
  onAccent: string;       // #FFFFFF or #141414, text drawn on the accent
}

export function getActiveSupporterPerks(
  profile: Pick<ProfileResponseDto, "isSupporter" | "supporterPreferences"> | undefined | null,
): ActiveSupporterPerks | null
```

It returns `null` unless `profile?.supporterPreferences` is an object (covers lapsed users, failed lookups and an old server without the fields). A thin hook `useSupporterPerks(userId)` wraps `useUserProfile` + this function. Every renderer takes `ActiveSupporterPerks | null`, never the raw DTO, so a settings preview can pass draft values through the same function (`getActiveSupporterPerks({ isSupporter: true, supporterPreferences: draft })`).

Alternative: read `profile.supporterPreferences` ad hoc in each component. Rejected: the null rules, catalog filtering and contrast math would be duplicated in four places.

### D3. Accent contrast math

`packages/ui/src/components/supporter/perks/accentColor.ts`, pure functions:

- `normalizeAccentHex(value): string | null` → `#RRGGBB` uppercase, or null if not 6-digit hex.
- `getRelativeLuminance(hex)`, `getContrastRatio(a, b)` (WCAG 2.x formula).
- `getReadableAccent(hex, surface = "#161616", minRatio)` → mixes the color toward white in 5% steps until the ratio is met (max 20 steps → white). If the color is already too light it is returned unchanged (all surfaces are dark).
- `hexToRgba(hex, alpha)`.
- `getOnAccentText(hex)` → `#FFFFFF` or `#141414`, whichever has the higher contrast on `hex` (for the "Supporter" label drawn on the strip).

Text uses `minRatio = 4.5`, rings/strips use `3`. Mixing is per channel, `c + (255 - c) * t`, rounded. Test vectors on `#161616`: `#9747FF` is 4.02:1, so text → `#A159FF` (t = 0.10) and decor stays `#9747FF`; `#101010` → text `#888888` (t = 0.50), decor `#646464` (t = 0.35); `#FF8800` (7.56:1) and `#F15025` (5.1:1) stay unchanged.

### D4. Profile header rendering

`ProfileUserInfoWithBanner` reads `useSupporterPerks(userId)` and:

1. Sets CSS variables on its root `Stack` when `perks` is non-null: `--supporter-accent`, `--supporter-accent-text`, `--supporter-accent-soft`, `--supporter-accent-border` (only used by descendants that opt in).
2. **Theme (`perks.theme`)**, after Figma `5147:13867`: a 21px strip in `var(--supporter-accent)` rendered inside `ProfileBanner` directly under its image, spanning the banner container edge to edge (web: full container width, cancelling the banner's `p-4`; mobile: full viewport width), no radius, flush with the image. Its right end shows the label `t("supporter.badge.label")` in `fz=10 fs=italic fw=500`, color `perks.onAccent`, `pe-6`, vertically centered. The avatar keeps its position and overlaps the strip (it is above it in z-order). The whole left info column gets `background: linear-gradient(180deg, var(--supporter-accent-soft) 0px, var(--supporter-tint-end) 240px)` on web and mobile, where the end color is `#151515` on web and the mobile page color `#111111` so the tint covers the avatar, name, actions, bio and info presenter without a hard edge. The username stays white (as in Figma). Nothing outside this component changes.
3. **Avatar**: wraps the existing `UserAvatar` in `SupporterAvatarFrame` (D5) when `perks.border`. Same size as today (`8rem` mobile platform, `10rem` web); the frame adds 6px outside (3px ring + 3px gap) and keeps the `-translate-y-3/4` placement. When the border is off the avatar keeps today's `border-[#161616] border-4`.
4. **Name block** (replaces the `w-36` box): `Stack gap=4 align=center` (mobile platform: `align=flex-start`, `ps-2`), max width 18rem:
   - `Group gap=6 nowrap`: username (`Text` as today, white) + `SupporterBadge variant="full"` when `perks.badge`.
   - `SupporterTitle` when `perks.titleKey`: `Text fz=13 fw=500`, color `--supporter-accent-text` when theme on, else `#adadad`.
   - `SupporterPresenceChip` when `perks.liveProfile` (D6).
5. Edit modal, banner and `ProfileUserInfo` presenter are untouched.

`SupporterBadge`:
- `variant="full"`: pill `h-5 px-1.5 gap-1 rounded`, crown `IconCrown size=13`, label `t("supporter.badge.label")` at `fz=11 fw=600`. Colors: theme on → `bg: accentSoft`, `border: 1px solid accentBorder`, `color: accentText`; theme off → the `premium` pill colors (`rgba(151,71,255,0.16)` / `#c7a6ff`, border `rgba(151,71,255,0.45)`).
- `variant="compact"`: `IconCrown size=14 stroke=2` only, same color rule, `role="img"` with `aria-label={t("supporter.badge.label")}` and a Mantine `Tooltip` with the same label on web. No pill background.

### D5. Animated avatar frame

`SupporterAvatarFrame.tsx` + `SupporterAvatarFrame.module.css`:

```css
.frame { position: relative; border-radius: 9999px; padding: 6px; }
.frame::before {               /* rotating ring */
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: conic-gradient(
    var(--ring) 0%, var(--ring-soft) 35%, var(--ring) 50%, var(--ring-soft) 85%, var(--ring) 100%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  animation: spin 6s linear infinite;
}
.static::before { animation: none; }
@media (prefers-reduced-motion: reduce) { .frame::before { animation: none; } }
@keyframes spin { to { transform: rotate(360deg); } }
.inner { border-radius: 9999px; background: #161616; padding: 3px; }  /* the gap */
```

(Rotate the pseudo-element with `transform`, not `@property --angle`, for older WebViews.) `--ring` = `accentDecor`, `--ring-soft` = `hexToRgba(accent, 0.25)`. Props: `accent`, `animated` (false in lists, never used there today), `children`. `useReducedMotion()` adds `.static` too, so JS-driven tests can assert it.

### D6. Presence

Hook `useProfilePresence(userId, enabledByPreference)` in `supporter/hooks/`:

```ts
const { useIsViewActive } = useHooks();
const isViewActive = useIsViewActive?.() ?? true;
useQuery({
  queryKey: getProfilePresenceQueryKey(userId),       // ["profile", "presence", userId]
  queryFn: () => ProfileService.profilePresenceControllerGetPresenceV1(userId!),
  enabled: !!userId && enabledByPreference && isViewActive,
  refetchInterval: 60_000,
  refetchIntervalInBackground: false,   // stops when tab/app is hidden
  staleTime: 60_000,                    // remounts inside the window reuse the result
  retry: false,
});
```

Returns `ExtendedUseQueryResult<ProfilePresenceResponseDto>`. Only `SupporterPresenceChip` calls it, and only `ProfileUserInfoWithBanner` renders the chip. `staleTime` + interval guarantee ≤1 request/60 s per profile even with refetch-on-focus/mount defaults.

`SupporterPresenceChip` (renders nothing while loading, on error, or when `playing` is null):
- Pill `h-7 px-2.5 gap-1.5 rounded-full`, `bg: accentSoft` (theme on) or `#1f1f1f`, border `1px solid` `accentBorder` or `#2a2a2a`.
- Leading 6px dot `#3dd68c` with a 2s pulse (`animation: none` under reduced motion), `IconBrandSteam size=14 #adadad`, text `fz=12 fw=500`: "Playing now" (`#adadad`) + " · " + game name (`white`, truncated, max width 14rem).
- `gameId` present → whole chip is a `Link` to `/game/${gameId}`; otherwise a `Box`. `aria-label` "Playing now: {name}".

### D7. Settings: "How you appear" and live preview

Follows Figma P-D01 (`4967:8272`) for supporters and P-D07 (`4967:11450`) for free users. Both use one component, `SupporterPerksSettings`, with `mode: "edit" | "locked" | "unavailable"`, so a free user sees exactly the controls they would get.

`SupporterSettingsView` picks the mode:

- `ownProfile = useUserProfile(userId)`; `perksPrefs = ownProfile.data?.supporterPreferences ?? null`.
- **Prefs present** → `mode="edit"`.
- **Billing says supporter but prefs null** (and profile not loading) → `mode="unavailable"`: rows as in `edit` but disabled, with an inline `SupporterSettingsBanner`-style message (`supporter.perks.errors.missing`) and "Try again" (`ownProfile.invalidate()`).
- **Otherwise** (free, lapsed, signed out of billing) → `mode="locked"` (D9).
- Effect: when `status.data?.isSupporter` is defined and differs from `ownProfile.data?.isSupporter`, call `ownProfile.invalidate()` once per change (checkout activation, cancellation end, restore).

Layout: the section that `SupporterFeatureCatalog` renders today is replaced by `SupporterPerksSettings` (same grid: `grid-cols-1 @[600px]:grid-cols-[minmax(0,1fr)_280px] gap-5`). `SettingsSection` title `supporter.perks.heading` ("How you appear"), description `supporter.perks.description` ("Turn each perk on or off anytime. We save right away."). In `edit` mode its `rightSection` is a save status: `Text fz=12 #adadad` "Saving…" while a preferences mutation is pending, then `IconCheck size=14 #3dd68c` + "Saved" after the last one succeeded; nothing before the first change or after an error (the error has its own notification). It reads `useMutationState({ filters: { mutationKey: SUPPORTER_PREFERENCES_MUTATION_KEY }, select: (m) => m.state.status })`: any `"pending"` → Saving; otherwise the last entry `"success"` → Saved, `"error"` → nothing. All rows share it because they all use the same key (D8).

Left column, two `SettingsCard`s:

1. **Perks card** (no label above it, as in Figma), rows in this order:
   - Supporter theme — `IconBrush` tile — `Switch` (`showSupporterTheme`). Description `supporter.perks.theme.description`.
   - Accent color — `IconPalette` — description `supporter.perks.accent.description` ("Used by your avatar border, badge and profile theme."), `stackRightSection`; right section is `SupporterAccentPicker`. Shown in `edit` and `unavailable` only.
   - Badge — `IconCrown` — `Switch` (`showBadge`). Description `supporter.perks.badge.description` ("Next to your name on your profile, in reviews and in comments.").
   - Title — `IconTag` — `Select` (w 200, `allowDeselect={false}`, data: `{ value: "", label: t("supporter.perks.titleSelect.none") }` + catalog entries sorted by translated label). Selecting `""` sends `null`. Uses `stackRightSection`.
   - Animated border — `IconCircleDashed` — `Switch` (`showAnimatedAvatarBorder`).
   - Supporters wall — `IconHeart` — `Switch` (`showOnSupportersWall`). Description `supporter.perks.wall.description`; when the view is rendered without its own wall (`withSupportersWall` false, i.e. web), the description ends with an inline `Link` "See the wall" (`supporter.perks.wall.seeWall`) to `/about#supporters`.
   - Live profile — `IconBroadcast` — `Switch` (`showLiveProfile`). Description `supporter.perks.live.description`; in `edit` mode, when `useOwnUserConnectionByType(STEAM)` resolves to no connection, append `supporter.perks.live.needsSteam` in `#ffb224`. The switch stays enabled (the server stores the choice).
2. **Library** card, label `supporter.perks.groups.library` (`Text fz=13 fw=600 #adadad` above it, as in the catalog today):
   - Unlimited collections — `IconStack2` — description `supporter.features.collectionLimit.description`; right section `SettingsPill tone="success"` "Included" (`supporter.perks.included`) in `edit`/`unavailable`, `SettingsPill tone="premium"` "Supporters" in `locked`.
   - Custom game covers — `IconPhoto` — `SettingsComingSoonBadge` in every mode.

Icon tiles keep the catalog's violet tile classes. Every `Switch` uses `size="md"`, default color (brand), `aria-label` = row title.

`SupporterAccentPicker`: a row of 9 swatch buttons (24px circles, 8px gap, 2px white ring + check icon on the selected one, `aria-pressed`, `aria-label` = hex), then a Mantine `ColorInput` (`format="hex"`, `w=120`, `size="xs"`, `withEyeDropper={false}`, `swatches` off) whose `onChangeEnd`/blur commits a valid value, then a subtle `Button size="compact-xs"` "Reset" (sends `null`, hidden when `accentColor` is null). Presets: `#9747FF` (default), `#F15025`, `#FF8800`, `#F5C542`, `#3DD68C`, `#2EB8E6`, `#4C7DFF`, `#FF5FA2`, `#E5484D`. Invalid input shows `supporter.perks.accent.invalid` and sends nothing.

Right column: `SupporterProfilePreview` reworked to take `perks: ActiveSupporterPerks | null`, `caption` and `onWall: boolean | null`. It renders a scaled-down header (banner 76px, the 21px theme strip with its "Supporter" label, `SupporterAvatarFrame` around a 48px `UserAvatar`, username + `SupporterBadge`, `SupporterTitle`, a static sample presence chip only when `liveProfile` — text `supporter.perks.preview.samplePresence` "Playing now · …", never a real request), keeps follow stats, "Favorites" and "Supporter since". Under the card, a footer line with `IconHeart size=14`: "On the supporters wall" (`supporter.perks.preview.onWall`) or "Not on the supporters wall" (`.notOnWall`) from `onWall`; hidden when `onWall` is null. Caption above the card:

- `edit`: `perks` from current values (including in-flight optimistic ones, since they are in the query cache), caption `supporter.perks.preview.caption` ("Live preview"), `onWall = prefs.showOnSupportersWall`.
- `locked` / `unavailable`: `perks = getActiveSupporterPerks({ isSupporter: true, supporterPreferences: DEFAULT_SUPPORTER_PREFERENCES })`, caption `supporter.perks.preview.exampleCaption` ("Preview: how it would look"), `onWall = null`.

The old "not listed publicly" footer line is removed (it was a placeholder).

### D8. Preference mutation

`useUpdateSupporterPreferences()` in `supporter/hooks/`:

- `mutationKey: SUPPORTER_PREFERENCES_MUTATION_KEY` (`["supporter", "preferences", "update"]`, exported from `supporterQueryKeys.ts`).
- `mutationFn(patch: UpdateSupporterPreferencesDto)` → `ProfileService.supporterPreferencesControllerUpdateV1(patch)`.
- `onMutate`: `cancelQueries(["userProfile", userId])`; read current prefs; store `previous = pick(currentPrefs, Object.keys(patch))` (only the fields in this patch); `setQueryData` merging `patch` into `supporterPreferences`. Return `{ previous }`.
- `onError`: merge `previous` back (only those keys, so a concurrent successful change to another field survives). `ApiError` 403 → `notifications.show({ color: "red", message: t("supporter.perks.errors.notSupporter") })` and invalidate `["userProfile", userId]` and `SUPPORTER_QUERY_KEYS.me`; otherwise `createErrorNotification`.
- `onSuccess(result)`: `setQueryData` replacing `supporterPreferences` with `result` (the server's full values).
- `onSettled`: if `"showOnSupportersWall" in patch` → invalidate `SUPPORTERS_WALL_QUERY_KEY` (`["supporters", "wall"]`); if `"showLiveProfile" in patch` → `removeQueries(getProfilePresenceQueryKey(userId))`.

Each control calls `mutate({ field: value })` immediately; there is no save bar. Controls read their value from the cache, so they reflect optimistic state and never flash.

Alternative: a form with a save button (like the profile tab's action bar). Rejected: these are independent toggles, the server supports partial updates, and the live preview already shows the effect.

### D9. Free-user view (locked perks)

Free and lapsed users get `SupporterPerksSettings mode="locked"` (Figma P-D07) instead of a separate catalog. `SupporterFeatureCatalog` is deleted together with its test; `supporter-perks-settings.test.tsx` covers the locked mode.

- Same rows and order as `edit`, minus Accent color.
- Each `Switch` is `disabled`, `checked` from `DEFAULT_SUPPORTER_PREFERENCES` (so it matches the example preview), and has an `IconLock size=14 #adadad` before it with `aria-hidden`; the switch's `aria-label` becomes "{row title}, {supporter.perks.locked.label}" ("Available with the Supporter plan").
- Title `Select` is `disabled` and shows "No title".
- No "Saved" status; no mutation hook is called.
- Under the perks card, a footer `Text fz=12 #adadad`: `supporter.perks.locked.note` ("Available with the Supporter plan. The preview shows how your profile would look.").
- Library card as in D7 with the "Supporters" pill.

These locked switches are the only lock shown in the clients, and only on supporter perks inside the Supporter settings. Free features (library, collections already owned, imports, achievements, reviews) never show a lock. The plan summary and subscribe action above the section are unchanged.

### D10. Compact badge in lists

`UserAvatarGroup` renders `<SupporterBadge variant="compact" perks={perks} />` right after the username `Text` (inside the same `Group`, `gap` unchanged) when `perks?.badge`. `perks` comes from the profile query the component already runs. No other list component changes in this change; components that print a username without `UserAvatarGroup` are left as they are.

### D11. Supporters wall

Hook `useInfiniteSupportersWall({ limit })` (`useInfiniteQuery`, key `["supporters", "wall", limit]`, `initialPageParam: 0`, `getNextPageParam: (last, pages) => last.pagination.hasNextPage ? pages.length * limit : undefined`, `staleTime: 5 * 60_000`). Exported `SUPPORTERS_WALL_QUERY_KEY = ["supporters", "wall"]` for invalidation. Returns `ExtendedUseInfiniteQueryResult`.

`SupportersWall` (`supporter/wall/`), prop `variant: "page" | "settings"`:

- **page** (web About): full-width section `bg-[#101010] py-24 px-4`, inner `max-w-[1100px] mx-auto`. Header centered: `h2` `font-bold text-4xl sm:text-5xl` "Supporters wall", subtitle `font-light sm:text-xl #adadad`. Grid `grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-x-4 gap-y-6 mt-12`. Item: link to `/profile/${userId}`, `Stack align=center gap=8`, avatar 72px (`Avatar` with `getS3StoredUpload` of the wall item's `avatar`, default avatar when null; wall items carry no video), username `fz=13 truncate max-w-full #d9d9d9`, hover: avatar ring `2px #9747ff`. `limit = 48`. Footer: "Show more" `Button variant="default" radius="xl"` while `hasNextPage`. Loading: 12 skeleton circles. Empty: crown icon tile, `supporter.wall.empty.title/description`, brand `Button` "Become a Supporter" with `useSupporterEntryHref()`. Error: text + "Try again" (`refetch`).
- **settings** (mobile Supporter screen): `SettingsSection` (title/description as above) + `SettingsCard p-4`, grid `grid-cols-4 gap-3`, avatar 48px, username `fz=11`. `limit = 24`. Same states, compact.

Placement: `apps/web/src/pages/about.tsx` inserts `<SupportersWall variant="page" />` after the "Support GameNode" block and before the footer, with `id="supporters"` for linking. Mobile: `SupporterSettingsView` gets `withSupportersWall?: boolean`; `preferences_supporter.tsx` passes `true`; the web settings tab does not.

### D12. Collection limit

- `packages/ui/src/components/collection/util/getCollectionLimitError.ts`: `getCollectionLimitError(error: unknown): { limit: number | null } | null` — returns non-null only for `ApiError` whose `body?.code === "collection_limit_reached"`; `limit` is `body.limit` when it is a positive integer.
- `CollectionCreateOrUpdateForm`: `onError: (error) => { if (!getCollectionLimitError(error)) createErrorNotification(error); }`. In the body, when `collectionMutation.isError`: limit error → `<CollectionLimitNotice limit={…} onNavigate={onClose} />`, otherwise the existing `CenteredErrorMessage`. Submit stays enabled; the next submit resets the mutation as usual.
- `CollectionLimitNotice` (`collection/form/`): `Paper radius="md" p="md"` with `border: 1px solid rgba(151,71,255,0.45)`, `background: rgba(151,71,255,0.08)`. `Group nowrap align=flex-start gap=12`: `SettingsIconTile Icon={IconStack2}` (violet tile) + `Stack gap=4`: title `fw=600` `collection.limit.title` ("You've reached the free limit of {{limit}} collections"; `collection.limit.titleNoCount` when `limit` is null), description `fz=13 #adadad` `collection.limit.description`, then a `Link` styled as `Button size="xs" color="brand"` "Become a Supporter" pointing at `useSupporterSettingsHref()` and calling `onNavigate` on click.
- `useSupporterSettingsHref()` (`supporter/util/`): returns `useHooks().supporterSettingsHref ?? getSupporterSettingsHref()`. Add optional `supporterSettingsHref?: string` to `UIHookRegistry`; mobile sets `"/preferences/supporter"` (its `LinkWrapper` adds the tab). Switch `ProfileVideoSupporterNotice` to this hook too, since it has the same mobile problem.

Alternative: check `collections.length >= 5 && !isSupporter` before submit. Rejected: it hard-codes the server's limit and entitlement rule; the server already returns both in the error.

### D13. Title catalog

`supporter/perks/supporterTitles.ts`:

```ts
export const SUPPORTER_TITLE_KEYS = [
  "supporter", "patron", "collector", "completionist", "explorer",
  "critic", "night_owl", "retro_fan", "speedrunner", "cozy_gamer",
] as const;
export type SupporterTitleKey = (typeof SUPPORTER_TITLE_KEYS)[number];
export function isSupporterTitleKey(v: unknown): v is SupporterTitleKey
```

Labels at `supporter.titles.<key>`. Every key matches the server pattern `^[a-z0-9_-]{1,32}$` (a unit test asserts it). Adding a title later is a client-only change.

| key | en | pt-BR |
| --- | --- | --- |
| supporter | Supporter | Apoiador |
| patron | Patron | Mecenas |
| collector | Collector | Colecionador |
| completionist | Completionist | Completista |
| explorer | Explorer | Explorador |
| critic | Critic | Crítico |
| night_owl | Night Owl | Coruja Noturna |
| retro_fan | Retro Fan | Fã de Retrô |
| speedrunner | Speedrunner | Speedrunner |
| cozy_gamer | Cozy Gamer | Gamer Cozy |

### D14. Copy

Revised strings (both languages, keep keys unless noted):

| Key | en | pt-BR |
| --- | --- | --- |
| `landing.presentation.supporter.description` | Organizing your games stays free. The Supporter plan adds extras for your profile and keeps the project alive. | Organizar seus jogos continua grátis. O plano Apoiador adiciona extras para o seu perfil e mantém o projeto vivo. |
| `landing.presentation.supporter.free.description` | Everything you need to organize your games, with up to 5 collections. | Tudo o que você precisa para organizar seus jogos, com até 5 coleções. |
| `landing.presentation.supporter.plan.description` | Everything in Free, plus unlimited collections and extras for your profile. | Tudo do plano Grátis, mais coleções ilimitadas e extras para o seu perfil. |
| `landing.presentation.supporter.features.collections` | Up to 5 collections | Até 5 coleções |
| `landing.presentation.supporter.features.unlimitedCollections` (new) | Unlimited collections | Coleções ilimitadas |
| `landing.presentation.supporter.features.live` | What you're playing on Steam, live on your profile | O que você está jogando na Steam, ao vivo no seu perfil |
| `landing.presentation.supporter.features.badge` | Supporter badge and title next to your name | Selo e título de Apoiador ao lado do seu nome |
| `landing.presentation.supporter.features.theme` | Supporter profile theme in your accent color | Tema de Apoiador no perfil, na sua cor de destaque |
| `landing.presentation.supporter.trust.footer` | Your library, imports, reviews and achievements stay free. | Sua biblioteca, importações, análises e conquistas continuam grátis. |
| `supporter.subheading` | Your library, imports, reviews and achievements stay free. Your subscription pays for servers and development, keeping the project online. | Sua biblioteca, importações, análises e conquistas continuam grátis. Sua assinatura paga servidores e desenvolvimento, mantendo o projeto no ar. |
| `supporter.free.description` | Your library and everything you track stay free. Become a Supporter to keep GameNode online and unlock profile extras. | Sua biblioteca e tudo o que você acompanha continuam grátis. Seja Apoiador para manter o GameNode no ar e liberar extras de perfil. |
| `supporter.alwaysFree.description` | Free with or without a subscription. | Grátis com ou sem assinatura. |
| `supporter.benefits.available.collections` | Up to 5 collections | Até 5 coleções |
| `settings.premium.hero.description` | Your library, imports, reviews and achievements stay free. As a Supporter, your subscription pays for servers and development. | Sua biblioteca, importações, análises e conquistas continuam grátis. Como Apoiador, sua assinatura paga servidores e desenvolvimento. |
| `supporter.benefits.upcoming.collectionLimit` | Unlimited collections | Coleções ilimitadas |
| `supporter.features.collectionLimit.description` | Free accounts can create up to 5 collections. Supporters have no limit. | Contas grátis podem criar até 5 coleções. Apoiadores não têm limite. |
| `supporter.features.theme.description` | A Supporter look for your profile, in an accent color you choose. | Um visual de Apoiador para o seu perfil, na cor de destaque que você escolher. |
| `supporter.features.badge.description` | A Supporter badge and a title of your choice next to your name. | Um selo de Apoiador e um título à sua escolha ao lado do seu nome. |
| `supporter.features.liveProfile.description` | Show the Steam game you're playing right now on your profile. | Mostre no seu perfil o jogo da Steam que você está jogando agora. |

Landing `SupporterSection` keeps its grouped layout, which matches the Figma "Comparação / Grátis x Apoiador" frame (`4786:3054`): Free lists `INCLUDED_ITEMS` (`collections` now reads "Up to 5 collections"); Supporter lists an "Available now" group and a "Coming soon" group.

- `AVAILABLE_ITEMS = ["videoCover", "unlimitedCollections"]` followed by the profile perks, rendered as available (no clock icon, no gray badge): `AVAILABLE_GROUPS = [{ key: "profile", items: ["animatedBorder", "theme"] }, { key: "show", items: ["badge", "wall"] }, { key: "live", items: ["live"] }]`, reusing the existing group heading keys.
- `UPCOMING_GROUPS = [{ key: "library", items: ["customCovers"] }]` is the only "Coming soon" group.
- The live item keeps Steam (the server's provider); Figma's Twitch/Kick wording is not used.

Remove `supporter.features.descriptionSupporter`, `supporter.features.preview.caption`, `supporter.features.preview.notListed`, `supporter.features.groups.*` and the `supporter.features.<feature>.title/description` keys that only `SupporterFeatureCatalog` used, once nothing references them (check with `grep -rn` across `packages/ui` and `apps`). Keep `supporter.features.preview.*` keys the reworked preview still uses (followers, following, favorites, badge, since) and `supporter.features.collectionLimit.description`.

New keys (en; pt-BR translated in the same task). Where Figma has the Portuguese copy, use it with "Premium" replaced by "Apoiador": heading "Como você aparece"; badge description "Aparece no seu perfil, em reviews e em comentários."; title description "Aparece abaixo do seu nome no perfil."; locked note "Disponível no plano Apoiador. A prévia ao lado mostra como ficaria o seu perfil."; wall status "No mural de apoiadores" / "Fora do mural de apoiadores"; saved "Salvo".

- `supporter.badge.label` "Supporter"; `supporter.features.availableLabel` "Supporters"
- `supporter.perks.heading` "How you appear"; `.description` "Turn each perk on or off anytime. We save right away."; `.saving` "Saving…"; `.saved` "Saved"; `.groups.library` "Library"; `.included` "Included"
- `supporter.perks.theme.title` "Supporter theme" / `.description` "A strip in your accent color under your banner, with a Supporter label."
- `supporter.perks.accent.title` "Accent color" / `.description` "Used by your avatar border, badge and profile theme." / `.reset` "Reset" / `.invalid` "Use a color like #FF8800." / `.custom` "Custom color"
- `supporter.perks.badge.title` "Badge" / `.description` "Next to your name on your profile, in reviews and in comments."
- `supporter.perks.titleSelect.title` "Title" / `.description` "Shown under your name on your profile." / `.none` "No title"
- `supporter.perks.border.title` "Animated border" / `.description` "An animated ring around your avatar on your profile."
- `supporter.perks.wall.title` "Supporters wall" / `.description` "Show me on the public supporters wall." / `.seeWall` "See the wall"
- `supporter.perks.live.title` "Live profile" / `.description` "Show the Steam game you're playing on your profile." / `.needsSteam` "Connect your Steam account in Connections to use this."
- `supporter.perks.collections.title` "Unlimited collections"; `supporter.perks.customCovers.title` "Custom game covers" / `.description` "Upload your own cover for any game in your library."
- `supporter.perks.locked.label` "Available with the Supporter plan" / `.note` "Available with the Supporter plan. The preview shows how your profile would look."
- `supporter.perks.preview.caption` "Live preview" / `.exampleCaption` "Preview: how it would look" / `.samplePresence` "Playing now · Your current game" / `.onWall` "On the supporters wall" / `.notOnWall` "Not on the supporters wall"
- `supporter.perks.errors.notSupporter` "Your subscription isn't active, so this wasn't saved." / `.missing` "We couldn't load your perks right now." / `.retry` "Try again"
- `supporter.presence.playingNow` "Playing now"
- `supporter.wall.title` "Supporters wall" / `.description` "The people keeping GameNode online." / `.showMore` "Show more" / `.empty.title` "No supporters yet" / `.empty.description` "Be the first to keep GameNode online." / `.empty.cta` "Become a Supporter" / `.error` "We couldn't load the supporters wall." / `.retry` "Try again"
- `supporter.titles.*` (D13)
- `collection.limit.title` "You've reached the free limit of {{limit}} collections" / `.titleNoCount` "You've reached the free collection limit" / `.description` "Your existing collections stay as they are. Become a Supporter for unlimited collections, or remove one to make room." / `.cta` "Become a Supporter"

Run `yarn locales:generate-types` after editing `en.json`.

### D15. Module layout and exports

```
packages/ui/src/components/supporter/
  perks/  supporterPerks.ts  accentColor.ts  supporterTitles.ts
          SupporterBadge.tsx  SupporterTitle.tsx
          SupporterAvatarFrame.tsx  SupporterAvatarFrame.module.css
          SupporterPresenceChip.tsx  SupporterPresenceChip.module.css
          SupporterAccentPicker.tsx
  settings/ SupporterPerksSettings.tsx  (replaces SupporterFeatureCatalog.tsx)
            SupporterProfilePreview.tsx  (reworked)
  wall/   SupportersWall.tsx  SupportersWallItem.tsx
  hooks/  useSupporterPerks.ts  useUpdateSupporterPreferences.ts
          useProfilePresence.ts  useInfiniteSupportersWall.ts  (keys in supporterQueryKeys.ts)
  util/   useSupporterSettingsHref.ts
packages/ui/src/components/collection/
  form/CollectionLimitNotice.tsx   util/getCollectionLimitError.ts
```

Run `yarn workspace @repo/ui barrels:generate`. Check that the barrel picks up CSS-module-importing files like other `.module.css` users in `ui`.

## Risks / Trade-offs

- [Server not deployed when the client ships] → Renderers treat missing fields as "not a supporter" (D2); controls only appear when prefs exist; wall/presence errors render nothing or a retry. Copy changes are safe either way.
- [Optimistic rollback clobbering] → Rollback restores only the patch's own keys (D8); success always replaces with the server's full object.
- [Animated rings cost on low-end phones] → One ring per screen (profile header + optional settings preview), `transform`-only animation on a pseudo-element, disabled under reduced motion.
- [Ionic keeps profile pages mounted] → `useIsViewActive` gates presence; `refetchIntervalInBackground: false` covers hidden tabs/app background.
- [Accent tint on old Android WebView] → Colors precomputed in JS; no `color-mix()`/`@property`.
- [Wall cache lag up to 10 min for non-PATCH changes] → Accepted (server contract). PATCH-driven changes invalidate our client cache and the server's.
- [Badges in lists only via `UserAvatarGroup`] → Some surfaces print usernames directly and will not show a badge. Accepted for this change; the shared `SupporterBadge` makes adding them trivial later.
- [Copy and spec ordering] → This change's `supporter-subscriptions` delta modifies requirements introduced by two unarchived changes. Archive `add-supporter-subscriptions`, then `redesign-supporter-settings`, then this one.

## Migration Plan

1. Merge and deploy this client change no later than the server's `add-supporter-profile-perks` deploy (copy and the limit notice must be live when the limit starts).
2. Rollback: reverting the client is safe while the server stays (fields are ignored by older clients except that the limit would surface as a generic error). Reverting the server while this client is live leaves perks hidden and the copy still accurate.
