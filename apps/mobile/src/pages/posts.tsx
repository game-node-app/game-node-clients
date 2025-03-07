import React, { useRef, useState } from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useQueryClient } from "@tanstack/react-query";
import { Container } from "@mantine/core";
import {
  InfiniteLoaderProps,
  PostsFeed,
  PostsFeedLayout,
  PostsFeedTabValue,
} from "@repo/ui";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters.ts";

const PostsPage = () => {
  const params = useSearchParameters();
  const postId = params.get("postId") as string | undefined;

  const contentRef = useRef<HTMLIonContentElement>(null);
  const [currentTab, setCurrentTab] = useState<PostsFeedTabValue>("all");

  const queryClient = useQueryClient();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Posts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        <IonRefresher
          slot={"fixed"}
          onIonRefresh={async (evt) => {
            await queryClient.invalidateQueries({
              queryKey: ["posts", "feed"],
            });
            evt.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <Container fluid className={"w-full my-4"}>
          <PostsFeedLayout currentTab={currentTab} onChange={setCurrentTab}>
            <PostsFeed criteria={currentTab} targetedPostId={postId}>
              {({ fetchNextPage, hasNextPage }: InfiniteLoaderProps) => (
                <IonInfiniteScroll
                  disabled={!hasNextPage}
                  onIonInfinite={async (evt) => {
                    await fetchNextPage();
                    await evt.target.complete();
                  }}
                >
                  <IonInfiniteScrollContent />
                </IonInfiniteScroll>
              )}
            </PostsFeed>
          </PostsFeedLayout>
        </Container>
      </IonContent>
    </IonPage>
  );
};

export { PostsPage };
