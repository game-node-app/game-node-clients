import type { ReactNode } from "react";
import type { InfiniteQueryTrendingGamesDto } from "#@/components/statistics/hooks/useInfiniteTrendingGames";

export interface ExploreTrendingGamesProps {
  /**
   * The platform's current explore content, rendered unchanged by the default.
   * It includes the filter UI and the paginated results.
   */
  children?: ReactNode;
  /**
   * Optional filter UI for experiences that render their own sections. The
   * default page already renders its filters inside `children`; the console
   * explore keeps this slot mounted above its category sections and results.
   */
  filters?: ReactNode;
  /**
   * The platform's results and pagination without the filter UI, used by an
   * experience that keeps `filters` in place. The default keeps both inside
   * `children`.
   */
  results?: ReactNode;
  /**
   * Current filter/query parameters, so an experience's own queries use the
   * same period and criteria as the platform filters.
   */
  dto?: InfiniteQueryTrendingGamesDto;
  /**
   * Whether the platform filters are showing results. The console explore then
   * renders `results` (or `children`) instead of its default category sections.
   */
  filtered?: boolean;
}

/**
 * Default explore content. Web and mobile pages pass their current filters and
 * paginated results as children; the `console` experience replaces the content
 * with category rows and best-rated cards using the same trending hooks.
 */
const ExploreTrendingGames = ({
  children,
  filters,
  results,
}: ExploreTrendingGamesProps) => (
  <>
    {children ?? (
      <>
        {filters}
        {results}
      </>
    )}
  </>
);

export { ExploreTrendingGames };
