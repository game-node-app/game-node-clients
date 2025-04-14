import React from "react";
import {
  GamePostEditor,
  InfiniteLoaderProps,
  Modal,
  PostsFeed,
} from "@repo/ui";
import {
  IonFab,
  IonFabButton,
  IonFabList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import { useDisclosure } from "@mantine/hooks";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IconArrowUp, IconMessage2Share, IconPlus } from "@tabler/icons-react";

const ExplorePostsPageView = () => {
  return (
    <>
      <PostsFeed criteria={"all"}>
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
      </PostsFeed>
    </>
  );
};

export { ExplorePostsPageView };
