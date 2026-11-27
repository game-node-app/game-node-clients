# Design

## Context

- API contract: `reference/server-handoff.md` (identical to `handoff-clients.md` of the server change `expand-adventurers-guild-quests-and-rewards`, server worktree `/home/cassi/.t3/worktrees/game-node-server/t3-d3279ec6-590996b223dd6150`, branch `feat/guild-missions-rewards`). Every route, field, enum, error code and localization table there is authoritative. It is a **delta** on `openspec/changes/add-adventurers-guild/reference/server-handoff.md`.
- Existing client: `openspec/changes/add-adventurers-guild/design.md` (D1–D10) is the visual and architectural baseline and still applies: feature folder `packages/ui/src/components/guild/{hooks,util,scene,view}`, pixel-art palette in `guild.module.css` (theme-exempt block), fonts `Guild Pixel` / `Guild Stamp`, `PixelButton`, `RankStamp`, `CategoryTag`, `GameChip`, `GuildIcon` + `GUILD_ASSETS`, Lina (`LinaSprite`, `LinaDialogue`, `getLinaLine`), injected `Modal` for overlays, React Query patterns from `AGENTS.md`, colour rules from `AGENTS.md` (tokens or the theme-exempt Guild palette only).
- There is no Figma for this change. New surfaces reuse the existing Guild vocabulary: parchment cards on the cork board, `--gn-surface` sidebar cards with the Pixel/Overline header pattern of the License card, `PixelButton` for actions, gold (`--guild-gold`) for currency and highlights, the stamp red for "stamped" moments.
- Theme check: every new surface must be checked under GameNode (dark) and Ruins (light), see `AGENTS.md` "UI colors".

## Goals / Non-Goals

**Goals:** expose every player-facing feature of the hand-off (sections 3, 4, 6, 8) on web and mobile from the shared `@repo/ui` Guild; keep the existing flow intact; unknown keys and enum values degrade to generic labels (hand-off 1.4.7).

**Non-Goals:** admin UI (hand-off section 7); server changes; profile-page cosmetics; real-time readiness; changing the existing scene composition beyond the decor slots.

## Decisions

### D1. Wrapper regeneration (merge, not overwrite)
The server worktree swagger lacks two client-only paths that the clients already use (`/v1/collections-entries/own`, `/v1/statistics/batch`, plus their schemas). Build `packages/wrapper/input/server_swagger.json` as: the server worktree `server_swagger.json` **plus** every path and `components.schemas` entry that exists only in the current client copy. Do this with a one-off `node` script run from the scratchpad (do not commit the script). Then `pnpm wrapper:generate` and build. Acceptance: `GuildService` exposes every player route of hand-off section 2, `GuildAdminService` the admin ones, `CollectionsEntriesService` and `StatisticsService` keep their current methods (no removed exports: compare `git diff packages/wrapper/src` for deleted files/methods), and the client-only paths are still present.

### D2. Data layer (`hooks/`)
Extend `guildKeys` with `emporium(userId)`, `passport(userId)`, `chains(userId)`, `bounties(userId, locale)` and their `*Root()` builders; `invalidateGuild` invalidates all of them too. All new queries follow the existing Guild options (`staleTime: GUILD_QUERY_STALE_TIME`, `refetchOnMount: true`, `enabled` only with `hasAccess` and a user id, early-access 403 mapping exactly like `useGuildBoard`), and return `ExtendedUseQueryResult`.

