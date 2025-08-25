import React, { useMemo, useState } from "react";
import { Flex, Stack } from "@mantine/core";
import { IonSelect, IonSelectOption } from "@ionic/react";
import {
  FindStatisticsTrendingGamesDto,
  GameStatisticsPaginatedResponseDto,
} from "@repo/wrapper/server";
import {
  GameView,
  SimpleInfiniteLoader,
  useGames,
  useInfiniteTrendingGames,
} from "@repo/ui";

import period = FindStatisticsTrendingGamesDto.period;

const SELECT_PERIOD_DATA = [
  { label: "Week", value: period.WEEK },
  { label: "Month", value: period.MONTH },
  {
    label: "3 months",
    value: period.QUARTER,
  },
  {
    label: "6 months",
    value: period.HALF_YEAR,
  },
  {
    label: "Year",
    value: period.YEAR,
  },
  {
    label: "All time",
    value: period.ALL,
  },
];

const DEFAULT_LIMIT = 48;

const ExploreGamesPageView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(period.MONTH);

  const [trendingQueryDto, setTrendingQueryDto] =
    useState<FindStatisticsTrendingGamesDto>({
      period: selectedPeriod,
      limit: DEFAULT_LIMIT,
    });

  const trendingGamesQuery = useInfiniteTrendingGames(trendingQueryDto);

  const gamesIds = useMemo(() => {
    if (trendingGamesQuery.isError || trendingGamesQuery.data == undefined)
      return undefined;
    return trendingGamesQuery.data?.pages.flatMap(
      (statisticsPaginatedResponse: GameStatisticsPaginatedResponseDto) => {
        return statisticsPaginatedResponse.data.map(
          (statistics) => statistics.gameId!,
        );
      },
    );
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
  }, []);

  const isLoading = trendingGamesQuery.isLoading || gamesQuery.isLoading;
  const isFetching = trendingGamesQuery.isFetching || gamesQuery.isFetching;

  return (
    <Stack className={"w-full"}>
      <Flex className={"w-full justify-end"}>
        <IonSelect
          label={"Trending in"}
          interface="action-sheet"
          placeholder="Select period"
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
        <GameView.Content items={gamesQuery.data}>
          <GameView.LoadingSkeletons isVisible={isFetching} />
        </GameView.Content>
        <SimpleInfiniteLoader
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
