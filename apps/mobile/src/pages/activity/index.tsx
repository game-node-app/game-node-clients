import { AppPage } from "@/components/general/AppPage";
import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  ActivityFeed,
  ActivityFeedLayout,
  ActivityFeedTabValue,
  InfiniteLoaderProps,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const ActivityPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedActivityTab, setSelectedActivityTab] =
    useState<ActivityFeedTabValue>("all");

  return (
    <AppPage withSearch>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          const promises = [
            queryClient.invalidateQueries({
              queryKey: ["activities"],
            }),
          ];
          await Promise.all(promises);
          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <Text className={"text-sm text-dimmed mb-2"}>
        {t("mobile.activity.tip")}
      </Text>
      <ActivityFeedLayout
        currentTab={selectedActivityTab}
        onChange={setSelectedActivityTab}
      >
        <ActivityFeed criteria={selectedActivityTab}>
          {({ fetchNextPage, hasNextPage }: InfiniteLoaderProps) => (
            <IonInfiniteScroll
              disabled={!hasNextPage}
              onIonInfinite={async (evt) => {
                await fetchNextPage();
                await evt.target.complete();
              }}
            >
              <IonInfiniteScrollContent
                loadingText={t("mobile.activity.loadingMore")}
              />
            </IonInfiniteScroll>
          )}
        </ActivityFeed>
      </ActivityFeedLayout>
    </AppPage>
  );
};

export default ActivityPage;