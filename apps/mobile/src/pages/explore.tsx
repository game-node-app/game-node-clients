import { useTranslation } from "@repo/locales";
import { AppPage } from "@/components/general/AppPage.tsx";
import { ExploreView, type ExploreViewValue } from "@repo/ui";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { useQueryClient } from "@tanstack/react-query";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { useState } from "react";

const ExplorePage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [value, setValue] = useState<ExploreViewValue>({
    period: StatisticsRankingsRequestDto.period.MONTH,
  });

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
      <ExploreView value={value} onChange={setValue} />
    </AppPage>
  );
};

export default ExplorePage;
