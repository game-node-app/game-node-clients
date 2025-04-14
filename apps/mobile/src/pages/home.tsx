import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import React, { useRef } from "react";
import { Container, Image, Stack } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { useQueryClient } from "@tanstack/react-query";
import {
  DetailsBox,
  HomeFeed,
  InfiniteLoaderProps,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  SearchBar,
  TrendingReviewCarousel,
} from "@repo/ui";
import { HomeFab } from "@/components/home/HomeFab.tsx";
import { IconSearch } from "@tabler/icons-react";

const HomePage = () => {
  const router = useIonRouter();

  const contentRef = useRef<HTMLIonContentElement>(null);

  const queryClient = useQueryClient();

  const userId = useUserId();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <Image src={"/img/short-logo.png"} className={"h-auto w-12 ms-4"} />
          <IonButtons slot={"end"}>
            <IonButton routerLink={"/home/search"}>
              <IconSearch />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        <IonRefresher
          slot={"fixed"}
          onIonRefresh={async (evt) => {
            const promises: Promise<unknown>[] = [
              queryClient.invalidateQueries({
                queryKey: ["recommendation"],
              }),
              queryClient.invalidateQueries({
                queryKey: ["activities"],
              }),
              queryClient.invalidateQueries({
                queryKey: ["comments"],
              }),
              queryClient.invalidateQueries({
                queryKey: ["posts", "feed"],
              }),
              queryClient.invalidateQueries({
                queryKey: ["blog"],
              }),
            ];

            await Promise.all(promises);

            evt.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <HomeFab contentRef={contentRef} />
        <Container fluid className={"w-full flex flex-col gap-8 my-4"}>
          {userId && (
            <RecommendationCarousel
              criteria={"finished"}
              stackProps={{
                className: "",
              }}
            />
          )}
          <TrendingReviewCarousel />

          {userId && (
            <>
              <RecommendationCarousel
                criteria={"theme"}
                stackProps={{
                  className: "",
                }}
              />
              <RecommendationCarousel
                criteria={"genre"}
                stackProps={{
                  className: "",
                }}
              />
            </>
          )}
          <RecentBlogPostsCarousel />

          <DetailsBox title={"Activity from our users"}>
            <HomeFeed>
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
            </HomeFeed>
          </DetailsBox>
        </Container>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
