import { Stack } from "@mantine/core";
import { ExploreTrendingGames } from "#@/components/explore/ExploreTrendingGames";
import {
  ExploreFilters,
  ExploreFiltersProps,
} from "#@/components/explore/view/ExploreFilters";
import { ExploreResults } from "#@/components/explore/view/ExploreResults";
import { buildPresenterComponent } from "#@/context";

const ExploreTrendingGamesPresenter = buildPresenterComponent(
  "ExploreTrendingGames",
  ExploreTrendingGames,
);

const CONSOLE_CATEGORY_LIMIT = 12;

/**
 * The Explore screen of web and mobile. The app owns the state (URL on web,
 * component state on mobile) and anything only it offers.
 */
const ExploreView = ({
  value,
  onChange,
  extraFilters,
}: ExploreFiltersProps) => {
  const filters = (
    <ExploreFilters
      value={value}
      onChange={onChange}
      extraFilters={extraFilters}
    />
  );
  const results = <ExploreResults value={value} onChange={onChange} />;

  return (
    <ExploreTrendingGamesPresenter
      filters={filters}
      results={results}
      dto={{
        period: value.period,
        criteria: value.criteria ?? {},
        limit: CONSOLE_CATEGORY_LIMIT,
      }}
      // a selection shows the paginated ranking; the console must keep that
      // content (and its pagination) instead of its categories
      filtered={value.criteria !== undefined}
    >
      <Stack className={"w-full"}>
        {filters}
        {results}
      </Stack>
    </ExploreTrendingGamesPresenter>
  );
};

export { ExploreView };