| Hook (file `hooks/<name>.ts`) | Call | Notes |
| --- | --- | --- |
| `useGuildEmporium()` | `GET /v1/guild/emporium` | |
| `useGuildPassport()` | `GET /v1/guild/passport` | |
| `useGuildChains()` | `GET /v1/guild/chains` | |
| `useGuildBounties()` | `GET /v1/guild/bounties?locale=` | locale `pt-BR` when the i18n language starts with `pt`, else `en` |
| `useRerollGuildBoardEntry()` | `POST board/{entryId}/reroll` | variables `{ boardEntryId }`; on success replace the quest with the same `boardEntryId` in every cached board query (both `quick` variants) and set `rerollsRemaining`/`rerollChartersOwned`, then invalidate board + rewards |
| `useExtendGuildContract()` | `POST contracts/{id}/extend` | variables `{ contractId }` |
| `usePurchaseGuildEmporiumItem()` | `POST emporium/purchase` | variables `{ emporiumItemId }` |
| `useActivateGuildExtraSlotPermit()` | `POST consumables/extra_slot_permit/activate` | |
| `useClaimGuildPassportMilestone()` | `POST passport/claim/{milestone}` | variables `{ milestone: 2 \| 4 \| 6 }` |
| `useStartGuildChain()` | `POST chains/{chainKey}/start` | variables `{ chainKey, targetGameId? }`; body `{}` when no game |
| `useAdvanceGuildChain()` | `POST chains/{chainKey}/advance` | variables `{ chainKey, targetGameId? }` |
| `useClaimGuildBounty()` | `POST bounties/{id}/claim` | variables `{ bountyId }` |
| `useUpdateGuildCosmetics()` (existing) | `PATCH cosmetics` | accepts the four new optional fields; send only the fields being changed |

Every mutation settles with `invalidateGuild` and maps errors through the existing `useGuildMutationErrorHandler`/`util/guildErrors.ts`, extended with every new code of hand-off section 9: each code shows `guild.errors.<code>` (translated) and triggers the refresh named in the table's "Client handling" column; unknown codes fall back to `createErrorNotification`. `guild_active_contract_limit_reached` interpolates `{{max}}` from the cached overview `license.perks.maxActiveContracts` (fallback 3). `guild_emporium_rank_required` / `guild_chain_rank_required` interpolate the required rank when the caller passes it.

### D3. Copy (`packages/locales`, en + pt-BR, identical key sets)
Source of truth for wording: hand-off section 8 (en/pt-BR tables). UI strings not in the hand-off are written in the existing Guild voice (en natural, pt-BR natural Brazilian, same tone as the existing `guild.*`). Keys (all under `guild.` unless noted; `{{x}}` = interpolation; `_one/_other` = i18next plural):

