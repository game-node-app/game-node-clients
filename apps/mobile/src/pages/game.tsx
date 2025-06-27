import React, { useEffect, useMemo, useRef } from "react";
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
import { Container, Stack } from "@mantine/core";
import { GameInfoViewFab } from "@/components/game/info/fab/GameInfoViewFab";
import {
  CenteredLoading,
  DEFAULT_GAME_INFO_VIEW_DTO,
  GameExtraInfoView,
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

  const content = useMemo(() => {
    if (gameQuery.isLoading) {
      return <CenteredLoading />;
    }

    return (
      <>
        <GameInfoViewFab gameId={gameId} />
        <Stack className={"w-full min-h-screen my-4"}>
          <GameInfoView id={gameId} withActions={false} />
          <GameInfoReviewScreen gameId={gameId} />
          <GameExtraInfoView id={gameId} />
        </Stack>
      </>
    );
  }, [gameId, gameQuery.isLoading]);

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
