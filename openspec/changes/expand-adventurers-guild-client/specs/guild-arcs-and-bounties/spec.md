# Spec Delta

## Purpose

Show Lina's Arcs (Quest Chains) and Community Bounties in the Guild Hall, and the Lina options that lead to them.

## ADDED Requirements

### Requirement: Arcs tab
An Arcs tab SHALL read `GET /v1/guild/chains` and show each chain with its localized title and description, status (`locked`, `available`, `in_progress`, `completed`), a three-stage track with the current stage, the current stage objective and rewards, the bound game when set, and the final rewards plus `finalBonusSeals`. `available` chains SHALL offer Start; when the first stage uses the bound game the user SHALL pick a game first and the request SHALL include `targetGameId`. `in_progress` chains whose `activeContractId` is set SHALL link to the Accepted tab; without an active contract they SHALL offer advancing (start next stage or retry). `locked` chains SHALL show the required rank. Start/advance errors (`guild_chain_already_started`, `guild_chain_already_completed`, `guild_chain_rank_required`, `guild_chain_stage_active`, `guild_active_contract_limit_reached`, 400) SHALL show translated or server messages and refresh.

#### Scenario: Start Pathfinder's Arc
- **WHEN** `pathfinders_arc` is `available` and the user picks Celeste (id 1029)
- **THEN** `POST /v1/guild/chains/pathfinders_arc/start` is called with `{ "targetGameId": 1029 }` and on success the Accepted tab is shown

#### Scenario: Locked arc
- **WHEN** `relic_hunters_arc` has `status: "locked"` and `minRank: "C"`
- **THEN** its stages are previewed and the action reads that it unlocks at Rank C, disabled

### Requirement: Bounties tab
A Bounties tab SHALL read `GET /v1/guild/bounties` with the current locale and show each bounty's title, description, shared progress (`currentTotal`/`targetTotal`, `progressPercent` with markers at 25, 50, 100 and 150), time left or the claim window, the user's contribution against `minUserContribution`, and each milestone's rewards and state. When `hasClaimableMilestones` is true a Claim button SHALL call `POST /v1/guild/bounties/{id}/claim` and show the newly claimed milestones, Seals, XP and chest results. Ineligible users SHALL see that they need to contribute first. `guild_bounty_not_claimable`, `guild_bounty_nothing_to_claim` and `guild_bounty_not_eligible` SHALL show translated messages and refresh.

#### Scenario: Claim bounty milestones
- **WHEN** a bounty has milestones 25 claimed and 50 claimable and the user claims
- **THEN** the request targets that bounty id and the result lists milestone 50 with its awarded Seals

### Requirement: Hall navigation for the new areas
The hall SHALL show tabs for Arcs, Bounties and Lina's Emporium after the existing three, show a marker on Bounties when `activeBountiesCount > 0`, and accept `tab` values `arcs`, `bounties` and `emporium` (plus `bountyId` for bounties) from the web and mobile `/guild` routes. Lina SHALL offer "Show me the Emporium", and when her trigger is `community_bounty_ready` she SHALL offer "Show me the bounty" first; each option switches to its tab. Lina's lines SHALL cover the triggers `rank_promoted`, `chain_completed`, `community_bounty_ready` and `monthly_expedition_refreshed`; unknown triggers fall back to the default line.

#### Scenario: Bounty ready greeting
- **WHEN** the overview returns `lina.trigger: "community_bounty_ready"`
- **THEN** Lina says the Community Bounty is ready to claim and her first option opens the Bounties tab