- `templates.<templateKey>.{title,description}` for all 31 keys of 8.1: keep the shipped text of the keys that already exist, add the missing ones.
- `chains.<chainKey>.{title,description}` (8.2), `chains.stages.<stageKey>.{title,objective}` (9 stages), plus UI: `chains.tabTitle`, `chains.status.{locked,available,in_progress,completed}`, `chains.stageOf` ("Stage {{current}} of {{total}}"), `chains.minRank` ("Unlocks at Rank {{rank}}"), `chains.start`, `chains.advance`, `chains.retry`, `chains.viewContract`, `chains.boundGame` ("Chosen game: {{name}}"), `chains.pickGame`, `chains.pickGameHint`, `chains.finalRewards`, `chains.finalSeals` ("+{{seals}} Seals on completion"), `chains.stageRewards` ("+{{xp}} XP · +{{seals}} Seals · {{days}} days"), `chains.completedOn`, `chains.empty`.
- `lina.<trigger>` for `rank_promoted`, `chain_completed`, `community_bounty_ready`, `monthly_expedition_refreshed` (8.3), `lina.options.{emporium,bounties}` ("Show me the Emporium", "Show me the bounty").
- `rank.prestige` ("Prestige {{count}}" / "Prestígio {{count}}"), `rankPackages.<D..S>` (8.4 labels), `perks.{title,maxActiveContracts,weeklyRerolls,monthlyExpedition,monthlyExpeditionRankS,monthlyFreeHourglass,legendaryContracts}` (short lines with `{{count}}` where numeric).
- `seals.{name,short,amount}` ("Guild Seals", "Seals", "{{count}} Seals"), `seals.reward` ("+{{seals}} Seals").
- `consumables.<key>.{name,effect}` (8.5), `consumables.{title,owned,activate,activeUntil,freeHourglass}`.
- `chests.<chest_bronze|chest_silver|chest_gold|chest_relic|weekly_chest>` (8.6 names).
- `rarity.<common|uncommon|rare|epic|legendary>`.
- `rewards.<key>` for all 78 keys of 8.7 (keep the existing ones), `rewards.generic.<kind>` for every kind (`badge,title,frame,chest,license_theme,stamp_style,tavern_decor,consumable`).
- `board.tags.monthly` ("Monthly Expedition"), `board.monthly.{title,locked,acceptBy}` ("Unlocks at Rank C", "Accept by {{date}}"), `board.bonus.{label,also_write_review,finish_before_half_deadline,use_stale_backlog_game,reward}` (`also_write_review` uses `{{chars}}`, `use_stale_backlog_game` uses `{{days}}`; `reward` composes "+{{xp}} XP", "+{{seals}} Seals", "chest upgrade" parts via `board.bonus.parts.{xp,seals,chestUpgrade}`), `board.reroll.{action,free,charter,none,done}` (`free` with `{{count}}`), `board.rerollsStatus` ("{{free}} free rerolls · {{charters}} charters"), `board.meta.{genre,franchise,theme,decade,staleDays}`.
- `contracts.extend.{action,confirmTitle,confirmBody,free,consumable,done}`, `contracts.bonus.{pending,completed}`, `contracts.chainStage` ("{{chain}} · stage {{stage}}"), `contracts.cap` ("{{active}} / {{max}} contracts").
- `claim.{seals,bonusCompleted,promotion,prestige,chest,consumableDrop,passportStamp,chainProgress,chainCompleted,chainBonus}`.
- `passport.{title,stamps,resetsIn,claim,claimed,locked,milestone,rewards}` (title = "Monthly Guild Passport"; `stamps` = "{{count}} / 6 contracts this month").
- `emporium.{title,subtitle,balance,permanent,rotating,rotatesIn,buy,owned,soldOut,monthlyLimit,minRank,notEnoughSeals,confirmTitle,confirmBody,confirm,cancel,purchased,empty}`.
- `bounties.{title,empty,progress,contribution,minContribution,notEligible,claim,claimed,claimWindow,endsIn,ended,milestone,overkill,claimedResult}`.
- `rewardsPanel.sections.{licenseThemes,stampStyles,decor,showcase,consumables}`, `rewardsPanel.decorLimit` ("Up to 4 on the counter"), `rewardsPanel.showcaseLimit` ("Up to 3 badges"), `rewardsPanel.add`, `rewardsPanel.remove`.
- `license.{prestige,showcase,showcaseEmpty,seals,perks}`.
- `tabs.{arcs,bounties,emporium}`.
- `errors.<code>` for every code of hand-off section 9 not already present; `guild_active_contract_limit_reached` becomes "You already have {{max}} active contracts…".
- `notifications.guild.communityBountyReady` (root `notifications` namespace, next to `contractReady`).

Run `pnpm locales:generate-types` and a flattened-key parity check between both files.

### D4. Art (new SVGs, same style as `public/img/guild`)
Existing assets are pixel art drawn as `<path>` runs of 3 px squares (look at `chest.svg`, `mug.svg`, `coin.svg`), outline `#1F120D`, palette of `guild.module.css` D3. New files are authored by hand in that style (each pixel a multiple of 3 px, `viewBox` = width/height, `shape-rendering="crispEdges"` allowed, no gradients/filters, no text), copied identically to `apps/web/public/img/guild/` and `apps/mobile/public/img/guild/`, and registered in `GUILD_ASSETS`:

- `seal` 18×18 (wax Guild Seal coin, stamp red with gold rim) — the currency icon.
- `chest-bronze`, `chest-silver`, `chest-gold`, `chest-relic` 30×24 (recolors of `chest.svg`; relic gets a violet/gold trim).
- `consumable-hourglass` reuses `hourglass`; `reroll-charter` 24×27 (rolled scroll with circular arrow), `extra-slot-permit` 24×27 (ticket with a `+`).
- Tavern decor, 48×48 each unless noted, drawn to sit on the counter: `decor-mug-of-ale` (may reuse `mug`), `decor-brass-astrolabe`, `decor-herb-planter` (may reuse `plant`), `decor-oak-barrel`, `decor-crystal-chandelier`, `decor-ancient-globe`, `decor-tavern-lantern` (may reuse `lantern` 48×66), `decor-curators-shelf`, `decor-snowglobe`, `decor-sleeping-cat` (54×36), `decor-autumn-wreath`, `decor-compass-rose`, `decor-enchanted-tapestry` (48×60), `decor-golden-griffin`, `decor-relic-plinth`, and `decor-generic` (crate) for unknown keys.
- `prestige-star` 14×14 (small gold star for S+).

