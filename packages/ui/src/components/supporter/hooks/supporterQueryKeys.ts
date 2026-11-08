/**
 * Query keys for the billing/supporter feature. Other modules (mobile page,
 * settings tab) use the `["billing", "me"]` prefix to invalidate every cached
 * status row after checkout or a browser return.
 */
export const SUPPORTER_QUERY_KEYS = {
  offers: ["billing", "offers"] as unknown[],
  me: ["billing", "me"] as unknown[],
};

export function getSupporterOffersQueryKey(): unknown[] {
  return [...SUPPORTER_QUERY_KEYS.offers];
}

/**
 * Untransformed status key. `null` keeps the key JSON-serializable when there
 * is no signed-in user (the query stays disabled in that case).
 */
export function getSupporterStatusQueryKey(userId?: string): unknown[] {
  return [...SUPPORTER_QUERY_KEYS.me, userId ?? null];
}
