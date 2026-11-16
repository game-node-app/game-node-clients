/**
 * Hierarchical query keys for the 2026 Awards data layer (design §2).
 * The `["awards"]` prefix invalidates every cached Awards read.
 */
export const AWARDS_QUERY_KEY = ["awards"] as unknown[];

export function getCurrentAwardsEventQueryKey(): unknown[] {
  return ["awards", "event", "current"];
}

export function getAwardEventQueryKey({
  eventId,
  eventYear,
}: {
  eventId?: number;
  eventYear?: number;
}): unknown[] {
  return ["awards", "event", eventYear ?? null, eventId ?? null];
}

export function getAwardEventCategoriesQueryKey(eventId?: number): unknown[] {
  return ["awards", "event", eventId ?? null, "categories"];
}

export function getAwardsBallotQueryKey(
  eventId: number | undefined,
  userId: string | undefined,
): unknown[] {
  return ["awards", eventId ?? null, "ballot", userId ?? null];
}

export function getAwardsNominationsQueryKey(
  eventId: number | undefined,
  userId: string | undefined,
): unknown[] {
  return ["awards", eventId ?? null, "nominations", userId ?? null];
}

export function getAwardsSharedVotesQueryKey(
  eventId: number | undefined,
  userId: string | undefined,
): unknown[] {
  return ["awards", eventId ?? null, "votes", userId ?? null];
}

export function getAwardsResultsQueryKey(eventId?: number): unknown[] {
  return ["awards", eventId ?? null, "results"];
}

export function getAwardsScoreboardQueryKey(
  eventId: number | undefined,
  userId: string | undefined,
): unknown[] {
  return ["awards", eventId ?? null, "scoreboard", userId ?? null];
}