Also add to the theme-exempt palette block of `guild.module.css`: rarity hues `--guild-rarity-{common,uncommon,rare,epic,legendary}`, chest tier hues `--guild-chest-{bronze,silver,gold,relic}`, and the classes (in a new section at the end of the file, theme-exempt comment) `.licenseTheme-<key>` for the 8 `license_*` keys (card border/background accent overrides of the License card), `.stampStyle-<key>` for the 8 `stamp_*` keys (border/ink colour of `RankStamp`), `.frame-<key>` for the 17 `frame_*` keys not yet styled, and `.rarity-<rarity>` (a 1 px border/tag colour). Each palette must stay readable on both GameNode and Ruins (text on parchment stays `--guild-ink`).

Mapping helpers live in `scene/cosmeticAssets.ts`: `getDecorAsset(key)`, `getChestAsset(kind)` (`weekly_chest` → silver), `getConsumableAsset(key)`, `getLicenseThemeClass(key)`, `getStampStyleClass(key)`, `getFrameClass(key)`, `getRarityClass(rarity)`; unknown keys return the generic asset / `undefined` class.

### D5. Hall information architecture
- Tabs (`GuildTab`): `board`, `accepted`, `completed`, `arcs`, `bounties`, `emporium`. Counts are shown for the first three only; `bounties` shows a dot when `overview.activeBountiesCount > 0` and a stronger dot when Lina's trigger is `community_bounty_ready`. The tab row scrolls horizontally on mobile (no wrapping) and keeps the refresh countdown on desktop only when space allows (move it below the tabs on mobile).
- Header: a Seals pill (seal icon + `license.sealsBalance`) next to the rank badge; at rank `S` with `prestigeLevel > 0` the rank badge reads `RANK S` followed by `prestigeLevel` prestige stars and the XP bar shows `prestigeXpIntoCurrent / (prestigeXpIntoCurrent + xpToNextPrestige)` with the `guild.rank.prestige` label.
- Sidebar (desktop) order: License card → Passport card → Rewards panel → Active contracts. Mobile order: dialogue → active contracts → License → Passport → Rewards panel → tabs → tab content.
- Lina options: `board`, `quick`, `emporium`, `goodbye`; when `lina.trigger === "community_bounty_ready"` a first option `bounties` is added. Options that switch tab scroll to the tabs like `board` does.
- Deep links: both apps' `/guild` pages accept `?tab=` for every `GuildTab` and `?bountyId=` (bounties tab, that row scrolled into view and highlighted). `GuildView`/`GuildHall` take `initialBountyId?: string`.

