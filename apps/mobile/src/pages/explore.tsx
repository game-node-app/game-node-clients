import React from "react";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { ExploreGamesPageView } from "@/components/explore/ExploreGamesPageView";
import { useQueryClient } from "@tanstack/react-query";
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
