import React from "react";
import { Box, Center, Group, Space, Stack, Title } from "@mantine/core";
import {
  BackToTopButton,
  CenteredErrorMessage,
  DetailsBox,
  GameSearchBar,
  GameSearchRequestDto,
  GameSearchTips,
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
  useSearchGames,
  useUrlState,
  useUserId,
} from "@repo/ui";
import { useLocalStorage } from "@mantine/hooks";

const DEFAULT_LIMIT = 20;

const DEFAULT_SEARCH_PARAMETERS = {
  query: "",
  page: 1,
  limit: DEFAULT_LIMIT,
};

const Index = () => {
  const userId = useUserId();

  const [layout, setLayout] = useLocalStorage<GameViewLayoutOption>({
    key: "search-game-view-layout",
    defaultValue: "grid",
    getInitialValueInEffect: false,
  });

  const [searchParameters, setSearchParameters] = useUrlState(
    DEFAULT_SEARCH_PARAMETERS,
  );

  const isQueryEnabled =
    searchParameters != undefined &&
    searchParameters.query != undefined &&
    searchParameters.query.length > 2;

  const { data, isLoading, isSuccess, isError, error } = useSearchGames(
    searchParameters,
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
          <Group className={"w-full flex-nowrap"}>
            <GameView.LayoutSwitcher mode={"chip"} setLayout={setLayout} />
          </Group>
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
          >
            <TrendingGamesList />
            <Space h={"1rem"} />
            {userId && <RecommendationCarousel criteria="finished" />}
            <Space h={"1rem"} />
            <TrendingReviewCarousel />
            <Space h={"1rem"} />
            <RecentBlogPostsCarousel />
            <Space h={"1rem"} />
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