### D6. Board and contracts
- Quest card (`GuildQuestCard`): rewards column shows `+XP` and, when `sealsReward > 0`, seal icon + `+N Seals`; reward label uses `getRewardLabel` (all kinds, chests named by tier). `category: "monthly"` uses a new `CategoryTag` variant `monthly` (ink background, gold text, theme-exempt artwork colours) reading "Monthly Expedition"; `cycle: "monthly"` cards span the full board width, sit first, and show "Accept by <date>" from `expiresAt` plus the duration line. Bonus objective (when non-null): a dashed parchment-shade box "Optional bonus: <label> → <reward parts>" below the description; never blocks acceptance. New `meta` chips: `genreName`, `franchiseName`, `themeName`, `decade`, `staleDays` are rendered as small ink captions under the description ("Genre: Metroidvania", "Since 2019", "Untouched for 412 days").
- Reroll: weekly (`cycle === "weekly"`, `sourceType === "board_entry"`) cards get a ghost `↻` "Reroll" action in the footer when `rerollsRemaining > 0` or `rerollChartersOwned > 0`; the label says whether it spends a free reroll or a charter. While pending the card shows a busy state; on success the card replays the entrance animation with the new quest. A board toolbar above the cork board shows `board.rerollsStatus` (hidden when both are 0 and rank is `E`).
- Locked expeditions: when `monthlyExpeditionLocked` and not `quick`, a dimmed full-width parchment placeholder with a padlock-free design (dashed border, `monthly` tag, "Unlocks at Rank C") is shown first.
- Accept limit copy reads `license.perks.maxActiveContracts`; the Active contracts header shows `contracts.cap` (`active/max`).
- Contract rows (`GuildContractRow`, `GuildActiveContracts`): Seals reward next to XP; bonus objective line with a check when `bonusCompleted`; chain stage label (`contracts.chainStage`) when `chainProgressId` is set and the overview `activeChain.activeContractId === contract.id`; an "Extend +7 days" (Hourglass) action on `active` rows with `extendedCount === 0` and a future `expiresAt`, enabled when `rewards.consumables.hourglass > 0` or `license.perks.monthlyFreeHourglass > 0` (server decides which is used; show `contracts.extend.done` with `usedFreeMonthlyHourglass`). Confirm through the injected `Modal`.
- Claim celebration (`GuildClaimCelebration`): keep XP count-up and rank change; add Seals line (`sealsAwarded`), bonus objective line when `bonusCompleted`, chest block with the tier asset + `chests.<kind>` + bonus XP/Seals + unlocked cosmetic (rarity coloured) + consumable drop, `promotionRewards` under `rankPackages.<rankAfter>`, one Relic block per `prestigeRewards` entry, `passportMonth` stamp count, chain progress ("Stage N of 3") or chain completion (final rewards + `bonusSealsAwarded`). Lina's line in the celebration uses `getLinaLine(result.lina)` so `rank_promoted`/`chain_completed` show their copy.
- Accepted state shows `+N Seals` next to the XP chip when `sealsReward > 0`.

### D7. Economy
- `view/GuildEmporium.tsx` (tab `emporium`): Lina's Emporium header (title, balance with seal icon, "Rotates in <time>" from `nextRotationAt`), then two shelves: "Monthly showcase" (`rotatingItems`) and "Permanent shelf" (`permanentItems`). Items are parchment cards in a grid (3 columns desktop, 2 mobile ≥ 360 px, 1 below): asset (decor/chest/consumable asset, or a framed preview for titles/frames/themes/stamps), label, kind + rarity tag, price (seal icon + number), state line: `owned` → "Owned"; `maxPurchasesPerMonth` → "{{n}}/{{max}} this month"; `minRank` above the user's rank → "Rank X"; insufficient Seals → "Not enough Seals". The Buy button is enabled only when `canPurchase`. Buying opens a confirmation (`Modal`) with price and remaining balance; on success shows a toast-like inline confirmation and, for chest listings, the chest result block reused from the celebration (export it as `GuildChestResult`).
- Consumables: the rewards panel gets a "Consumables" section showing hourglass / reroll charter / extra slot permit counts with their effects; the permit has an "Activate" button (confirm modal) that calls the activate route and shows "Active until <date>". If `license.perks.maxActiveContracts` is 5 the permit is shown as active.

### D8. Progression
- `view/GuildPassportCard.tsx`: sidebar card "Monthly Guild Passport": stamp row of 6 slots (filled for `completedContractsCount`, styled with the equipped stamp style class), milestone markers at 2/4/6 with chest asset and Seals; `claimable` milestones get a primary "Claim" button, `claimed` a stamp mark, `locked` dim. Resets countdown from `resetsAt`. Claim shows a small result modal reusing `GuildChestResult` plus Seals/consumable lines.
- License card: prestige stars, Seals balance line, equipped license theme class on the card root, stamp style class on its `RankStamp`, Trophy Showcase row (3 slots; filled slots show the badge label from `getRewardLabel` matched by `achievementId` in rewards, empty slots dashed), perks list collapsed under a "Perks" disclosure (rows from `license.perks`).
- `RankStamp` accepts `styleKey?: string | null` → `getStampStyleClass`.
- Rewards panel: sections Titles, Frames, License themes, Stamp styles, Tavern decor, Trophy showcase (badges), Consumables. Titles/frames/themes/stamps are single-select equip/unequip (`null` clears). Decor is multi-select up to 4 (`equippedDecorKeys` array, order preserved, disabled "add" when 4 equipped). Showcase is multi-select up to 3 of the owned badges (`showcaseBadgeIds` = achievement ids). Each change sends only its field; on `guild_cosmetic_not_owned` / `guild_cosmetic_limit_exceeded` the previous selection is kept. Items show their rarity class.
- Scene decor: `GuildScene` takes `decorKeys?: string[]` and renders up to 4 decor assets on fixed counter slots (desktop stage x 620/700/780/860 on the counter top, mobile x 110/170 for the first two only), behind the dialogue and never over Lina; unknown keys use `decor-generic`. The hall passes `license.equippedDecorKeys`.

