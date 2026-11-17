/**
 * Hierarchical query keys for the 2026 Recap data layer (design §2).
 * The `["recap"]` prefix invalidates every cached Recap read.
 *
 * Reads of another user's Recap are session-aware (a hidden library answers
 * 404), so the viewer id — or `null` while signed out — ends every such key.
 */
export const RECAP_QUERY_KEY = ["recap"] as unknown[];

export function getCurrentRecapWindowQueryKey(): unknown[] {
  return ["recap", "current"];
}

export function getRecapStatusQueryKey(
  userId: string | undefined,
  year: number | undefined,
  viewerId: string | null | undefined,
): unknown[] {
  return ["recap", "status", userId ?? null, year ?? null, viewerId ?? null];
}

export function getRecapQueryKey(
  year: number | undefined,
  userId: string | undefined,
  viewerId: string | null | undefined,
): unknown[] {
  return ["recap", year ?? null, userId ?? null, viewerId ?? null];
}

export function getRecapGoalQueryKey(
  year: number | undefined,
  userId: string | undefined,
): unknown[] {
  return ["recap", "goals", year ?? null, userId ?? null];
}
