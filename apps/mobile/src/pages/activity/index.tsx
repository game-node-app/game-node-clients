import React, { useState } from "react";
import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import {
  ActivityFeed,
  ActivityFeedLayout,
  ActivityFeedTabValue,
  InfiniteLoaderProps,
} from "@repo/ui";
import { Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";

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
