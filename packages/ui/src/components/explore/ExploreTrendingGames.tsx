import { ReactNode, useMemo } from "react";
import { useTranslation } from "@repo/locales";
import {
  CenteredErrorMessage,
  GameView,
  InfiniteQueryTrendingGamesDto,
  SimpleInfiniteLoader,
  useGames,
  useInfiniteTrendingGames,
} from "#@/components";
import { buildPresenterComponent } from "#@/context";

export interface ExploreTrendingGamesProps {
  /** the explore filters' result (period, genres, platforms…) */
  dto: InfiniteQueryTrendingGamesDto;
  /** false until the filters have read the URL */
  enabled: boolean;
  /** the app's filter controls, placed by each presenter */
  filters: ReactNode;
}

/** Explore's trending games as an infinite cover grid. */
const DEFAULT_ExploreTrendingGames = ({
  dto,
  enabled,
  filters,
}: ExploreTrendingGamesProps) => {
  const { t } = useTranslation();
  const trendingGamesQuery = useInfiniteTrendingGames(dto, enabled);

  const gamesIds = useMemo(() => {
    if (trendingGamesQuery.isError || trendingGamesQuery.data == undefined)
      return undefined;
    return [
      ...new Set(
        trendingGamesQuery.data.pages.flatMap((page) =>
          page.items
            .map((item) => item.sourceId)
            .filter((id): id is number => typeof id === "number"),
        ),
      ),
    ];
  }, [trendingGamesQuery.data, trendingGamesQuery.isError]);

  const gamesQuery = useGames(
    {
      gameIds: gamesIds!,
      relations: {
        cover: true,
      },
    },
    true,
  );

  const games =
    gamesIds
      ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
      .filter((game) => game !== undefined) ?? [];

  const isFetching =
    trendingGamesQuery.isFetching ||
    trendingGamesQuery.isFetchingNextPage ||
    trendingGamesQuery.isPending ||
    trendingGamesQuery.isFetchingPreviousPage ||
    gamesQuery.isFetching;

  const isLoading = trendingGamesQuery.isLoading || gamesQuery.isLoading;
  const isError = trendingGamesQuery.isError || gamesQuery.isError;

  if (isError) {
    return (
      <CenteredErrorMessage mt={"2rem"} message={t("explore.fetchError")} />
    );
  }

  return (
    <>
      <GameView
        layout={"grid"}
        cols={{
          base: 4,
          lg: 8,
        }}
      >
        {filters}
        <GameView.Content items={games}>
          <GameView.LoadingSkeletons
            isVisible={isFetching || isLoading}
            itemCount={games.length}
          />
        </GameView.Content>
      </GameView>

      <SimpleInfiniteLoader
        key={gamesQuery.data?.map((game) => game.id).join(",")}
        fetchNextPage={async () => {
          await trendingGamesQuery.fetchNextPage();
        }}
        isFetching={isFetching}
        hasNextPage={trendingGamesQuery.hasNextPage}
      />
    </>
  );
};

const ExploreTrendingGames = buildPresenterComponent(
  "ExploreTrendingGames",
  DEFAULT_ExploreTrendingGames,
);

export { ExploreTrendingGames };
