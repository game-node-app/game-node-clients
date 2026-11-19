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

const ExploreGamesPageView = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState(period.MONTH);
  const [selection, setSelection] = useState<"overview" | "overall" | number>(
    "overview",
  );
  const isOverview = selection === "overview";
  const selectedGenreId = typeof selection === "number" ? selection : undefined;

  const SELECT_PERIOD_DATA = useMemo(
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
      {
        label: t("explore.periods.year"),
        value: period.YEAR,
      },
      {
        label: t("explore.periods.allTime"),
        value: period.ALL,
      },
    ],
    [t],
  );

  const { data: genresResource } = useGamesResource("genres");
  const genres = useMemo(
    () =>
      TRENDING_GENRE_IDS.map((id) => {
        const genre = genresResource?.find((item) => item.id === id);
        return genre?.name ? { id, name: genre.name } : undefined;
      }).filter((genre) => genre !== undefined),
    [genresResource],
  );

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

  const onSelectGenre = (genreId: number | undefined) => {
    setSelection(genreId ?? "overview");
  };

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

  const periodSelectOptions = useMemo(() => {
    return SELECT_PERIOD_DATA.map((option) => {
      return (
        <IonSelectOption key={option.value} value={option.value}>
          {option.label}
        </IonSelectOption>
      );
    });
  }, [SELECT_PERIOD_DATA]);

  const isFetching = trendingGamesQuery.isFetching || gamesQuery.isFetching;
  const games = gamesIds
    ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
    .filter((game) => game !== undefined);
  const hasError = trendingGamesQuery.isError || gamesQuery.isError;

  return (
    <Stack className={"w-full"}>
      <Flex className={"w-full justify-end"}>
        <IonSelect
          label={t("explore.filters.trendingIn")}
          interface="action-sheet"
          placeholder={t("explore.placeholders.selectPeriod")}
          onIonChange={(evt) => setSelectedPeriod(evt.detail.value)}
          value={selectedPeriod}
        >
          {periodSelectOptions}
        </IonSelect>
      </Flex>
      <TrendingGenreChips
        genres={genres}
        selectedGenreId={selectedGenreId}
        onSelect={onSelectGenre}
      />
      {isOverview ? (
        <Stack gap={"lg"} className={"w-full"}>
          <TrendingShelf
            ranked
            title={t("explore.sections.topOverall")}
            period={selectedPeriod}
            onSeeAll={() => setSelection("overall")}
          />
          {genres.map((genre) => (
            <TrendingShelf
              key={genre.id}
              title={genre.name}
              genreId={genre.id}
              period={selectedPeriod}
              onSeeAll={() => onSelectGenre(genre.id)}
            />
          ))}
        </Stack>
      ) : (
        <GameView layout={"grid"}>
          {hasError && (
            <CenteredErrorMessage message={t("explore.fetchError")} />
          )}
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
      )}
    </Stack>
  );
};

export { ExploreGamesPageView };
