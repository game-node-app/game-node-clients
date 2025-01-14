import { Container, Flex, Stack } from "@mantine/core";
import React, { useMemo, useState } from "react";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    useIonRouter,
} from "@ionic/react";
import { FindStatisticsTrendingGamesDto, GameStatisticsPaginatedResponseDto } from "@/wrapper/server";
import GameView from "@/components/game/view/GameView";
import { useInfiniteTrendingGames } from "@/components/statistics/hooks/useInfiniteTrendingGames";
import { useGames } from "@/components/game/hooks/useGames";
import { getTabAwareHref } from "@/util/getTabAwareHref";
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

const ExplorePage = () => {
    const router = useIonRouter();

    const pathname = router.routeInfo.pathname;

    const isInTab = pathname.split("/").length === 2;

    const [query, setQuery] = useState("");

    const [selectedPeriod, setSelectedPeriod] = useState(period.MONTH);

    const [trendingQueryDto, setTrendingQueryDto] = useState<FindStatisticsTrendingGamesDto>({
        period: selectedPeriod,
        limit: DEFAULT_LIMIT,
    });

    const trendingGamesQuery = useInfiniteTrendingGames(trendingQueryDto);

    const gamesIds = useMemo(() => {
        if (trendingGamesQuery.isError || trendingGamesQuery.data == undefined) return undefined;
        return trendingGamesQuery.data?.pages.flatMap(
            (statisticsPaginatedResponse: GameStatisticsPaginatedResponseDto) => {
                return statisticsPaginatedResponse.data.map((statistics) => statistics.gameId!);
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

    return (
        <IonPage>
            <IonHeader>
                {isInTab ? null : (
                    <IonToolbar>
                        <IonButtons>
                            <IonBackButton />
                        </IonButtons>
                        <IonTitle>Explore</IonTitle>
                    </IonToolbar>
                )}
                <IonToolbar>
                    <IonSearchbar
                        type={"text"}
                        animated={true}
                        placeholder="Search for games"
                        value={query}
                        onIonInput={(evt) => {
                            setQuery(evt.detail.value ?? "");
                        }}
                        onIonChange={(evt) => {
                            setQuery(evt.detail.value ?? "");
                            if (evt.detail.value && evt.detail.value.length >= 3) {
                                router.push(getTabAwareHref(`/search_results?q=${query}`));
                            }
                        }}
                    />
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container fluid className={"min-h-screen my-4"}>
                    <Stack className={"w-full"}>
                        <Flex className={"w-full justify-end"}>
                            <IonSelect
                                label={"Trending in"}
                                interface="action-sheet"
                                placeholder="Select period"
                                onIonChange={(evt) => {
                                    setSelectedPeriod(evt.detail.value);
                                    setTrendingQueryDto((prev) => ({ ...prev, period: evt.detail.value }));
                                }}
                                value={selectedPeriod}
                            >
                                {periodSelectOptions}
                            </IonSelect>
                        </Flex>
                        <GameView layout={"grid"}>
                            <GameView.Content
                                items={gamesQuery.data}
                                // This enables a loading spinner at the top
                                isLoading={trendingGamesQuery.isLoading || gamesQuery.isLoading}
                                isFetching={trendingGamesQuery.isFetching || gamesQuery.isFetching}
                                hasNextPage={trendingGamesQuery.hasNextPage}
                                onLoadMore={async () => {
                                    if (
                                        trendingGamesQuery.isFetching ||
                                        gamesQuery.isLoading ||
                                        gamesQuery.isFetching
                                    ) {
                                        return;
                                    }

                                    await trendingGamesQuery.fetchNextPage();
                                }}
                            />
                        </GameView>
                    </Stack>
                </Container>
            </IonContent>
        </IonPage>
    );
};

export default ExplorePage;
