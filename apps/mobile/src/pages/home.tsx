import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonToolbar,
} from "@ionic/react";
import React, { useRef, useState } from "react";
import { Container, Image, Stack, Title } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import { useQueryClient } from "@tanstack/react-query";
import {
  BackToTopButton,
  DetailsBox,
  InfiniteLoaderProps,
  PostsFeed,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecentlyPlayedGamesShare,
  RecommendationCarousel,
  TrendingGamesList,
  TrendingReviewCarousel,
} from "@repo/ui";
import { HomeFab } from "@/components/home/HomeFab.tsx";
import { IconCalendarWeek, IconSearch } from "@tabler/icons-react";
import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { TrendingReviewCard } from "@/components/review/trending/TrendingReviewCard.tsx";

const HomePage = () => {
  const contentRef = useRef<HTMLIonContentElement>(null);

  const queryClient = useQueryClient();

  const userId = useUserId();

  const [wrappedOpened, setWrappedOpened] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <RecentlyPlayedGamesShare
            opened={wrappedOpened}
            onClose={() => {
              setWrappedOpened(false);
            }}
            onShare={async (file) => {
              const base64 = await blobToBase64(file);

              const cachedFileResult = await Filesystem.writeFile({
                path: file.name,
                data: base64,
                directory: Directory.Cache,
              });

              await Share.share({
                title: "This is my GameNode Wrapped!",
                dialogTitle: "Share your wrapped with friends!",
                url: cachedFileResult.uri,
              });
            }}
          />
          <IonButtons slot={"start"}>
            <IonMenuButton />
          </IonButtons>
          <IonButtons slot={"end"}>
            {userId && (
              <IonButton
                className={"text-brand-4"}
                onClick={() => setWrappedOpened(true)}
              >
                <IconCalendarWeek />
              </IonButton>
            )}
            <IonButton routerLink={"/home/search"}>
              <IconSearch />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent
        className={"ion-padding"}
        ref={contentRef}
        fixedSlotPlacement={"before"}
      >
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
        <Stack className={"w-full gap-8 my-4"}>
          {userId && <RecommendationCarousel criteria={"finished"} />}
          <TrendingGamesList />
          <TrendingReviewCarousel
            CardComponent={TrendingReviewCard}
            slideSize={"25%"}
            height={260}
          />
          <RecentBlogPostsCarousel />
          <Stack className={"w-full"}>
            <Title size={"h3"} className={"text-center"}>
              Recent activity
            </Title>
            <RecentActivityList limit={10} />
          </Stack>
          <DetailsBox
            title={"Recent Posts"}
            stackProps={{
              className: "",
            }}
          >
            <PostsFeed criteria={"all"}>
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
          </DetailsBox>
        </Stack>
      </ScrollableIonContent>
    </IonPage>
  );
};

export default HomePage;
