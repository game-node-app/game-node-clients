import { IonSelect, IonSelectOption } from "@ionic/react";
import { Flex, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CenteredErrorMessage,
  GameView,
  SimpleInfiniteLoader,
  useGames,
  useGamesResource,
  useInfiniteTrendingGames,
} from "@repo/ui";
import { TrendingGenreChips } from "@/components/explore/TrendingGenreChips";
import { TrendingShelf } from "@/components/explore/TrendingShelf";
import { TRENDING_GENRE_IDS } from "@/components/explore/trending-genres";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { useMemo, useState } from "react";

import period = StatisticsRankingsRequestDto.period;

const DEFAULT_LIMIT = 48;

type ExploreSelection = "overview" | "overall" | number;

/**
 * State shared by the page (which hands the filter UI to a theme experience)
 * and the default view (which keeps it inline). Lifting it lets the console
 * explore keep the same filters mounted while it swaps the content below them.
 */
const useExploreGamesViewState = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<period>(period.MONTH);
  const [selection, setSelection] = useState<ExploreSelection>("overview");
  const isOverview = selection === "overview";
  const selectedGenreId = typeof selection === "number" ? selection : undefined;

  const { data: genresResource } = useGamesResource("genres");
  const genres = useMemo(
    () =>
      TRENDING_GENRE_IDS.map((id) => {
        const genre = genresResource?.find((item) => item.id === id);
        return genre?.name ? { id, name: genre.name } : undefined;
      }).filter((genre) => genre !== undefined),
    [genresResource],
  );

  const onSelectGenre = (genreId: number | undefined) => {
    setSelection(genreId ?? "overview");
  };

  const onSelectOverall = () => {
    setSelection("overall");
  };

  const periodSelectOptions = useMemo(
    () => [
      { label: t("explore.periods.week"), value: period.WEEK },
      { label: t("explore.periods.month"), value: period.MONTH },
      {
        label: t("explore.periods.threeMonths"),
        value: period.QUARTER,
      },
      {
        label: t("explore.periods.sixMonths"),
        value: period.HALF_YEAR,
      },
      { label: t("explore.periods.year"), value: period.YEAR },
      { label: t("explore.periods.allTime"), value: period.ALL },
    ],
    [t],
  );

  return {
    selectedPeriod,
    setSelectedPeriod,
    selection,
    isOverview,
    selectedGenreId,
    genres,
    onSelectGenre,
    onSelectOverall,
    periodSelectOptions,
  };
};

type ExploreGamesViewState = ReturnType<typeof useExploreGamesViewState>;

/** Period picker and genre chips, kept above whichever content the view shows. */
const ExploreGamesFilters = ({ state }: { state: ExploreGamesViewState }) => {
  const { t } = useTranslation();

  return (
    <Flex className={"w-full items-center gap-2"} wrap={"nowrap"}>
      <IonSelect
        className={"gn-period-select"}
        aria-label={t("explore.filters.trendingIn")}
        interface="action-sheet"
        interfaceOptions={{ header: t("explore.filters.trendingIn") }}
        placeholder={t("explore.placeholders.selectPeriod")}
        onIonChange={(evt) => state.setSelectedPeriod(evt.detail.value)}
        value={state.selectedPeriod}
      >
        {state.periodSelectOptions.map(({ label, value }) => (
          <IonSelectOption key={value} value={value}>
            {label}
          </IonSelectOption>
        ))}
      </IonSelect>
      <div aria-hidden className={"h-5 w-px shrink-0 bg-foreground/15"} />
      <TrendingGenreChips
        className={"min-w-0 flex-1"}
        genres={state.genres}
        selectedGenreId={state.selectedGenreId}
        onSelect={state.onSelectGenre}
      />
    </Flex>
  );
};

/** Category shelves in the overview, or the paginated ranking for a selection. */
const ExploreGamesResults = ({ state }: { state: ExploreGamesViewState }) => {
  const { t } = useTranslation();
  const { isOverview, selectedGenreId, selectedPeriod, onSelectGenre } = state;

  const trendingGamesQuery = useInfiniteTrendingGames(
    {
      period: selectedPeriod,
      limit: DEFAULT_LIMIT,
      criteria:
        selectedGenreId === undefined
          ? undefined
          : { genres: [selectedGenreId] },
    },
    !isOverview,
  );

  const gamesIds = useMemo(() => {
    if (isOverview || !trendingGamesQuery.data) return undefined;
    return [
      ...new Set(
        trendingGamesQuery.data.pages.flatMap((page) =>
          page.items
            .map((item) => item.sourceId)
            .filter((id): id is number => typeof id === "number"),
        ),
      ),
    ];
  }, [isOverview, trendingGamesQuery.data]);

  const gamesQuery = useGames(
    {
      gameIds: gamesIds,
      relations: {
        cover: true,
      },
    },
    true,
  );

  const isFetching = trendingGamesQuery.isFetching || gamesQuery.isFetching;
  const games = gamesIds
    ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game) => game !== undefined);
  const hasError = trendingGamesQuery.isError || gamesQuery.isError;

  if (isOverview) {
    return (
      <Stack gap={"lg"} className={"w-full"}>
        <TrendingShelf
          ranked
          title={t("explore.sections.topOverall")}
          period={selectedPeriod}
          onSeeAll={state.onSelectOverall}
        />
        {state.genres.map((genre) => (
          <TrendingShelf
            key={genre.id}
            title={genre.name}
            genreId={genre.id}
            period={selectedPeriod}
            onSeeAll={() => onSelectGenre(genre.id)}
          />
        ))}
      </Stack>
    );
  }

  return (
    <GameView layout={"grid"}>
      {hasError && <CenteredErrorMessage message={t("explore.fetchError")} />}
      {!hasError && !isFetching && games?.length === 0 && (
        <CenteredErrorMessage message={t("game.search.noGamesFound")} />
      )}
      <GameView.Content items={games}>
        <GameView.LoadingSkeletons isVisible={isFetching} />
      </GameView.Content>
      <SimpleInfiniteLoader
        key={gamesQuery.data?.map((game) => game.id).join(",")}
        fetchNextPage={async () => {
          if (isFetching) return;
          await trendingGamesQuery.fetchNextPage();
        }}
        isFetching={isFetching}
        hasNextPage={!hasError && trendingGamesQuery.hasNextPage}
      />
    </GameView>
  );
};

const ExploreGamesPageContent = ({
  state,
}: {
  state: ExploreGamesViewState;
}) => (
  <Stack className={"w-full"}>
    <ExploreGamesFilters state={state} />
    <ExploreGamesResults state={state} />
  </Stack>
);

interface ExploreGamesPageViewProps {
  /** Page-owned state; omitted, the view keeps its own state (default usage). */
  state?: ExploreGamesViewState;
}

const ExploreGamesPageViewInternal = () => {
  const state = useExploreGamesViewState();
  return <ExploreGamesPageContent state={state} />;
};

const ExploreGamesPageView = ({ state }: ExploreGamesPageViewProps = {}) =>
  state ? (
    <ExploreGamesPageContent state={state} />
  ) : (
    <ExploreGamesPageViewInternal />
  );

export {
  ExploreGamesFilters,
  ExploreGamesPageView,
  ExploreGamesResults,
  useExploreGamesViewState,
};
export type { ExploreGamesViewState };
