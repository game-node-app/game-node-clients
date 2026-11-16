/**
 * Hierarchical query keys for the 2026 Recap data layer (design §2).
 * The `["recap"]` prefix invalidates every cached Recap read.
 */
export const RECAP_QUERY_KEY = ["recap"] as unknown[];

export function getCurrentRecapWindowQueryKey(): unknown[] {
  return ["recap", "current"];
}

export function getRecapStatusQueryKey(
  userId: string | undefined,
  year: number | undefined,
): unknown[] {
  return ["recap", "status", userId ?? null, year ?? null];
}

export function getRecapQueryKey(
  year: number | undefined,
  userId: string | undefined,
): unknown[] {
  return ["recap", year ?? null, userId ?? null];
}

export function getRecapGoalQueryKey(
  year: number | undefined,
  userId: string | undefined,
): unknown[] {
  return ["recap", "goals", year ?? null, userId ?? null];
}
