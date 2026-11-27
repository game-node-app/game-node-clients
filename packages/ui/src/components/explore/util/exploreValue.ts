import {
  GameRankingCriteriaDto,
  StatisticsRankingsRequestDto,
} from "@repo/wrapper/server";
import type { InfiniteQueryTrendingGamesDto } from "#@/components/statistics/hooks/useInfiniteTrendingGames";

/** What the Explore screen is showing. Each app decides where it is stored. */
export interface ExploreViewValue {
  period: StatisticsRankingsRequestDto.period;
  /**
   * `undefined` shows the category shelves; an object, even an empty one (the
   * overall ranking), shows the paginated ranking filtered by it.
   */
  criteria?: GameRankingCriteriaDto;
}

/**
 * Games per ranking page. The API accepts at most 100, and 96 fills whole rows
 * in every ranking grid (4, 6 and 8 columns) so fewer "load more" rounds are
 * needed to keep scrolling.
 */
export const EXPLORE_RESULT_LIMIT = 96;

/**
 * Request of the paginated ranking. An empty `criteria` is left out entirely, so
 * the key stays JSON-serializable for SSR dehydration.
 */
export const getExploreRankingDto = ({
  period,
  criteria,
}: ExploreViewValue): InfiniteQueryTrendingGamesDto => ({
  period,
  limit: EXPLORE_RESULT_LIMIT,
  ...(criteria && Object.keys(criteria).length > 0 && { criteria }),
});

/**
 * Applies a genre chip: it replaces the selected genres and keeps the other
 * filters. Choosing "All" with nothing else selected goes back to the shelves.
 */
export const selectExploreGenre = (
  value: ExploreViewValue,
  genreId: number | undefined,
): ExploreViewValue => {
  const others: GameRankingCriteriaDto = { ...value.criteria };
  delete others.genres;
  if (genreId !== undefined) {
    return { ...value, criteria: { ...others, genres: [genreId] } };
  }
  return {
    period: value.period,
    ...(Object.keys(others).length > 0 && { criteria: others }),
  };
};
