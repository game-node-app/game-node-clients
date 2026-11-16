import type {
  AwardsCategoryResult,
  AwardsCategoryResultWinner,
} from "@repo/wrapper/server";

/**
 * Derivations of the Awards result screen (design §8).
 *
 * `RESULTS` is ordered by category id and its winners by position; the screen
 * reorders by `category.order` and, for the "only those who played" list, by
 * `playedVotesPercentage` (G18).
 */

/** Public origin used by the shared score link; the mobile WebView origin is not public. */
export const AWARDS_RESULTS_PUBLIC_ORIGIN = "https://gamenode.app";

/** `/awards/{year}/result?user={userId}` of the "Compartilhar meu placar" action. */
export function getAwardsResultsShareUrl(year: number, userId: string): string {
  return `${AWARDS_RESULTS_PUBLIC_ORIGIN}/awards/${year}/result?user=${encodeURIComponent(userId)}`;
}

export type AwardsResultsVoteMode = "all" | "played";

/**
 * A category has played-only data when the server counted at least one vote
 * from someone who had played the game. Old events report zero, so the toggle
 * and the dispute note are omitted (spec: Evento antigo).
 */
export function hasPlayedVotes(
  result:
    | Pick<AwardsCategoryResult, "totalPlayedVotesCount">
    | null
    | undefined,
): boolean {
  return (result?.totalPlayedVotesCount ?? 0) > 0;
}

/** Share used by the selected mode; 0 when the server did not send it. */
export function getWinnerPercentage(
  winner: AwardsCategoryResultWinner,
  mode: AwardsResultsVoteMode,
): number {
  const value =
    mode === "played" ? winner.playedVotesPercentage : winner.votesPercentage;

  return Number.isFinite(value) ? value : 0;
}

/** Copy of the winners ordered by the selected share, descending. */
export function sortWinnersByMode(
  winners: readonly AwardsCategoryResultWinner[],
  mode: AwardsResultsVoteMode,
): AwardsCategoryResultWinner[] {
  return [...winners].sort(
    (a, b) => getWinnerPercentage(b, mode) - getWinnerPercentage(a, mode),
  );
}

/**
 * Copy of the results ordered by `category.order` (G18). The read is ordered by
 * category id, so the display order must be applied here.
 */
export function sortResultsByCategoryOrder(
  results: readonly AwardsCategoryResult[],
): AwardsCategoryResult[] {
  return [...results].sort(
    (a, b) => (a.category?.order ?? 0) - (b.category?.order ?? 0),
  );
}

/** The category winner: position 1, or the first row when positions are missing. */
export function findCategoryWinner(
  result: Pick<AwardsCategoryResult, "winners">,
): AwardsCategoryResultWinner | null {
  return (
    result.winners.find((winner) => winner.position === 1) ??
    result.winners[0] ??
    null
  );
}

/**
 * The two games compared by the played-only note. Null without a played share,
 * so the note is omitted instead of showing an empty comparison.
 */
export function getPlayedDispute(
  winners: readonly AwardsCategoryResultWinner[],
): [AwardsCategoryResultWinner, AwardsCategoryResultWinner] | null {
  const [first, second] = sortWinnersByMode(winners, "played");

  if (!first || !second || getWinnerPercentage(first, "played") <= 0) {
    return null;
  }

  return [first, second];
}
