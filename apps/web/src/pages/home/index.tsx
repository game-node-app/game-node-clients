import React from "react";
import { Group, SimpleGrid, Stack } from "@mantine/core";
import {
  BackToTopButton,
  buildGameCategoryFilters,
  CenteredErrorMessage,
  DetailsCard,
  DynamicAwardsOverview,
  DynamicRecapOverview,
  GameCollectionTypeView,
  GameSearchBar,
  GameSearchTips,
  GameSearchViewActions,
  GameView,
  GameViewLayoutOption,
  getErrorMessage,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  TrendingGamesList,
  TrendingReviewCarousel,
  useSearchGames,
  useUrlState,
  useUserId,
} from "@repo/ui";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import {
  Activity,
  FindGamesByCollectionTypeRequestDto,
} from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import collectionType = FindGamesByCollectionTypeRequestDto.collectionType;
import type = Activity.type;

const HomePage = () => {
  const { t } = useTranslation();
  const userId = useUserId();

  const [layout, setLayout] = useLocalStorage<GameViewLayoutOption>({
    key: "search-game-view-layout",
    defaultValue: "grid",
    getInitialValueInEffect: false,
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

  const isEmpty = isSuccess && data?.data?.items?.length === 0;

  const enablePagination = (data?.pagination?.totalPages ?? 1) > 1;

  /**
   * Trending games, reviews, etc.
   */
  const extraItemsEnabled = !isLoading && !isError && data == undefined;

  return (
    <Stack mih={"100%"} pos={"relative"} className="mt-12 mb-8">
      <BackToTopButton />
      <Stack className={"w-full items-center gap-xs"}>
        <GameView layout={layout} cols={{ base: 4, md: 6, lg: 8 }}>
          <GameSearchBar
            onChange={(query) => {
              setSearchParameters({ query });
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

          {isError && <CenteredErrorMessage message={getErrorMessage(error)} />}
          {isEmpty && (
            <CenteredErrorMessage message={t("home.noResultsTryAgain")} />
          )}
          <GameView.Content items={data?.data?.items}>
            <GameView.LoadingSkeletons isVisible={isLoading} />
          </GameView.Content>
          {enablePagination && (
            <GameView.Pagination
              className={"mt-4"}
              page={searchParameters.page}
              paginationInfo={data?.pagination}
              onPaginationChange={(page) => setSearchParameters({ page })}
            ></GameView.Pagination>
          )}
        </GameView>
        {extraItemsEnabled && (
          <Stack
            w={"100%"}
            h={"100%"}
            justify={"center"}
            align={"center"}
            mt={"1rem"}
            gap={40}
          >
            <TrendingGamesList />
            {userId && <RecommendationCarousel criteria="played" />}
            <TrendingReviewCarousel />
            <DynamicAwardsOverview />
            <DynamicRecapOverview />
            <RecentBlogPostsCarousel />
            <SimpleGrid cols={{ base: 1, xs: 2 }} className={"w-full"}>
              <DetailsCard title={t("home.recentActivity")}>
                <RecentActivityList limit={10} />
              </DetailsCard>
              <DetailsCard title={t("home.lastReviews")}>
                <RecentActivityList limit={10} type={type.REVIEW} />
              </DetailsCard>
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, xs: 2 }} className={"w-full"}>
              <GameCollectionTypeView
                collectionType={collectionType.UPCOMING}
              />
              <GameCollectionTypeView
                collectionType={collectionType.RECENTLY_RELEASED}
              />
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default HomePage;
