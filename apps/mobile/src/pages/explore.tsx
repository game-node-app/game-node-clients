import { ExploreGamesPageView } from "@/components/explore/ExploreGamesPageView";
import { useTranslation } from "@repo/locales";
import { AppPage } from "@/components/general/AppPage.tsx";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { useQueryClient } from "@tanstack/react-query";

const ExplorePage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return (
    <AppPage title={t("navigation.explore")} withMenuButton>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          await queryClient.resetQueries({
            queryKey: ["statistics", "trending", "game"],
            type: "active",
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
