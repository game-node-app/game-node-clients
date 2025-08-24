import React, { useMemo, useState } from "react";
import { Center, FocusTrap, Group, Stack, Text } from "@mantine/core";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import { useInfiniteSearchGames } from "@/components/game/hooks/useInfiniteSearchGames";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { getErrorMessage } from "@/util/getErrorMessage";
import {
  buildGameSearchRequestDto,
  GameSearchFilters,
  GameSearchRequestBuilderValues,
  GameSearchTips,
  GameView,
  GameViewLayoutOption,
  TGameOrSearchGame,
  useUrlState,
} from "@repo/ui";
import { useDebouncedValue } from "@mantine/hooks";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

const GameSearchPage = () => {
  const [searchParams, setSearchParams] =
    useUrlState<GameSearchRequestBuilderValues>(
      {
        query: "",
        includeExtraContent: false,
        includeDlcs: false,
      },
      {
        replace: true,
      },
    );

  const [debouncedParams] = useDebouncedValue(searchParams, 300);

  const [layout, setLayout] = useState<GameViewLayoutOption>("grid");

  const isQueryEnabled =
    searchParams.query != undefined && searchParams.query.length >= 3;

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isError,
    error,
  } = useInfiniteSearchGames(
    {
      ...buildGameSearchRequestDto(debouncedParams),
      limit: 12,
    },
    isQueryEnabled,
  );

  const items = useMemo(() => {
    return data?.pages
      ?.flatMap((page) => page.data?.items)
      .filter((item) => item != undefined) as TGameOrSearchGame[] | undefined;
  }, [data]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <FocusTrap>
            <IonSearchbar
              value={searchParams.query}
              onIonInput={(e) => {
                setSearchParams((prev) => ({
                  ...prev,
                  query: e.detail.value!,
                }));
              }}
            />
          </FocusTrap>
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
        <Stack className={"w-full min-h-96 mb-8"}>
          <GameView layout={layout}>
            <Group className={"w-full flex-nowrap"}>
              <GameView.LayoutSwitcher mode={"chip"} setLayout={setLayout} />
            </Group>
            <GameSearchTips />
            {isError && (
              <CenteredErrorMessage message={getErrorMessage(error)} />
            )}
            {!isQueryEnabled ? (
              <Center>
                <Text>Start typing to see results.</Text>
              </Center>
            ) : (
              <>
                <GameView.Content items={items}>
                  <GameView.LoadingSkeletons isVisible={isFetching} />
                </GameView.Content>
                <IonInfiniteScroll
                  disabled={!hasNextPage}
                  onIonInfinite={async (evt) => {
                    await fetchNextPage();
                    await evt.target.complete();
                  }}
                >
                  <IonInfiniteScrollContent
                    loadingText={"Fetching more games..."}
                  />
                </IonInfiniteScroll>
              </>
            )}
          </GameView>
        </Stack>
      </ScrollableIonContent>
    </IonPage>
  );
};

export default GameSearchPage;
