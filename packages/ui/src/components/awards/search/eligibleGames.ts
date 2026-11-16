/**
 * Awards eligibility rules for the game search, mirroring the server's
 * `isGameEligible` (year + optional release cutoff). Dates are compared by UTC
 * day because the Awards calendar is UTC and the cutoff is a day, not a time.
 */

export interface AwardsEligibilityFilter {
  year: number;
  /**
   * Optional release cutoff. A game released on or before this UTC day stays
   * eligible; games released after it are not offered.
   */
  eligibilityCutoffDate?: string | Date | null;
}

export interface AwardsEligibleGameLike {
  firstReleaseDate?: string | Date | null;
}

function toUtcDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toUtcDayNumber(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Whether the search result may be offered for the event. Games without a
 * (valid) release date stay eligible, as before the cutoff existed.
 */
export function isAwardsGameEligible(
  game: AwardsEligibleGameLike | null | undefined,
  filter: AwardsEligibilityFilter,
): boolean {
  const releaseDate = game?.firstReleaseDate;
  if (releaseDate == null || releaseDate === "") {
    return true;
  }

  const release = toUtcDate(releaseDate);
  if (!release) {
    // A malformed date is not the same as "no release date": the server's
    // year check would reject it, so the search does not offer it either.
    return false;
  }

  if (release.getUTCFullYear() !== filter.year) {
    return false;
  }

  if (filter.eligibilityCutoffDate == null) {
    return true;
  }

  const cutoff = toUtcDate(filter.eligibilityCutoffDate);
  if (!cutoff) {
    return true;
  }

  return toUtcDayNumber(release) <= toUtcDayNumber(cutoff);
}

/** Copy of the search results that are eligible for the event. */
export function filterAwardsEligibleGames<T extends AwardsEligibleGameLike>(
  games: readonly T[] | null | undefined,
  filter: AwardsEligibilityFilter,
): T[] {
  return (games ?? []).filter((game) => isAwardsGameEligible(game, filter));
}
