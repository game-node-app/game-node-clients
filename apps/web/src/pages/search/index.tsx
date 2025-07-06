import React, { useState } from "react";
import { Box, Center, Container, Space, Stack, Title } from "@mantine/core";
import {
  ActivityFeed,
  BackToTopButton,
  DetailsBox,
  GameSearchBar,
  GameSearchRequestDto,
  GameSearchTips,
  HomeFeed,
  InfiniteLoaderProps,
  PostsFeed,
  RecentActivityList,
  RecommendationCarousel,
  SimpleInfiniteLoader,
  TrendingGamesList,
  TrendingReviewCarousel,
  useSearchGames,
  useUserId,
} from "@repo/ui";
import GameSearchResultView from "@/components/game/search/GameSearchResultView";
import { RecentBlogPostsCarousel } from "@repo/ui";

const DEFAULT_SEARCH_PARAMETERS: GameSearchRequestDto = {
  query: undefined,
  page: 1,
  limit: 20,
};

const Index = () => {
  const userId = useUserId();

  const [searchParameters, setSearchParameters] = useState(
    DEFAULT_SEARCH_PARAMETERS,
  );

  const isQueryEnabled =
    searchParameters != undefined &&
    searchParameters.query != undefined &&
    searchParameters.query.length > 2;

  const searchQuery = useSearchGames(searchParameters, isQueryEnabled);

  /**
   * Trending games, reviews, etc.
   */
  const extraItemsEnabled =
    !searchQuery.isLoading &&
    !searchQuery.isError &&
    searchQuery.data == undefined;

  return (
    <Stack mih={"100%"} pos={"relative"} className="mb-12">
      <BackToTopButton />
      <Stack align="center" justify="center" w={"100%"}>
        <Box className={`w-full flex justify-center mt-12 flex-wrap`}>
          <GameSearchBar
            onSubmit={(data) => {
              setSearchParameters((prev) => {
                return {
                  ...prev,
                  ...data,
                };
              });
            }}
          />
          <GameSearchTips className={"w-full mt-2"} />
        </Box>
        <Box className={"w-full flex justify-center h-full"}>
          <GameSearchResultView
            enabled={isQueryEnabled}
            isError={searchQuery.isError}
            error={searchQuery.error}
            isLoading={searchQuery.isLoading}
            results={searchQuery.data?.data?.items}
            page={searchParameters.page!}
            paginationInfo={searchQuery.data?.pagination}
            onPaginationChange={(page) => {
              setSearchParameters((previous) => ({ ...previous, page: page }));
            }}
          />
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
        </Box>
      </Stack>
    </Stack>
  );
};

export default Index;
