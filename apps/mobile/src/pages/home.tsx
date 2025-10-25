import {
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import React, { useRef } from "react";
import { Button, SimpleGrid, Stack, Title } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import { useQueryClient } from "@tanstack/react-query";
import {
  DetailsBox,
  DynamicAwardsOverview,
  InfiniteLoaderProps,
  Period,
  PostsFeed,
  ProfileStatsForPeriod,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  TrendingGamesList,
  TrendingReviewCarousel,
  UserRecentStatsReport,
} from "@repo/ui";
import { HomeFab } from "@/components/home/HomeFab.tsx";
import { AppPage } from "@/components/general/AppPage.tsx";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";

const HomePage = () => {
  const contentRef = useRef<HTMLIonContentElement>(null);

  const queryClient = useQueryClient();

  const userId = useUserId();

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
        <UserRecentStatsReport />
        <TrendingReviewCarousel
          slideSize={210}
          height={260}
          withIndicators={false}
          withControls={false}
        />
        <DynamicAwardsOverview />
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
          <PostsFeed criteria={"all"} hardLimit={5}>
            {({ fetchNextPage, hasNextPage }: InfiniteLoaderProps) => (
              <Stack className={"items-center"}>
                <Link to={getTabAwareHref("/posts")} className={"w-2/4"}>
                  <Button className={"w-full"} size={"md"}>
                    View All
                  </Button>
                </Link>
                <IonInfiniteScroll
                  disabled={!hasNextPage}
                  onIonInfinite={async (evt) => {
                    await fetchNextPage();
                    await evt.target.complete();
                  }}
                >
                  <IonInfiniteScrollContent />
                </IonInfiniteScroll>
              </Stack>
            )}
          </PostsFeed>
        </DetailsBox>
      </Stack>
    </AppPage>
  );
};

export default HomePage;
