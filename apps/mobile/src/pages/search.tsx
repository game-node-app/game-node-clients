import React, { useEffect, useMemo, useState } from "react";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import {
  Center,
  Chip,
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
  useUrlState,
} from "@repo/ui";
import { useDebouncedValue } from "@mantine/hooks";

const GameSearchPage = () => {
  const params = useSearchParameters();

  const [query, setQuery] = useState("");

  const [searchParameters, setSearchParameters] = useUrlState({
    query: "",
    includeDlcs: false,
    includeExtraContent: false,
  });

  const [delayedQuery] = useDebouncedValue(query, 300);

  const [layout, setLayout] = useState<GameViewLayoutOption>("grid");

  const isQueryEnabled =
    searchParameters.query != undefined && searchParameters.query.length >= 3;

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
      ...buildGameSearchRequestDto(searchParameters),
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
              value={searchParameters.query}
              onIonInput={(e) => {
                setSearchParameters({
                  ...searchParameters,
                  query: e.detail.value!,
                });
              }}
            />
          </FocusTrap>
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>
        <Stack className={"w-full min-h-96 mb-8"}>
          <Group className="flex-nowrap overflow-x-auto pb-4">
            <Chip
              checked={searchParameters.includeDlcs}
              onChange={() => {
                setSearchParameters({
                  ...searchParameters,
                  includeDlcs: !searchParameters.includeDlcs,
                });
              }}
            >
              include DLCs/Expansions
            </Chip>
            <Chip
              checked={searchParameters.includeExtraContent}
              onChange={() => {
                setSearchParameters({
                  ...searchParameters,
                  includeExtraContent: !searchParameters.includeExtraContent,
                });
              }}
            >
              Include Bundles/Updates/Extra
            </Chip>
          </Group>

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
