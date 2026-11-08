---
name: GameNode
description: Dark-only social game-tracking UI shared by web, admin and mobile. Near-black surfaces, one orange brand accent, Mantine v9 components with Tailwind for layout.
colors:
  brand: "#F15025"            # primary accent: CTAs, active states, links
  brand-hover: "#D6360B"      # brand-7, pressed/hover for filled brand buttons
  brand-link: "#F36742"       # brand-4, links inside rich text (Tiptap)
  tertiary: "#872C13"         # dark brand, filled badges on mobile
  secondary: "#1A1A1A"        # default button / card fill
  premium: "#9747FF"          # supporter features only
  premium-text: "#C7A6FF"
  success: "#3DD68C"
  danger: "#E5484D"
  danger-text: "#FF6369"
  warning: "#FE9B0E"
  background: "#111111"       # app body (web + mobile)
  background-deep: "#0B0B0B"  # landing pages, settings modal canvas, code fields
  surface: "#161616"          # paper-0, hero/sections
  surface-raised: "#1A1A1A"   # cards (SettingsCard), paper-8
  surface-control: "#222222"  # icon tiles, secondary buttons, active nav item
  border: "#2A2A2A"           # card borders, dividers
  border-subtle: "#1F1F1F"    # DetailsBox border
  text: "#FFFFFF"
  text-icon: "#D9D9D9"
  text-muted: "#ADADAD"       # descriptions
  text-faint: "#7A7A7A"       # captions, meta
typography:
  family: "Roboto, Roboto Fallback"
  weights: [300, 500, 700]    # loaded by next/font on web; mobile ships Roboto-Variable.ttf
  scale:                      # Mantine defaults, exposed to Tailwind as text-xs..text-xl
    xs: 12px
    sm: 14px
    md: 16px
    lg: 18px
    xl: 20px
  landing-headline: { size: 48px, weight: 600, line-height: 1.2 }
  row-title: { size: 14px, weight: 600 }
  row-description: { size: 13px, line-height: 18px }
  pill: { size: 12px, weight: 500 }
rounded:                      # Mantine defaults, exposed to Tailwind as rounded-xs..xl
  xs: 2px
  sm: 4px                     # game covers
  md: 8px                     # buttons, nav items, DetailsCard
  lg: 16px
  xl: 32px
  card: 12px                  # Tailwind rounded-xl, settings cards
  tile: 10px                  # 36px icon tiles
  pill: 9999px
spacing:                      # Mantine defaults, exposed to Tailwind as p-xs..p-xl
  xs: 10px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 32px
breakpoints:
  xs: 36em
  sm: 48em                    # useOnMobile() = max-width sm
  md: 62em                    # web navbar collapses below this
  lg: 75em
  xl: 88em
---

# GameNode design system

This file covers how GameNode should look and feel. `AGENTS.md` covers how the code is set up. When they overlap, such as the theme rules under "UI colors", `AGENTS.md` wins.

The source of truth for tokens:

| What | Where |
| --- | --- |
| Mantine theme (`brand`, `secondary`, `tertiary`, light-variant resolver) | `packages/ui/src/util/theme.ts` |
| Tailwind scales (`paper-*`, `brand-0..9`, `dimmed`, Mantine-backed spacing/radius/font size, `mobile:`/`web:`/`admin:` variants) | `packages/config-tailwind/tailwind.config.ts` |
| Body/text CSS variables | `apps/{web,mobile}/src/components/globals.css` |
| Mobile component skin (button/input/badge/tabs) | `apps/mobile/src/components/theme.{tsx,module.css}` |
| Ionic color variables | `apps/mobile/src/theme/variables.css` |

## Overview

GameNode is a place to track, review and talk about games. The UI is built around **game cover art**: the chrome stays dark, flat and quiet so the covers supply most of the color. The only accent is one warm orange (`#F15025`). Supporter (premium) features get a separate violet accent, and nothing else may use it.

