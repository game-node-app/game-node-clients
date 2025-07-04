import React, { useEffect, useMemo, useRef, useState } from "react";
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
  useUserView,
} from "@repo/ui";
import GameInfoReviewScreen from "@/components/game/info/review/GameInfoReviewScreen";
import { FindOneStatisticsDto } from "@repo/wrapper/server";

interface Props {
  gameId: number;
}

const GamePage = ({ gameId }: Props) => {
  const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);

  const [currentTab, setCurrentTab] = useState<GameInfoTabValue>(
    GameInfoTabValue.overview,
  );

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
    setCurrentTab(tab);
  };

  const onGoBack = () => onChange(GameInfoTabValue.overview);

  const content = useMemo(() => {
    if (gameQuery.isLoading) {
      return <CenteredLoading />;
    }

    return (
      <>
        <GameInfoViewFab gameId={gameId} />
        <GameInfoView id={gameId} />
        <GameInfoTabs currentTab={currentTab} onChange={onChange}>
          <Tabs.Panel value={GameInfoTabValue.overview}>
            <Box className={"w-full mt-4 mb-6"}>
              <GameExtraInfoView id={gameId} />
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
      </>
    );
  }, [currentTab, gameId, gameQuery.isLoading, onGoBack]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>{gameQuery.data?.name}</IonTitle>
          {gameQuery.isLoading && <IonProgressBar type="indeterminate" />}
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>{content}</IonContent>
    </IonPage>
  );
};

export default GamePage;
