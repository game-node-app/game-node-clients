import React, { useState } from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
} from "@ionic/react";
import { Container } from "@mantine/core";
import {
  ActivityFeed,
  ActivityFeedTabValue,
  InfiniteLoaderProps,
} from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

const ActivityPage = () => {
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
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className={"ion-padding"}>
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
