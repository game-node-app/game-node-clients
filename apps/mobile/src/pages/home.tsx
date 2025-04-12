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
import { ActionIcon, Box, Container, Image, Stack } from "@mantine/core";
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
      <IonContent ref={contentRef} fullscreen>
        <IonRefresher
          slot={"fixed"}
          onIonRefresh={async (evt) => {
            const promises: Promise<unknown>[] = [];
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["recommendation"],
              }),
            );
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["activities"],
              }),
            );
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["comments"],
              }),
            );
            promises.push(
              queryClient.invalidateQueries({
                queryKey: ["posts", "feed"],
              }),
            );

            await Promise.all(promises);

            evt.detail.complete();
          }}
        >
          <IonRefresherContent />
        </IonRefresher>
        <HomeFab contentRef={contentRef} />
        <Container fluid className={"w-full my-4"}>
          <SearchBar
            className={"my-3"}
            label={"Search for games"}
            onClick={() => {
              router.push(getTabAwareHref("/search"));
            }}
            onChange={() => {}}
            value={""}
            withButton={false}
          />

          <Stack className={"w-full gap-8"}>
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

            <DetailsBox
              title={"Activity from our users"}
              stackProps={{
                className: "",
              }}
            >
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
          </Stack>
        </Container>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
