import React, { useMemo, useState } from "react";
import { Center, FocusTrap, Group, Stack, Text } from "@mantine/core";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import {
  buildGameCategoryFilters,
  buildGameSearchRequestDto,
  GameSearchRequestBuilderValues,
  GameSearchTips,
  GameSearchViewActions,
  GameView,
  GameViewLayoutOption,
  SimpleInfiniteLoader,
  TGameOrSearchGame,
  useInfiniteSearchGames,
  useUrlState,
} from "@repo/ui";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { getErrorMessage } from "@/util/getErrorMessage";
import { useDebouncedValue } from "@mantine/hooks";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

const GameSearchPage = () => {
  const [searchParams, setSearchParams] = useUrlState(
    {
      query: "",
      includeExtraContent: false,
    },
    {
      replace: true,
    },
  );

  const { includeExtraContent, query } = searchParams;

  const [debouncedQuery] = useDebouncedValue(query ?? "", 300);

  const [layout, setLayout] = useState<GameViewLayoutOption>("grid");

  const isQueryEnabled =
    searchParams.query != undefined && searchParams.query.length >= 3;

  const { data, hasNextPage, fetchNextPage, isFetching, isError, error } =
    useInfiniteSearchGames(
      {
        query: debouncedQuery,
        category: buildGameCategoryFilters({
          includeDlcs: includeExtraContent,
          includeExtraContent: includeExtraContent,
        }),
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
            <GameSearchViewActions
              includeExtraContent={includeExtraContent}
              onExtraContentChange={(value) =>
                setSearchParams({ includeExtraContent: value })
              }
              onLayoutChange={setLayout}
            />
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
                <SimpleInfiniteLoader
                  fetchNextPage={async () => {
                    if (isFetching) return;
                    await fetchNextPage();
                  }}
                  isFetching={isFetching}
                  hasNextPage={hasNextPage}
                />
              </>
            )}
          </GameView>
        </Stack>
      </ScrollableIonContent>
    </IonPage>
  );
};

export default GameSearchPage;
