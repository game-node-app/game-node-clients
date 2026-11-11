/**
 * Query keys for the billing/supporter feature. Other modules (mobile page,
 * settings tab) use the `["billing", "me"]` prefix to invalidate every cached
 * status row after checkout or a browser return.
 */
export const SUPPORTER_QUERY_KEYS = {
  offers: ["billing", "offers"] as unknown[],
  me: ["billing", "me"] as unknown[],
};

/**
 * Shared by every supporter preference control: the settings screen reads it
 * (through `useMutationState`) to show "Saving…"/"Saved" for the last change
 * (design D7/D8).
 */
export const SUPPORTER_PREFERENCES_MUTATION_KEY = [
  "supporter",
  "preferences",
  "update",
] as unknown[];

/** Public supporters wall prefix, invalidated when the wall preference changes (D11). */
export const SUPPORTERS_WALL_QUERY_KEY = ["supporters", "wall"] as unknown[];

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

/**
 * Public presence of a profile. Kept separate from `["userProfile", userId]`
 * so a preference update can drop the presence cache without touching the
 * profile read (design D6/D8).
 */
export function getProfilePresenceQueryKey(userId?: string | null): unknown[] {
  return ["profile", "presence", userId ?? null];
}
