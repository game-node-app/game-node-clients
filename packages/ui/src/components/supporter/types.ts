/**
 * Normalized types for the billing/supporter contract.
 *
 * The generated wrapper emits `BillingOfferDto.interval` and
 * `BillingOffersResponseDto.currency` as `Record<string, any>`, and
 * `BillingMeResponseDto.status`/`billingInterval` as free strings. The hooks
 * narrow those values at runtime and expose these trusted shapes to the UI.
 */

export type SupporterInterval = "monthly" | "yearly";

export type SupporterCurrency = "BRL" | "USD";

export type SupporterBillingInterval = "month" | "year";

export type SupporterOffer = {
  plan: string;
  interval: SupporterInterval;
  /** Minor units, exactly as returned by the server. */
  amount: number;
  /** Server-provided localized amount, the only value the UI may display. */
  displayAmount: string;
};

export type SupporterOffers = {
  /** `null` means the server returned an unknown currency; offers stay valid. */
  currency: SupporterCurrency | null;
  offers: SupporterOffer[];
};

export type SupporterStatus = {
  isSupporter: boolean;
  status: string | null;
  plan: string | null;
  billingInterval: SupporterBillingInterval | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  /**
   * Start of the current continuous subscription as returned by the server,
   * `null` unless the user is a supporter. Never derived from other dates.
   */
  supporterSince: string | null;
};

export type SupporterCheckoutVariables = {
  interval: SupporterInterval;
  locale?: string;
};

export type SupporterPortalVariables = {
  locale?: string;
};

export type SupporterErrorKind =
  | "unauthorized"
  | "notFound"
  | "conflict"
  | "unavailable"
  | "network"
  | "unknown";
