import React from "react";
import { Group, SimpleGrid, Stack } from "@mantine/core";
import {
  BackToTopButton,
  buildGameCategoryFilters,
  buildPresenterComponent,
  CenteredErrorMessage,
  DetailsCard,
  GameSearchBar,
  GameSearchTips,
  GameSearchViewActions,
  GameView,
  GameViewLayoutOption,
  getErrorMessage,
  HomeEventsSection,
  HomeView,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  ReleaseStrip,
  TrendingGamesList,
  TrendingReviewCarousel,
  useAppExperience,
  useSearchGames,
  useUrlState,
  useUserId,
} from "@repo/ui";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { Activity } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import type = Activity.type;

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
  const userId = useUserId();
  const experience = useAppExperience();

  const [layout, setLayout] = useLocalStorage<GameViewLayoutOption>({
    key: "search-game-view-layout",
    defaultValue: "grid",
    // prevents SSR errors
    getInitialValueInEffect: true,
  });

  const [searchParameters, setSearchParameters] = useUrlState({
    query: "",
    page: 1,
    includeExtraContent: false,
  });

  const [debouncedQuery] = useDebouncedValue(searchParameters.query, 500);

  const isQueryEnabled =
    searchParameters.query != undefined && searchParameters.query.length > 2;

  const { data, isLoading, isSuccess, isError, error } = useSearchGames(
    {
      query: debouncedQuery,
      category: buildGameCategoryFilters({
        includeExtraContent: searchParameters.includeExtraContent,
        includeDlcs: searchParameters.includeExtraContent,
      }),
      page: searchParameters.page,
    },
    isQueryEnabled,
  );

  const isEmpty =
    isQueryEnabled && isSuccess && data?.data?.items?.length === 0;

  const enablePagination = (data?.pagination?.totalPages ?? 1) > 1;

  /**
   * Trending games, reviews, etc.
   */
  const extraItemsEnabled = !isQueryEnabled;

  const searchContent = (
    <GameView layout={layout} cols={{ base: 4, md: 6, lg: 8 }}>
      <GameSearchBar
        onChange={(query) => {
          // a new (or cleared) query always starts from the first page
          setSearchParameters({ query, page: 1 });
        }}
      />
      <GameSearchViewActions
        includeExtraContent={searchParameters.includeExtraContent}
        onExtraContentChange={(value) =>
          setSearchParameters({ includeExtraContent: value })
        }
        onLayoutChange={setLayout}
      />
      <Group className={"justify-between w-full md:flex-nowrap"}>
        <GameSearchTips className={"w-full"} />
      </Group>

      {isQueryEnabled && isError && (
        <CenteredErrorMessage message={getErrorMessage(error)} />
      )}
      {isEmpty && (
        <CenteredErrorMessage message={t("home.noResultsTryAgain")} />
      )}
      <GameView.Content items={isQueryEnabled ? data?.data?.items : undefined}>
        <GameView.LoadingSkeletons isVisible={isQueryEnabled && isLoading} />
      </GameView.Content>
      {isQueryEnabled && enablePagination && (
        <GameView.Pagination
          className={"mt-4"}
          page={searchParameters.page}
          paginationInfo={data?.pagination}
          onPaginationChange={(page) => setSearchParameters({ page })}
        ></GameView.Pagination>
      )}
    </GameView>
  );

  const eventsSection = <HomeEventsSection />;
  const activitySection = (
    <SimpleGrid cols={{ base: 1, xs: 2 }} className={"w-full"}>
      <DetailsCard title={t("home.recentActivity")}>
        <RecentActivityList limit={10} />
      </DetailsCard>
      <DetailsCard title={t("home.lastReviews")}>
        <RecentActivityList limit={10} type={type.REVIEW} />
      </DetailsCard>
    </SimpleGrid>
  );
  // The console home renders its own rows/releases/blog, so only the sections
  // it does not replace are passed through as extras.
  const platformExtras = (
    <>
      {eventsSection}
      {activitySection}
    </>
  );

  return (
    <div
      className={"contents"}
      data-xbox-focus-color={experience === "console" ? "true" : undefined}
    >
      <HomeViewPresenter
        search={searchContent}
        extras={extraItemsEnabled ? platformExtras : undefined}
      >
        <Stack mih={"100%"} pos={"relative"} className="mt-12 mb-8">
          <BackToTopButton />
          <Stack className={"w-full items-center gap-xs"}>
            {searchContent}
            {extraItemsEnabled && (
              <Stack
                w={"100%"}
                h={"100%"}
                justify={"center"}
                align={"center"}
                mt={"1rem"}
                gap={40}
                className="motion-safe:animate-gn-fade-up"
              >
                {eventsSection}
                <TrendingGamesList />
                {userId && <RecommendationCarousel criteria="played" />}
                <TrendingReviewCarousel />
                <RecentBlogPostsPresenter />
                {activitySection}
                <HomeReleasesPresenter />
              </Stack>
            )}
          </Stack>
        </Stack>
      </HomeViewPresenter>
    </div>
  );
};

export default HomePage;
