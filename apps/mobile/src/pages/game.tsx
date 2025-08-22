import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Box, Stack, Tabs } from "@mantine/core";
import { GameInfoViewFab } from "@/components/game/info/fab/GameInfoViewFab";
import {
  CenteredLoading,
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameExtraInfoView,
  GameInfoAchievementsScreen,
  GameInfoContentTitle,
  GameInfoPostsScreen,
  GameInfoTabs,
  GameInfoTabValue,
  GameInfoView,
  useGame,
  useUrlState,
  useUserView,
} from "@repo/ui";
import GameInfoReviewScreen from "@/components/game/info/review/GameInfoReviewScreen";
import { FindOneStatisticsDto } from "@repo/wrapper/server";
import { useHistory } from "react-router-dom";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

interface Props {
  gameId: number;
}

const GamePage = ({ gameId }: Props) => {
  const router = useHistory();
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);

  const [params, setParams] = useUrlState({
    tab: GameInfoTabValue.overview,
  });

  const currentTab = params.tab;

  const [, , incrementView] = useUserView(
    gameId,
    FindOneStatisticsDto.sourceType.GAME,
  );

  /**
   * Stores the path parameter "id" of the last registered game view.
   */
  const lastRegisteredGameView = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (gameId != undefined && lastRegisteredGameView.current !== gameId) {
      incrementView();
      lastRegisteredGameView.current = gameId;
    }
  }, [gameId, incrementView]);

  const onChange = (tab: GameInfoTabValue) => {
    setParams({
      tab,
    });
  };

  const onGoBack = () => {
    onChange(GameInfoTabValue.overview);
  };

  if (gameQuery.isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot={"start"}>
              <IonBackButton />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent></IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>{gameQuery.data?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
        <GameInfoViewFab gameId={gameId} />
        <GameInfoView id={gameId} withActions={false} />
        <GameInfoTabs currentTab={currentTab} onChange={onChange}>
          <Tabs.Panel value={GameInfoTabValue.overview}>
            <Box className={"w-full mt-4 mb-6"}>
              <GameExtraInfoView gameId={gameId} />
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.reviews}>
            <Stack className={"w-full h-full gap-xl mt-4 mb-6"}>
              <GameInfoContentTitle title={"Reviews"} onGoBack={onGoBack} />
              <GameInfoReviewScreen gameId={gameId} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.discussion}>
            <Stack className={"w-full h-full gap-xl mt-4 mb-6"}>
              <GameInfoContentTitle title={"Discussion"} onGoBack={onGoBack} />
              <GameInfoPostsScreen gameId={gameId} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value={GameInfoTabValue.achievements}>
            <Stack className={"w-full h-full gap-sm mt-4 mb-6"}>
              <GameInfoContentTitle
                title={"Achievements"}
                onGoBack={onGoBack}
              />
              <GameInfoAchievementsScreen gameId={gameId} />
            </Stack>
          </Tabs.Panel>
        </GameInfoTabs>
      </ScrollableIonContent>
    </IonPage>
  );
};

export default GamePage;
