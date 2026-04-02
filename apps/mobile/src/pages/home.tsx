import { IonRefresher, IonRefresherContent } from "@ionic/react";
import React, { useRef } from "react";
import { SimpleGrid, Stack } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import { useQueryClient } from "@tanstack/react-query";
import {
  BackToTopButton,
  DetailsCard,
  DynamicAwardsOverview,
  DynamicRecapOverview,
  GameCollectionTypeView,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  TrendingGamesList,
  TrendingReviewCarousel,
} from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { AppPage } from "@/components/general/AppPage.tsx";
import {
  Activity,
  FindGamesByCollectionTypeRequestDto,
} from "@repo/wrapper/server";
import ActivityType = Activity.type;
import CollectionType = FindGamesByCollectionTypeRequestDto.collectionType;

const HomePage = () => {
  const { t } = useTranslation();
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
        {userId && <RecommendationCarousel criteria={"finished"} />}
        <TrendingGamesList />
        <TrendingReviewCarousel
          slideSize={210}
          height={260}
          withIndicators={false}
          withControls={false}
        />
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
        <SimpleGrid cols={{ base: 1, xs: 2 }} className={"w-full"}>
          <GameCollectionTypeView collectionType={CollectionType.UPCOMING} />
          <GameCollectionTypeView
            collectionType={CollectionType.RECENTLY_RELEASED}
          />
        </SimpleGrid>
      </Stack>
    </AppPage>
  );
};

export default HomePage;
