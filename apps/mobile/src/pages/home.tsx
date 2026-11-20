import { useUserId } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage.tsx";
import { HomeActivityShelf } from "@/components/home/HomeActivityShelf";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  BackToTopButton,
  buildPresenterComponent,
  HomeEventsSection,
  HomeView,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  ReleaseStrip,
  TrendingGamesList,
  TrendingReviewCarousel,
} from "@repo/ui";
import { Activity } from "@repo/wrapper/server";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import ActivityType = Activity.type;

const HomeViewPresenter = buildPresenterComponent("HomeView", HomeView);
const RecentBlogPostsPresenter = buildPresenterComponent(
  "RecentBlogPostsCarousel",
  RecentBlogPostsCarousel,
);
const HomeReleasesPresenter = buildPresenterComponent(
  "HomeReleases",
  ReleaseStrip,
);

const HomePage = () => {
  const { t } = useTranslation();
  const contentRef =
    useRef<
      import("react").ComponentRef<typeof import("@ionic/react").IonContent>
    >(null);

  const queryClient = useQueryClient();

  const userId = useUserId();

  const eventsSection = <HomeEventsSection />;
  const recentActivityShelf = (
    <HomeActivityShelf
      title={t("home.recentActivity")}
      seeMoreHref={"/activity"}
    />
  );
  const lastReviewsShelf = (
    <HomeActivityShelf
      title={t("home.lastReviews")}
      type={ActivityType.REVIEW}
    />
  );
  // The console home renders its own rows/releases/blog, so only the sections
  // it does not replace are passed through as extras.
  const platformExtras = (
    <>
      {eventsSection}
      {recentActivityShelf}
      {lastReviewsShelf}
    </>
  );

  return (
    <AppPage
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
      <HomeViewPresenter extras={platformExtras}>
        <Stack className={"w-full gap-8 my-4"}>
          {eventsSection}
          {userId && <RecommendationCarousel criteria={"finished"} />}
          <TrendingGamesList />
          <TrendingReviewCarousel
            slideSize={210}
            height={260}
            withIndicators={false}
            withControls={false}
          />
          <RecentBlogPostsPresenter />
          {recentActivityShelf}
          {lastReviewsShelf}
          <HomeReleasesPresenter />
        </Stack>
      </HomeViewPresenter>
    </AppPage>
  );
};

export default HomePage;