- **Dark only.** Every app forces `forceColorScheme="dark"`. There is no light theme, so don't design for one.
- **Flat surfaces, layered by lightness.** Depth comes from slightly lighter grays (`#111` → `#161616` → `#1A1A1A` → `#222`) and 1px borders, not shadows.
- **One component library on three platforms.** Views live in `@repo/ui` and render on Next.js (web/admin) and Ionic/Capacitor (mobile). Platform differences go through presenters (`DetailsBox`, `Modal`, `Link`), not forks.

## Colors

### Brand

- `brand` / `#F15025` is the primary color. Use it for primary buttons, active tabs, selected states, progress, key icons and links.
- In Mantine, every brand shade is the same color (flat `colorsTuple`). `color="brand.4"` will **not** give you a lighter tone. For tints, use Tailwind `brand-0..9` (`brand-0` `#FFEDE5` … `brand-9` `#A82301`).
- `variant="light"` on brand colors renders as a 15% alpha tint of the color with brand-colored text (25% on hover), through `variantColorResolver`. Use it for soft badges, chips and theme icons. Don't override it ad hoc.
- `tertiary` `#872C13` is a dark rust used for filled badges on mobile. `secondary` `#1A1A1A` is the default button fill.

### Surfaces

| Token | Hex | Use |
| --- | --- | --- |
| `background-deep` | `#0B0B0B` | Landing pages, settings modal canvas, code/input wells |
| `background` (`--mantine-color-body`) | `#111111` | App body, Ionic toolbar/modal background |
| `paper` / `paper-0` | `#161616` | Hero bands, round icon backplates |
| `paper-3` | `#191919` | `DetailsBox`/`DetailsCard` background |
| `paper-8` / `secondary` | `#1A1A1A` | Cards (`SettingsCard`), default buttons |
| `paper-2` | `#1D1D1D` | Mobile default `ActionIcon` |
| `surface-control` | `#222222` | Icon tiles, secondary buttons, active sidebar item, neutral pills |
| `border` | `#2A2A2A` | Card borders and in-card dividers |

Each nested layer should be one step lighter than its parent. If two adjacent layers would be the same lightness, separate them with a `#2A2A2A` border.

### Text

- Primary text is `#FFFFFF` (`--text-color`). Icons inside tiles use `#D9D9D9`.
- Secondary text: Mantine `c="dimmed"` / Tailwind `text-dimmed` (the most-used text token), or `#ADADAD` for descriptions in the settings-style components.
- `#7A7A7A` is for captions, timestamps and meta only. Never use it for body text.

### Semantic

Status colors are shown as a 12% alpha tint background with brighter text, never as a solid fill (except destructive confirm buttons):

| Tone | Background | Text |
| --- | --- | --- |
| accent | `rgba(241,80,37,0.12)` | `#F15025` |
| neutral | `#222` | `#ADADAD` |
| success | `rgba(61,214,140,0.12)` | `#3DD68C` |
| danger | `rgba(229,72,77,0.12)` | `#FF6369` |
| premium | `rgba(151,71,255,0.16)` | `#C7A6FF` |

These come from `SettingsPill` (`packages/ui/src/components/settings/common/SettingsPill.tsx`). Reuse it rather than re-declaring them. Outside the settings surface, stock Mantine colors (`red`, `teal`, `gray`) with `variant="light"` are fine.

**Premium/supporter** has its own look: a violet gradient (`rgba(151,71,255,0.26)` → transparent → a hint of brand orange), a `rgba(185,138,255,0.95)` border and a soft violet glow (`0 0 16px rgba(151,71,255,0.32)`). Only supporter entry points use it, so it stays special.

## Typography

- **Roboto** everywhere: `next/font/google` (weights 300/500/700) on web, `Roboto-Variable.ttf` on mobile, and the `Roboto, Roboto Fallback` stack in the theme.
- Use Mantine's size scale (`fz="sm"`, Tailwind `text-sm`) instead of pixel values in shared views. Body copy is `sm`/`md`.
- Headings use Mantine `Title`. Pages use `order={1..3}`. Section labels inside cards use `order={5}`, `text-xs font-bold text-dimmed` (see `DetailsCard`): small, uppercase-feeling, muted.
- Settings-style rows: title 14px / 600 / white; description 13px / 18px / `#ADADAD`.
- Landing headline: 48px / 600 / 1.2, max-width ~680px.
- Weights: 400 body, 500 labels/buttons, 600 row titles, 700 section titles. Avoid 300 except for large display text.
- Rich text (reviews, posts, blog) uses Tiptap with Tailwind preflight reverted inside `.tiptap`. Links there are underlined `brand-4`.

