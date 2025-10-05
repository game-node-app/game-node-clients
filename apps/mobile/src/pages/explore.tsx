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
import { AppPage } from "@/components/general/AppPage.tsx";

const ExplorePage = () => {
  const queryClient = useQueryClient();

  return (
    <AppPage withMenuButton>
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
    </AppPage>
  );
};

export default ExplorePage;
