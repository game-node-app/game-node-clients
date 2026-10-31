import { IonSelect, IonSelectOption } from "@ionic/react";
import { Flex, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  GameView,
  InfiniteQueryTrendingGamesDto,
  SimpleInfiniteLoader,
  useGames,
  useInfiniteTrendingGames,
} from "@repo/ui";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { useMemo, useState } from "react";

import period = StatisticsRankingsRequestDto.period;

const DEFAULT_LIMIT = 48;

const ExploreGamesPageView = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState(period.MONTH);

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

  const [trendingQueryDto, setTrendingQueryDto] =
    useState<InfiniteQueryTrendingGamesDto>({
      period: selectedPeriod,
      limit: DEFAULT_LIMIT,
    });

  const trendingGamesQuery = useInfiniteTrendingGames(trendingQueryDto);

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

  return (
    <Stack className={"w-full"}>
      <Flex className={"w-full justify-end"}>
        <IonSelect
          label={t("explore.filters.trendingIn")}
          interface="action-sheet"
          placeholder={t("explore.placeholders.selectPeriod")}
          onIonChange={(evt) => {
            setSelectedPeriod(evt.detail.value);
            setTrendingQueryDto((prev) => ({
              ...prev,
              period: evt.detail.value,
            }));
          }}
          value={selectedPeriod}
        >
          {periodSelectOptions}
        </IonSelect>
      </Flex>
      <GameView layout={"grid"}>
        <GameView.Content
          items={gamesIds
            ?.map((id) => gamesQuery.data?.find((game) => game.id === id))
            .filter((game) => game !== undefined)}
        >
          <GameView.LoadingSkeletons isVisible={isFetching} />
        </GameView.Content>
        <SimpleInfiniteLoader
          key={gamesQuery.data?.map((game) => game.id).join(",")}
          fetchNextPage={async () => {
            if (isFetching) return;
            await trendingGamesQuery.fetchNextPage();
          }}
          isFetching={isFetching}
          hasNextPage={trendingGamesQuery.hasNextPage}
        />
      </GameView>
    </Stack>
  );
};

export { ExploreGamesPageView };