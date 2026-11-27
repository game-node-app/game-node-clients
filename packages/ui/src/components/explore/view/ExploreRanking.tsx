import { useTranslation } from "@repo/locales";
import { useEffect, useMemo, useState } from "react";
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

/**
 * Start fetching the next page about one and a half viewports before its
 * first row, so the ranking is ready by the time it is scrolled to. Page height
 * depends on the number of columns, so the margin scales with the viewport
 * instead of pixels.
 */
const RANKING_PREFETCH_MARGIN = "0px 0px 150% 0px";

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
  const gamesKey = games?.map((game) => game.id).join(",") ?? "";

  // Mount the sentinel only after the loaded grid has been laid out. Its first
  // intersection is measured while the cards are still committing, when the
  // loader sits where the empty grid was, and would immediately chain another
  // page. One frame later the grid has its real height and the observation is
  // accurate.
  const [preparedKey, setPreparedKey] = useState<string | null>(null);
  useEffect(() => {
    if (!gamesKey) {
      setPreparedKey(null);
      return;
    }
    const frame = requestAnimationFrame(() => setPreparedKey(gamesKey));
    return () => cancelAnimationFrame(frame);
  }, [gamesKey]);
  const loaderReady = !!gamesKey && preparedKey === gamesKey;

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
      {loaderReady && (
        <SimpleInfiniteLoader
          key={gamesKey}
          rootMargin={RANKING_PREFETCH_MARGIN}
          fetchNextPage={async () => {
            if (isFetching) return;
            await trendingQuery.fetchNextPage();
          }}
          isFetching={isFetching}
          hasNextPage={!hasError && trendingQuery.hasNextPage}
        />
      )}
    </GameView>
  );
};

export { ExploreRanking };
