import { THEMES, useAppTheme, useUserId } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage.tsx";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { SimpleGrid, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  BackToTopButton,
  ConsoleHome,
  DetailsCard,
  DynamicAwardsOverview,
  DynamicRecapOverview,
  HomeReleases,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  TrendingGamesList,
  TrendingReviewCarousel,
} from "@repo/ui";
import { Activity } from "@repo/wrapper/server";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import ActivityType = Activity.type;

const HomePage = () => {
  const { t } = useTranslation();
  const contentRef =
    useRef<
      import("react").ComponentRef<typeof import("@ionic/react").IonContent>
    >(null);

  const queryClient = useQueryClient();

  const userId = useUserId();
  const [theme] = useAppTheme();
  const isConsole = THEMES[theme].layout === "console";

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
      <Stack className={"w-full gap-8 my-4"}>
        {/* console themes show these as ConsoleHome rows */}
        {isConsole && <ConsoleHome />}
        {!isConsole && userId && (
          <RecommendationCarousel criteria={"finished"} />
        )}
        {!isConsole && <TrendingGamesList />}
        {/* console themes show these as ConsoleReviewRow */}
        {!isConsole && (
          <TrendingReviewCarousel
            slideSize={210}
            height={260}
            withIndicators={false}
            withControls={false}
          />
        )}
        <DynamicAwardsOverview />
        <DynamicRecapOverview />
        <RecentBlogPostsCarousel />
        <SimpleGrid cols={{ base: 1, xs: 2 }} className={"w-full"}>
          <DetailsCard title={t("home.recentActivity")}>
            <RecentActivityList limit={10} />
          </DetailsCard>
          <DetailsCard title={t("home.lastReviews")}>
            <RecentActivityList limit={10} type={ActivityType.REVIEW} />
          </DetailsCard>
        </SimpleGrid>
        <HomeReleases />
      </Stack>
    </AppPage>
  );
};

export default HomePage;
