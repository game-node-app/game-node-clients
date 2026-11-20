import {
  ExploreGamesFilters,
  ExploreGamesPageView,
  ExploreGamesResults,
  useExploreGamesViewState,
} from "@/components/explore/ExploreGamesPageView";
import { AppPage } from "@/components/general/AppPage.tsx";
import {
  buildPresenterComponent,
  ExploreTrendingGames,
  type InfiniteQueryTrendingGamesDto,
} from "@repo/ui";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

const ExploreTrendingGamesPresenter = buildPresenterComponent(
  "ExploreTrendingGames",
  ExploreTrendingGames,
);

const CONSOLE_CATEGORY_LIMIT = 12;

const ExplorePage = () => {
  const queryClient = useQueryClient();
  const viewState = useExploreGamesViewState();
  const consoleDto = useMemo<InfiniteQueryTrendingGamesDto>(
    () => ({
      period: viewState.selectedPeriod,
      criteria: {},
      limit: CONSOLE_CATEGORY_LIMIT,
    }),
    [viewState.selectedPeriod],
  );
  // A genre/genre "see all" selection shows the paginated ranking; the console
  // must keep that content (and its pagination) instead of its categories.
  const filtered = viewState.selection !== "overview";

  return (
    <AppPage withMenuButton>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          await queryClient.resetQueries({
            queryKey: ["statistics", "trending", "game"],
            type: "active",
          });
          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <ExploreTrendingGamesPresenter
        filters={<ExploreGamesFilters state={viewState} />}
        results={<ExploreGamesResults state={viewState} />}
        dto={consoleDto}
        filtered={filtered}
      >
        <ExploreGamesPageView state={viewState} />
      </ExploreTrendingGamesPresenter>
    </AppPage>
  );
};

export default ExplorePage;
