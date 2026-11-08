import type {
  BillingMeResponseDto,
  BillingOfferDto,
  BillingOffersResponseDto,
} from "@repo/wrapper/server";
import type {
  SupporterBillingInterval,
  SupporterCurrency,
  SupporterInterval,
  SupporterOffer,
  SupporterOffers,
  SupporterStatus,
} from "../types";

/**
 * Narrows the generated union-typed interval (`Record<string, any>`) to the
 * values the billing contract defines. Unknown values are dropped.
 */
export function narrowSupporterInterval(
  value: unknown,
): SupporterInterval | null {
  return value === "monthly" || value === "yearly" ? value : null;
}

/**
 * Narrows the generated union-typed currency (`Record<string, any>`). Unknown
 * values become `null` and are treated as unavailable by the UI.
 */
export function narrowSupporterCurrency(
  value: unknown,
): SupporterCurrency | null {
  return value === "BRL" || value === "USD" ? value : null;
}

/**
 * `BillingMeResponseDto.billingInterval` is a free string (`"month"`/`"year"`).
 * Anything else is ignored instead of guessed.
 */
export function narrowSupporterBillingInterval(
  value: unknown,
): SupporterBillingInterval | null {
  return value === "month" || value === "year" ? value : null;
}

export function normalizeSupporterOffer(
  raw: BillingOfferDto,
): SupporterOffer | null {
  const interval = narrowSupporterInterval(raw?.interval);
  if (!interval) return null;

  const plan = typeof raw.plan === "string" ? raw.plan : null;
  const amount =
    typeof raw.amount === "number" && Number.isFinite(raw.amount)
      ? raw.amount
      : null;
  const displayAmount =
    typeof raw.displayAmount === "string" && raw.displayAmount.trim() !== ""
      ? raw.displayAmount
      : null;

  if (plan === null || amount === null || displayAmount === null) return null;

  return { plan, interval, amount, displayAmount };
}

/**
 * Keeps only offers with a known interval and never invents a price. An
 * unknown currency is exposed as `null` while valid offers are preserved.
 */
export function normalizeSupporterOffers(
  raw: BillingOffersResponseDto,
): SupporterOffers {
  const rawOffers = Array.isArray(raw?.offers) ? raw.offers : [];

  return {
    currency: narrowSupporterCurrency(raw?.currency),
    offers: rawOffers
      .map(normalizeSupporterOffer)
      .filter((offer): offer is SupporterOffer => offer !== null),
  };
}

/** Normalizes the status response without inferring entitlement locally. */
export function normalizeSupporterStatus(
  raw: BillingMeResponseDto,
): SupporterStatus {
  return {
    isSupporter: raw?.isSupporter === true,
    status: typeof raw?.status === "string" ? raw.status : null,
    plan: typeof raw?.plan === "string" ? raw.plan : null,
    billingInterval: narrowSupporterBillingInterval(raw?.billingInterval),
    periodEnd: typeof raw?.periodEnd === "string" ? raw.periodEnd : null,
    cancelAtPeriodEnd:
      typeof raw?.cancelAtPeriodEnd === "boolean"
        ? raw.cancelAtPeriodEnd
        : null,
    // A server without the field (or an explicit `null`) hides the since line;
    // the client never invents a date from other billing fields.
    supporterSince:
      typeof raw?.supporterSince === "string" ? raw.supporterSince : null,
  };
}
