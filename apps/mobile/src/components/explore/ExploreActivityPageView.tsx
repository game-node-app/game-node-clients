import React from "react";
import { ActivityFeed, InfiniteLoaderProps } from "@repo/ui";
import { IonInfiniteScroll, IonInfiniteScrollContent } from "@ionic/react";

const ExploreActivityPageView = () => {
  return (
    <ActivityFeed criteria={"all"}>
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
  );
};

export { ExploreActivityPageView };
