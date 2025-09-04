import React from "react";
import {
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { ExploreGamesPageView } from "@/components/explore/ExploreGamesPageView";
import "@/components/explore/explore.css";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { useQueryClient } from "@tanstack/react-query";
import { QueryProgressBar } from "@/components/general/QueryProgressBar.tsx";

const ExplorePage = () => {
  const queryClient = useQueryClient();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Explore</IonTitle>
          <QueryProgressBar />
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
        <IonRefresher
          slot={"fixed"}
          onIonRefresh={async (evt) => {
            await queryClient.invalidateQueries({
              queryKey: ["statistics", "trending", "game"],
            });
            evt.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <ExploreGamesPageView />
      </ScrollableIonContent>
    </IonPage>
  );
};

export default ExplorePage;