## Layout

- **Web shell** (`GlobalAppShell`): 54px header, 64px icon-only left navbar (collapses below `md`), static 60px footer. Content sits in a fluid `Container` capped at `max-w-screen-xl`. Marketing routes (`/`, `/about`, `/awards`, `/auth`) render without the shell.
- **Mobile shell**: Ionic tabs + toolbars on `#111111`. `--ion-padding` = `--mantine-spacing-md` (16px). Respect safe areas (`top-sticky-safe` inset for sticky headers).
- Use Mantine layout primitives (`Stack`, `Group`, `Flex`, `SimpleGrid`) for structure, and Tailwind for gaps, padding and responsive tweaks. Common gaps: `gap-2` inside a card, `gap={16}` between a row's icon/text/action, `md` between sections.
- Breakpoints are shared between Mantine and Tailwind (`xs 36em … xl 88em`). `useOnMobile()` means "below `sm`". Use it, or the `mobile:`/`web:` Tailwind variants, for platform-specific styling instead of reading `PROJECT_CONTEXT.client`.
- For components that sit in both narrow (mobile, modal) and wide containers, prefer **container queries** (`@container`, `@[420px]:flex-row`) over viewport breakpoints. `SettingsRow` with `stackRightSection` is the reference.

## Elevation & depth

- No drop shadows on standard UI. Separate layers with surface lightness and 1px `#2A2A2A` borders.
- The only glows are premium (violet, above) and focus rings.
- Modals: web uses Mantine `Modal`, mobile renders an `ion-modal` through the `Modal` presenter. The settings modal sits on `#0B0B0B` with a sidebar/panel split that becomes two separate screens on mobile.
- Focus: visible 2px outline (`outline: 2px solid white; outline-offset: 5px` on landing links). Never remove focus styles without a replacement.

## Shapes

| Element | Radius |
| --- | --- |
| Game covers | `sm` (4px), aspect ratio **264 / 354** |
| Buttons, nav items, inputs | `md` (8px) |
| Icon tiles (36px) | 10px |
| Cards / grouped surfaces | `rounded-xl` (12px) |
| `DetailsCard` | `md` |
| Pills, avatars, round icons | full |

Mobile default buttons use `rounded-xs` with a `#373737` border: a flatter, more native-looking button.

## Components

Reuse these before building new ones. All are in `packages/ui/src/components`.

