import type { TFunction } from "i18next";
import {
  GuildContractDto,
  type GuildActiveChainSummaryDto,
} from "@repo/wrapper/server";

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Every Quest Chain has three stages (hand-off 8.2). */
export const GUILD_CHAIN_TOTAL_STAGES = 3;

function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
): string {
  return (t as unknown as Translate)(key, options);
}

/**
 * Condition copy of a contract's optional bonus objective (`board.bonus.*`),
 * read defensively because the swagger types it as an open object. Unknown
 * types render no condition rather than a raw key.
 */
export function getBonusObjectiveCondition(
  bonus: Record<string, unknown> | null | undefined,
  t: TFunction,
): string | null {
  const type = typeof bonus?.type === "string" ? bonus.type : null;
  if (!type) return null;

  if (type === "also_write_review") {
    const minChars = Number(bonus?.minChars);
    return translate(t, "guild.board.bonus.also_write_review", {
      chars: Number.isFinite(minChars) && minChars > 0 ? minChars : 150,
    });
  }

  if (type === "finish_before_half_deadline") {
    return translate(t, "guild.board.bonus.finish_before_half_deadline");
  }

  if (type === "use_stale_backlog_game") {
    const staleDays = Number(bonus?.staleDays);
    return translate(t, "guild.board.bonus.use_stale_backlog_game", {
      days: Number.isFinite(staleDays) && staleDays > 0 ? staleDays : 180,
    });
  }

  return null;
}

/** True only for a valid ISO instant still in the future. */
export function hasFutureExpiry(
  iso: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!iso) return false;

  const expiresAt = new Date(iso).getTime();
  return !Number.isNaN(expiresAt) && expiresAt > now;
}

/**
 * "Extend +7 days" rules of design D6: an `active` row that was never extended,
 * still has a future deadline and can pay with an Hourglass or the free monthly
 * allowance (the server picks which one).
 */
export function canOfferContractExtension(
  contract: GuildContractDto,
  resources: { hourglass: number; monthlyFreeHourglass: number },
): boolean {
  return (
    contract.status === GuildContractDto.status.ACTIVE &&
    (contract.extendedCount ?? 0) === 0 &&
    hasFutureExpiry(contract.expiresAt) &&
    ((resources.hourglass ?? 0) > 0 ||
      (resources.monthlyFreeHourglass ?? 0) > 0)
  );
}

/**
 * `contracts.chainStage` for the row owned by the active chain, e.g.
 * "Pathfinder's Arc · stage 2"; `null` for every other contract. The swagger
 * types chain keys as objects although the server sends a string.
 */
export function getChainStageLabel(
  contract: GuildContractDto,
  activeChain: GuildActiveChainSummaryDto | null | undefined,
  t: TFunction,
): string | null {
  if (
    !contract.chainProgressId ||
    !activeChain?.activeContractId ||
    String(activeChain.activeContractId) !== contract.id
  ) {
    return null;
  }

  const chainKey =
    activeChain.chainKey == null ? "" : String(activeChain.chainKey);
  const titleKey = `guild.chains.${chainKey}.title`;
  const title = translate(t, titleKey);

  return translate(t, "guild.contracts.chainStage", {
    chain: title === titleKey ? translate(t, "guild.chains.tabTitle") : title,
    stage: (activeChain.currentStageIndex ?? 0) + 1,
  });
}