### D9. Arcs and bounties
- `view/GuildChains.tsx` (tab `arcs`): one parchment panel per chain in catalog order: title/description, status tag, 3-step stage track (done / current / upcoming, current highlighted), current stage details (objective copy from `chains.stages.<stageKey>`, `+XP · +Seals · days`), bound game chip when `boundGame`, final rewards with rarity + `finalBonusSeals`. Actions: `available` → Start (for a chain whose first stage `usesBoundTargetGame`, first pick a game from the user's library — use the existing `GameSearchSelectModal` (or the own-library search if a picker for it exists) and send `targetGameId`; a 400 shows the server message); `in_progress` with `activeContractId` → "View contract" (switch to Accepted tab); `in_progress` without an active contract → "Start next stage"/"Retry stage" (advance); `locked` → "Unlocks at Rank X" disabled; `completed` → completion stamp. Start/advance success switches to the Accepted tab.
- `view/GuildBounties.tsx` (tab `bounties`): list of bounty cards: title/description (already localized by the server), objective, shared progress bar (`progressPercent`, capped visually at 150 with markers at 25/50/100/150; 150 labelled overkill), "N / target", time left until `endsAt` or "Claim window until <endsAt+14d>", user's contribution vs `minUserContribution`, milestone chips with reward (Seals/XP/chest asset) and state (claimed/claimable/locked). A Claim button when `hasClaimableMilestones` (claims all); not eligible → explanation. Claim result modal lists newly claimed milestones, Seals, XP and `chestResults` via `GuildChestResult`. Empty state uses Lina's tone. `initialBountyId` scrolls to and highlights the card.

### D10. Notifications
`getNotificationContent` handles `guild.community-bounty-ready` (Guild shield leading, `notifications.guild.communityBountyReady`); `navigateToNotificationTarget` routes a `guild` target with `bountyId` to `/guild?tab=bounties&bountyId=<id>` and keeps `/guild?tab=accepted` for contract targets.

### D11. File ownership (parallel implementation)
To let agents work concurrently in one checkout: wave-2/3 agents do **not** edit `packages/locales/**/*.json`, `guild.module.css`, `scene/assets.ts` or generated barrels; they put new styles in their own CSS module next to their views (`view/<feature>.module.css`) using `var(--guild-*)` and `--gn-*` variables, and report any missing copy key instead of adding it (the integration agent adds it). Barrels are regenerated once in the final wave; until then import by relative path.

### D12. Testing
Vitest tests in `apps/mobile/src/components/guild/` (jsdom, import from `packages/ui` by relative path, mocked `GuildService`, `retry: false`), one new file per area: `guild-expansion-hooks.test.tsx`, `guild-expansion-utils.test.ts`, `guild-board-expansion.test.tsx`, `guild-contracts-expansion.test.tsx`, `guild-progression.test.tsx`, `guild-economy.test.tsx`, `guild-arcs-bounties.test.tsx`; extend `guild-notification.test.ts`. Existing Guild tests must keep passing. Final acceptance: browser walkthrough (task group 9).

## Risks / Trade-offs

- [Hand-drawn SVGs without Figma] → strict 3 px grid and existing palette; reviewed in the browser walkthrough; easy to replace later since every path goes through `GUILD_ASSETS`.
- [Six tabs on mobile] → horizontal scroll with the active tab scrolled into view.
- [Swagger drift between server branches] → D1 merge keeps client-only paths.
- [Concurrent agents on shared files] → D11 ownership rules.
- [Bounties need admin-created data] → acceptance seeds a bounty through the admin API or SQL on the local database.