- **Game cover** — `game/figure/GameFigureImage`: the base for anything that shows a cover (fixed 264:354 ratio, sized IGDB URL, `/img/game_placeholder.jpeg` fallback, links to `/game/:id`). Variants built on it: `GameGridItem`, `GameListItem`, `GameFigureWithQuickAdd`, `GameHoverEditFigure`. Covers are the most important visual in the app, so don't crop them to other ratios or overlay heavy chrome.
- **Section container** — `general/DetailsBox` (presenter, so mobile can swap it; optional `bg-paper-3`, `border-2 border-[#1F1F1F]`) and `general/DetailsCard` (newer, variant-based, `bg-paper-3 rounded-md py-2 px-4`, dimmed `order={5}` title). Prefer `DetailsCard` for new work.
- **Grouped rows** — `settings/common/SettingsCard` + `SettingsRow` + `SettingsIconTile`: a bordered `#1A1A1A` card with 1px dividers between rows. Each row is `px-5 py-4` with an optional 36px icon tile, title, description and right-side action. `danger` switches the border to `#E5484D`. Use this pattern for any list of toggles, links or account actions.
- **Pills** — `SettingsPill` (`accent | neutral | success | danger | premium`, optional leading dot), plus `SettingsNewBadge` and `SettingsComingSoonBadge`. A "coming soon" badge always goes with a disabled control.
- **Buttons** — Mantine `Button`. Primary actions use the default brand fill. Secondary actions use `variant="default"` (`#1A1A1A`) or `subtle`. Inside settings-style surfaces, use `SettingsButton` (`primary | secondary | ghost | danger | dangerOutline`, 13px, 8px radius). Put at most one brand-filled button in a view.
- **Icons** — `@tabler/icons-react`. Sizes: 14–16 inline with text, 18 in tiles, 20–24 standalone. `RoundedIcon` is the large circular icon used in empty/onboarding states (`#161616` disc, 48px glyph).
- **Separators** — `GradientSeparator` (a 2px line that fades white in the center) for hero and section breaks. `SettingsDivider` (`#2A2A2A`, 1px) inside cards.
- **Feedback** — `CenteredLoading` (Mantine `Loader variant="bars"`), `CenteredErrorMessage` / `ErrorState`, `LoginPromptCentered`. Mutation errors go through `createErrorNotification` (red Mantine notification). Confirmations use `ActionConfirm`.
- **Inputs** — Mantine inputs. `FloatingLabelInput`, `SearchBar`, `GameRating`, `ActionChip`/`SortingChip`, `SelectWithOrdering`. On mobile, inputs are borderless with a `#424242` outline, and selects use a chevron-down right section (from the mobile theme).
- **Logo** — `GameNodeLogo` (`/img/main-logo.png`). Don't recolor or redraw it.

## Motion

Keep it minimal. Use `transition-colors` on hover/active surfaces, Mantine's default modal/drawer transitions, and the NProgress bar on route changes (web `RouterTransition`). No decorative animation in core flows. Celebratory moments (Daily results, Recap/Wrapped) may use more.

## Content & copy

- All user-facing strings go through `useTranslation` with keys in both `en.json` and `pt-BR.json`. Leave room for Portuguese, which runs ~20–30% longer: don't size buttons or pills to fit English text exactly.
- Use sentence case for titles and buttons. Keep descriptions to a line or two of `text-muted`.

## Do's and don'ts

**Do**
- Use `DEFAULT_MANTINE_THEME` and the Tailwind `paper-*` / `brand-*` / `dimmed` tokens.
- Use `variant="light"` for soft brand/semantic accents.
- Build shared views in `@repo/ui` and handle platform differences with presenters, `useOnMobile()` or `mobile:`/`web:` variants.
- Give each nested surface a step up in lightness or a `#2A2A2A` border.
- Check every layout at 360px wide (mobile) and inside the settings modal panel.

**Don't**
- Add per-app palettes, a light theme, or override badge/theme-icon colors with ad-hoc `bg-*`/`c=` to fix contrast (fix `variantColorResolver` instead).
- Pass `brand.N` expecting a different shade.
- Use brand orange for large backgrounds or more than one primary action per view, or violet outside supporter features.
- Add drop shadows to cards.
- Import `next/link`, `next/router` or Ionic components directly in `@repo/ui`.
- Hard-code user-facing strings.

## Known gaps

- The settings and supporter surfaces (from the Figma redesign) use raw hex values (`#1a1a1a`, `#2a2a2a`, `#222`, `#adadad`, `#7a7a7a`, `#0b0b0b`) instead of Tailwind tokens. They match the `surface-*`/`border`/`text-*` values above. If they spread further, promote them into `config-tailwind` (e.g. `surface`, `line`, `muted`) and migrate.
- `paper-0..8` is not ordered by lightness (`paper-1` `#262525` is lighter than `paper-2` `#1D1D1D`). Pick by hex, not by index.
- The `textColor: "#D9D9D9"` entry in the shared Tailwind config is malformed. Tailwind spreads the string into junk utilities (`text-0`…`text-6`, one character each) and sets no default text color. Don't use those classes. Body text color comes from `--mantine-color-text`.
- Ionic variables define `tertiary` as `#9747FF` (violet), while Mantine's `tertiary` is `#872C13` (rust). Don't assume they match.
