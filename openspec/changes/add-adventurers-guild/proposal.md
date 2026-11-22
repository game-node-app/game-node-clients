# Proposal

## Why

The server now exposes the Adventurers Guild (server PR #270, change `add-adventurers-guild` in `game-node-server`): weekly personalized quest boards, contracts, Guild XP/ranks, rewards and the receptionist NPC Lina. Players cannot reach any of it until the clients render the Guild Hall designed in Figma `rvZfYT3eR8ktZAW6g3HO8C` ("GameNode — Guilda de Missões (NPC Recepcionista)"). The feature launches as **early access for supporters** and later opens to everyone through server configuration only, so the clients must follow the server gate instead of hard-coding who can enter.

## What Changes

- Regenerate `@repo/wrapper` from the server swagger that includes the `/v1/guild/*` routes, `guildTitleKey`/`guildFrameKey` on profiles and the `guild.contract-ready` notification.
- New Guild Hall screen at `/guild` on web (Next.js page) and mobile (Ionic route), shared from `@repo/ui`:
  - Header with Guild title, refresh subtitle, rank badge and XP bar.
  - Pixel-art "Guild hall" scene: wall, beam, wainscot, lantern with glow, quest-board on the wall, shelf props, counter with props, Lina sprite and the `!` alert balloon.
  - Lina dialogue box with typewriter text, name plate, options ("Show me the quest board", "Any quicker quest?", "See you, Lina") and the blinking `▼` next indicator.
  - Guild License card (license number, equipped title, member-since, rank stamp, finished/backlog/reviews stats, next-rank progress).
  - Active contracts list (contract progress, year goal) with claim action for `ready_to_claim` contracts.
  - Tabs "Quest board" / "Accepted" / "Completed" with server counts and a refresh countdown.
  - Cork board with quest cards (category tag, rank stamp, title/description from template keys or event translations, candidate game chips, XP and reward, "Not now" / "Accept", "★ Lina recommends" seal for `isRecommended`).
  - "Contract accepted" state: happy Lina, sparkles, stamped contract, `ACEITO` stamp animation, `+XP on completion` chip and Lina's confirmation dialogue with "Back to board" / "See active contracts".
  - Claim celebration showing XP awarded, rank-up and unlocked rewards/chest result.
  - Rewards inventory with equip/unequip of Guild titles and avatar frames.
- All Lina and scene animations from the Figma animation table (breathing, braids, blink, talk, typewriter, `!` bob, lantern flicker, `▼` blink, cards entering, stamp), with a `prefers-reduced-motion` fallback.
- Early-access gate driven by `GET /v1/guild/access`: guests see a sign-in CTA, signed-in users without access see a supporter early-access CTA, and any `403 guild_early_access_required` switches to that CTA.
- Navigation entries for the Guild in the web dock and the mobile sidebar, marked as early access.
- `guild.contract-ready` notifications rendered in the inbox and deep-linking to the Guild's accepted contracts.
- Pixelify Sans and Silkscreen fonts (SIL OFL) self-hosted in each app; pixel-art SVG assets exported from Figma.
- English and Brazilian Portuguese copy for every Guild string, template key, Lina trigger, rank title and starter cosmetic key.

Out of scope: the admin UI for curated events and the reward catalog (`/v1/guild/admin/*`), rendering Guild cosmetics on profile pages outside the Guild, and any server change.

## Capabilities

### New Capabilities
- `guild-access`: Early-access gating of the Guild (server-driven mode, guest/non-supporter/blocked states) and the Guild navigation entries.
- `guild-hall`: The Guild Hall screen: overview header, License card, active contracts, board tabs, quest cards, accepting/claiming/abandoning contracts and the rewards/cosmetics inventory.
- `guild-receptionist`: Lina, the receptionist NPC: trigger-driven dialogue, poses, the hall scene and every animation, including reduced motion.

### Modified Capabilities
- `notification-inbox`: adds rendering and navigation for `guild.contract-ready` items.

## Impact

- `packages/wrapper` (generated from `input/server_swagger.json`).
- `packages/ui`: new `components/guild/**` feature (hooks, views, scene, sprites), notification content/navigation, nav icon, barrels.
- `packages/locales`: new `guild.*` keys in `en.json` and `pt-BR.json`, regenerated types.
- `apps/web`: `pages/guild/index.tsx`, dock item, `public/img/guild/*`, `public/font/*`.
- `apps/mobile`: `pages/guild.tsx`, route registration, sidebar entry, `public/img/guild/*`, `public/font/*`, vitest tests for the Guild hooks/views.
- No new runtime dependency: animations use CSS keyframes and `steps()`.
- Requires the server with PR #270 deployed; `GUILD_ACCESS_MODE=supporters` at launch.
