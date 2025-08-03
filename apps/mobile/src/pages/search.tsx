import React, { useEffect, useMemo, useState } from "react";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import {
  Center,
  Container,
  FocusTrap,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import GameView, {
  GameViewLayoutOption,
} from "@/components/game/view/GameView";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonToolbar,
} from "@ionic/react";
import { useInfiniteSearchGames } from "@/components/game/hooks/useInfiniteSearchGames";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { getErrorMessage } from "@/util/getErrorMessage";
import {
  GameSearchTips,
  TGameOrSearchGame,
  buildGameSearchRequestDto,
} from "@repo/ui";
import { useDebouncedValue } from "@mantine/hooks";

const GameSearchPage = () => {
  const params = useSearchParameters();

  const [query, setQuery] = useState("");

  const [delayedQuery] = useDebouncedValue(query, 300);

  const [layout, setLayout] = useState<GameViewLayoutOption>("grid");

  const isQueryEnabled = delayedQuery != undefined && delayedQuery.length >= 3;

  const {
    data,
    isFetching,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
  } = useInfiniteSearchGames(
    {
      ...buildGameSearchRequestDto({
        query: delayedQuery,
        includeDlcs: false,
        includeExtraContent: false,
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

  useEffect(() => {
    const urlQuery = params.get("q");
    if (urlQuery && urlQuery.length >= 3) {
      setQuery(urlQuery);
    }
  }, [params]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <FocusTrap>
            <IonSearchbar
              value={query}
              onIonInput={(e) => setQuery(e.detail.value!)}
            />
          </FocusTrap>
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>
        <Stack className={"w-full min-h-96 mb-8"}>
          <GameSearchTips />
          {isError && <CenteredErrorMessage message={getErrorMessage(error)} />}
          {!isQueryEnabled ? (
            <Center>
              <Text>Start typing to see results.</Text>
            </Center>
          ) : (
            <GameView layout={layout}>
              <Group className={"w-full justify-end"}>
                <GameView.LayoutSwitcher setLayout={setLayout} />
              </Group>
              <GameView.Content
                items={items}
                isLoading={isLoading}
                isFetching={isFetching}
                hasNextPage={hasNextPage}
                onLoadMore={() => {
                  if (!isFetching && !isLoading) {
                    fetchNextPage();
                  }
                }}
              ></GameView.Content>
            </GameView>
          )}
        </Stack>
      </IonContent>
    </IonPage>
  );
};

export default GameSearchPage;
