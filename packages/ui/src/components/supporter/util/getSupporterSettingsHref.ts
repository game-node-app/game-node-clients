import type { SupporterInterval } from "#@/components/supporter/types";

export type SupporterCheckoutResult = "success" | "cancel";

/** Query params only the settings Supporter surface reads. */
export const SUPPORTER_INTERVAL_QUERY_PARAM = "interval";
export const SUPPORTER_CHECKOUT_QUERY_PARAM = "checkout";

export interface SupporterSettingsHrefParams {
  interval?: SupporterInterval | null;
  checkout?: SupporterCheckoutResult | null;
}

/**
 * Canonical URL of the settings Supporter surface. This is the only supporter
 * entry URL: no client registers a `/supporter` page, redirect or App Link.
 * Values outside the contract are ignored.
 */
export function getSupporterSettingsHref({
  interval,
  checkout,
}: SupporterSettingsHrefParams = {}): string {
  const query = new URLSearchParams({ settings: "premium" });

  if (interval === "monthly" || interval === "yearly") {
    query.set(SUPPORTER_INTERVAL_QUERY_PARAM, interval);
  }
  if (checkout === "success" || checkout === "cancel") {
    query.set(SUPPORTER_CHECKOUT_QUERY_PARAM, checkout);
  }

  return `/home?${query.toString()}`;
}
