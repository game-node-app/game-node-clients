import { ApiError } from "@repo/wrapper/server";

/**
 * Code returned by every gated Guild player route while the server is in
 * supporter early access and the caller has no access.
 */
export const GUILD_EARLY_ACCESS_REQUIRED = "guild_early_access_required";

/** 409 when the active-contract cap from `license.perks` is already reached. */
export const GUILD_ACTIVE_CONTRACT_LIMIT_REACHED =
  "guild_active_contract_limit_reached";

/** 403 when the buyer's rank is below the Emporium listing `minRank`. */
export const GUILD_EMPORIUM_RANK_REQUIRED = "guild_emporium_rank_required";

/** 403 when the player's rank is below the Quest Chain `minRank`. */
export const GUILD_CHAIN_RANK_REQUIRED = "guild_chain_rank_required";

/** Fallback used when no Guild overview is cached for the limit copy. */
export const GUILD_DEFAULT_MAX_ACTIVE_CONTRACTS = 3;

/**
 * Business codes with dedicated copy under `guild.errors.<code>` (design D7 and
 * hand-off section 9). Everything else falls back to the API message through
 * `createErrorNotification`. `guild_early_access_required` is handled before
 * this list because it only flips the access gate.
 */
export const GUILD_TRANSLATED_ERROR_CODES: readonly string[] = [
  "guild_active_contract_limit_reached",
  "guild_bounty_not_claimable",
  "guild_bounty_not_eligible",
  "guild_bounty_nothing_to_claim",
  "guild_bounty_rules_locked",
  "guild_board_entry_not_found",
  "guild_chain_already_completed",
  "guild_chain_already_started",
  "guild_chain_rank_required",
  "guild_chain_stage_active",
  "guild_consumable_not_owned",
  "guild_contract_already_exists",
  "guild_contract_already_extended",
  "guild_contract_expired",
  "guild_contract_not_active",
  "guild_contract_not_ready",
  "guild_cosmetic_limit_exceeded",
  "guild_cosmetic_not_owned",
  "guild_emporium_already_owned",
  "guild_emporium_monthly_limit_reached",
  "guild_emporium_rank_required",
  "guild_event_rules_locked",
  "guild_insufficient_seals",
  "guild_invalid_amount",
  "guild_passport_invalid_milestone",
  "guild_passport_milestone_already_claimed",
  "guild_passport_milestone_not_reached",
  "guild_permit_already_active",
  "guild_reroll_not_available",
  "guild_reroll_unavailable",
  "guild_reward_identity_locked",
];

/**
 * Codes whose "Client handling" column in hand-off section 9 asks for a
 * refresh of the affected Guild reads (design D2). Mutation hooks also
 * invalidate on settle; this list is what keeps the handler self-contained.
 */
export const GUILD_REFRESH_ERROR_CODES: readonly string[] = [
  "guild_board_entry_not_found",
  "guild_contract_already_exists",
  "guild_contract_already_extended",
  "guild_contract_expired",
  "guild_contract_not_active",
  "guild_contract_not_ready",
  "guild_consumable_not_owned",
  "guild_emporium_already_owned",
  "guild_emporium_monthly_limit_reached",
  "guild_insufficient_seals",
  "guild_passport_milestone_already_claimed",
  "guild_chain_already_completed",
  "guild_chain_already_started",
  "guild_chain_stage_active",
  "guild_bounty_nothing_to_claim",
];

/**
 * Reads the machine-readable `code` of an API error body. Non-API errors (or
 * validation errors without a code) return `undefined`.
 */
export function getGuildErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;

  const body = (err as { body?: unknown }).body;
  if (!body || typeof body !== "object") return undefined;

  const code = (body as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

/**
 * True only for the Guild early-access gate: HTTP 403 with
 * `code: "guild_early_access_required"`.
 */
export function isGuildEarlyAccessError(err: unknown): boolean {
  if (getGuildErrorCode(err) !== GUILD_EARLY_ACCESS_REQUIRED) return false;

  const status =
    err instanceof ApiError
      ? err.status
      : (err as { status?: unknown } | null | undefined)?.status;

  return status === 403;
}

/**
 * Guild queries keep the default retry budget for transient failures but never
 * retry the early-access gate (the spec forbids retrying it in a loop).
 */
export function retryUnlessGuildEarlyAccess(
  failureCount: number,
  error: unknown,
): boolean {
  return !isGuildEarlyAccessError(error) && failureCount < 2;
}
