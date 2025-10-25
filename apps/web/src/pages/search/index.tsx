import React from "react";
import { Box, Center, Group, Space, Stack, Title } from "@mantine/core";
import {
  AwardsEventOverview,
  BackToTopButton,
  buildGameCategoryFilters,
  CenteredErrorMessage,
  DetailsBox,
  DynamicAwardsOverview,
  GameSearchBar,
  GameSearchRequestDto,
  GameSearchTips,
  GameSearchViewActions,
  GameView,
  GameViewLayoutOption,
  getErrorMessage,
  getOffsetAsPage,
  InfiniteLoaderProps,
  PostsFeed,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  SimpleInfiniteLoader,
  TrendingGamesList,
  TrendingReviewCarousel,
  UserRecentStatsReport,
  useSearchGames,
  useUrlState,
  useUserId,
} from "@repo/ui";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";

const Index = () => {
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
        <GameView layout={layout}>
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
          <GameSearchTips className={"w-full"} />

          {isError && <CenteredErrorMessage message={getErrorMessage(error)} />}
          {isEmpty && (
            <CenteredErrorMessage
              message={"No results found. Please try again."}
            />
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
            gap={"5rem"}
          >
            <TrendingGamesList />
            <UserRecentStatsReport />
            {userId && <RecommendationCarousel criteria="finished" />}
            <TrendingReviewCarousel />
            <DynamicAwardsOverview />
            <RecentBlogPostsCarousel />
            <Center className={"w-full"}>
              <Box className={"w-full lg:w-3/4"}>
                <Title size={"h3"} className={"text-center"}>
                  Recent activity
                </Title>
                <RecentActivityList limit={10} />
              </Box>
            </Center>
            <DetailsBox title={"Recent Posts"}>
              <PostsFeed criteria={"all"}>
                {(props: InfiniteLoaderProps) => (
                  <SimpleInfiniteLoader {...props} />
                )}
              </PostsFeed>
            </DetailsBox>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default Index;
