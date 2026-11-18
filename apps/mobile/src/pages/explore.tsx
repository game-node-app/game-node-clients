import { ExploreGamesPageView } from "@/components/explore/ExploreGamesPageView";
import { AppPage } from "@/components/general/AppPage.tsx";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { SessionAuth } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";

const ExplorePage = () => {
  const queryClient = useQueryClient();

  return (
    <AppPage withMenuButton>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          await queryClient.resetQueries({
            queryKey: ["statistics", "trending", "game", "infinite"],
            type: "active",
          });
          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <SessionAuth>
        <ExploreGamesPageView />
      </SessionAuth>
    </AppPage>
  );
};

export default ExplorePage;
