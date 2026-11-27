# Proposal

## Why

The server change `expand-adventurers-guild-quests-and-rewards` (server worktree `feat/guild-missions-rewards`) turns the Adventurers Guild into a long-lived progression loop: 31 quest templates over 10 objectives, Monthly Expeditions, board rerolls, optional bonus objectives, Guild Seals, four chest tiers, Lina's Emporium, consumables, the Monthly Guild Passport, Rank promotion packages and perks, Prestige `S+`, narrative Quest Chains (Lina's Arcs), cooperative Community Bounties and new equippable cosmetics. All of it is additive to the API the clients already use (`add-adventurers-guild`), so the current web and mobile Guild keeps working but shows none of it, and new template/reward keys fall back to generic labels.

## What Changes

- Regenerate `@repo/wrapper` with the new Guild routes and DTOs while keeping the client-only routes already in the client swagger.
- Board: Monthly Expedition card (Rank `C+`) and a locked teaser below Rank `C`; Seals on every card; optional bonus objective; weekly reroll with free rerolls and Reroll Charters; `monthly` category tag; copy for all 31 templates and the new `meta` chips (genre, franchise, theme, decade, stale days).
- Contracts: Seals, bonus objective status, Hourglass extension, chain stage label, contract cap from `license.perks.maxActiveContracts`.
- Claim celebration: Seals, bonus objective, chest tier and consumable drop, Rank promotion package, Prestige Relic chests, passport stamp, chain progress/completion, and the `rank_promoted` / `chain_completed` Lina lines.
- Economy: Seals balance in the header and License; Lina's Emporium tab (permanent shelf + monthly rotating showcase, purchase flow); consumables inventory with Extra Slot Permit activation.
- Progression: Monthly Guild Passport card with claimable milestones; Prestige stars; rank perks on the License; License theme, stamp style, tavern decor (rendered on Lina's counter) and a 3-slot Trophy Showcase, all equippable from the rewards panel.
- Arcs and Bounties tabs: start/advance Quest Chains (with a library game for Pathfinder's Arc), Community Bounty progress and claim.
- Lina: copy for the four new triggers, Emporium and Bounty dialogue options.
- Notifications: `guild.community-bounty-ready` inbox item deep-linking to the Bounties tab.
- New pixel-art icons for Seals, chest tiers, consumables and tavern decor, in the existing Guild art style.

Not included: any server change; Guild admin UI for events, rewards, Emporium or bounties (the clients have none today); Guild cosmetics on public profile pages beyond what already exists.

## Capabilities

### New Capabilities

- `guild-board-and-contracts`: Monthly Expeditions, rerolls, bonus objectives, Seals and extension on quest cards and contracts, the expanded claim celebration, and copy for every template.
- `guild-economy`: Seals display, Lina's Emporium, consumables inventory and Extra Slot Permit.
- `guild-progression`: Passport, Prestige, rank perks and promotion packages, and the new equippable cosmetics including tavern decor and Trophy Showcase.
- `guild-arcs-and-bounties`: Quest Chains and Community Bounties tabs.

### Modified Capabilities

- `notification-inbox`: renders `guild.community-bounty-ready` and routes it to the Bounties tab.

## Impact

- `packages/wrapper` (generated), `packages/locales` (`guild.*`, `notifications.guild.*`), `packages/ui/src/components/guild/**`, `packages/ui/src/components/notifications/**`, `apps/web/public/img/guild`, `apps/mobile/public/img/guild`, the web and mobile `/guild` pages (new `tab` values and `bountyId`), tests under `apps/mobile/src/components/guild/`.
- Ships after the server change is deployed. Every new read is additive, so an older server would only fail the new tabs.
