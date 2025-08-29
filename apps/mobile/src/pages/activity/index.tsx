import React, { useState } from "react";
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
} from "@ionic/react";
import {
  ActivityFeed,
  ActivityFeedTabValue,
  InfiniteLoaderProps,
} from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { QueryProgressBar } from "@/components/general/QueryProgressBar.tsx";
import { ActivityItem } from "@/components/activity/ActivityItem.tsx";
import { Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";

const ActivityPage = () => {
  const queryClient = useQueryClient();
  const [selectedActivityTab, setSelectedActivityTab] =
    useState<ActivityFeedTabValue>("all");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonSegment
            value={selectedActivityTab}
            onIonChange={(evt) =>
              setSelectedActivityTab(
                (evt.detail.value as ActivityFeedTabValue) ?? "all",
              )
            }
          >
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="following">
              <IonLabel>Following</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          <QueryProgressBar />
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
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
          Tip: press and hold to show actions.
        </Text>
        <ActivityFeed criteria={selectedActivityTab} Component={ActivityItem}>
          {({ fetchNextPage, hasNextPage }: InfiniteLoaderProps) => (
            <IonInfiniteScroll
              disabled={!hasNextPage}
              onIonInfinite={async (evt) => {
                await fetchNextPage();
                await evt.target.complete();
              }}
            >
              <IonInfiniteScrollContent
                loadingText={"Fetching more activities..."}
              />
            </IonInfiniteScroll>
          )}
        </ActivityFeed>
      </ScrollableIonContent>
    </IonPage>
  );
};

export default ActivityPage;
