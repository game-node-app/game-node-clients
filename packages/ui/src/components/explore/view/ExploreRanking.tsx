import { useTranslation } from "@repo/locales";
import { useMemo } from "react";
import {
  ExploreViewValue,
  getExploreRankingDto,
} from "#@/components/explore/util/exploreValue";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { SimpleInfiniteLoader } from "#@/components/feed/SimpleInfiniteLoader";
import { useGamesByPages } from "#@/components/game/hooks/useGamesByPages";
import { GameView } from "#@/components/game/view/GameView";
import { useInfiniteTrendingGames } from "#@/components/statistics/hooks/useInfiniteTrendingGames";

const RANKING_COLS = { base: 4, lg: 6, xl: 8 };

/** The paginated ranking grid for the current period and filters. */
const ExploreRanking = ({ value }: { value: ExploreViewValue }) => {
  const { t } = useTranslation();
  const trendingQuery = useInfiniteTrendingGames(getExploreRankingDto(value));

  const gamePages = useMemo(
    () =>
      trendingQuery.data?.pages.map((page) =>
        page.items
          .map((item) => item.sourceId)
          .filter((id): id is number => typeof id === "number"),
      ),
    [trendingQuery.data],
  );
  const gameIds = useMemo(
    () => (gamePages ? [...new Set(gamePages.flat())] : undefined),
    [gamePages],
  );

  const gamesQuery = useGamesByPages(gamePages, { cover: true });

  const isFetching = trendingQuery.isFetching || gamesQuery.isFetching;
  const games = gameIds
    ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game) => game !== undefined);
  const hasError = trendingQuery.isError || gamesQuery.isError;

  return (
    <GameView layout={"grid"} cols={RANKING_COLS}>
      {hasError && <CenteredErrorMessage message={t("explore.fetchError")} />}
      {!hasError && !isFetching && games?.length === 0 && (
        <CenteredErrorMessage message={t("game.search.noGamesFound")} />
      )}
      <GameView.Content items={games}>
        <GameView.LoadingSkeletons
          isVisible={isFetching}
          itemCount={games?.length}
        />
      </GameView.Content>
      <SimpleInfiniteLoader
        key={gamesQuery.data?.map((game) => game.id).join(",")}
        fetchNextPage={async () => {
          if (isFetching) return;
          await trendingQuery.fetchNextPage();
        }}
        isFetching={isFetching}
        hasNextPage={!hasError && trendingQuery.hasNextPage}
      />
    </GameView>
  );
};

export { ExploreRanking };
