import { cn, useUserId } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage.tsx";
import { HomeActivityShelf } from "@/components/home/HomeActivityShelf";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  BackToTopButton,
  HomeEventsSection,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  ReleaseStrip,
  TrendingGamesList,
  TrendingReviewCarousel,
} from "@repo/ui";
import { Activity } from "@repo/wrapper/server";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRef } from "react";
import ActivityType = Activity.type;

// Entrance animation plays only on the first Home mount after the app opens.
let homeEntrancePlayed = false;

const HomePage = () => {
  const [animateEntrance] = useState(() => !homeEntrancePlayed);
  useEffect(() => {
    homeEntrancePlayed = true;
  }, []);

  const { t } = useTranslation();
  const contentRef =
    useRef<
      import("react").ComponentRef<typeof import("@ionic/react").IonContent>
    >(null);

  const queryClient = useQueryClient();

  const userId = useUserId();

  return (
    <AppPage
      title={t("navigation.home")}
      withMenuButton
      withSearch
      contentProps={{
        ref: contentRef,
        fixedSlotPlacement: "before",
      }}
    >
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          const promises: Promise<unknown>[] = [
            queryClient.invalidateQueries({
              queryKey: ["game", "all", "collectionType"],
            }),
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
            queryClient.invalidateQueries({
              queryKey: ["recap"],
            }),
          ];

          await Promise.all(promises);

          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      {/*<HomeFab contentRef={contentRef} />*/}
      <BackToTopButton />
      <Stack
        className={cn("w-full gap-8 my-4", animateEntrance && "gn-home-enter")}
      >
        <HomeEventsSection />
        {userId && <RecommendationCarousel criteria={"finished"} />}
        <TrendingGamesList />
        <TrendingReviewCarousel
          slideSize={210}
          height={260}
          withIndicators={false}
          withControls={false}
        />
        <RecentBlogPostsCarousel />
        <HomeActivityShelf
          title={t("home.recentActivity")}
          seeMoreHref={"/activity"}
        />
        <HomeActivityShelf
          title={t("home.lastReviews")}
          type={ActivityType.REVIEW}
        />
        <ReleaseStrip />
      </Stack>
    </AppPage>
  );
};

export default HomePage;
