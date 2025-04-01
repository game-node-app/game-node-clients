import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Space, Stack } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GameSearchRequestDto } from "@/components/game/search/utils/types";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { DetailsBox } from "@/components/general/DetailsBox";
import {
  BackToTopButton,
  GameSearchBar,
  GameSearchTips,
  HomeFeed,
  InfiniteLoaderProps,
  RecommendationCarousel,
  SearchBar,
  SimpleInfiniteLoader,
  TrendingGamesList,
  TrendingReviewCarousel,
  useSearchGames,
  useUserId,
} from "@repo/ui";
import GameSearchResultView from "@/components/game/search/GameSearchResultView";

const DEFAULT_SEARCH_PARAMETERS: GameSearchRequestDto = {
  query: undefined,
  page: 1,
  limit: 20,
};

const Index = () => {
  const userId = useUserId();

  const router = useRouter();

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
    <Container fluid mih={"100%"} pos={"relative"} className="mb-12">
      <BackToTopButton />
      <Stack align="center" justify="center" w={"100%"}>
        <Box
          className={`w-full flex justify-center lg:max-w-screen-lg mt-12 flex-wrap`}
        >
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
        <Box className={"w-full flex justify-center h-full lg:max-w-screen-lg"}>
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
              {userId && (
                <>
                  <RecommendationCarousel
                    criteria="finished"
                    stackProps={{
                      className: "",
                    }}
                  />
                  <RecommendationCarousel
                    criteria="theme"
                    stackProps={{
                      className: "",
                    }}
                  />
                  <RecommendationCarousel
                    criteria="genre"
                    stackProps={{
                      className: "",
                    }}
                  />
                </>
              )}
              <Space h={"1rem"} />
              <TrendingReviewCarousel />
              <Space h={"1rem"} />
              <DetailsBox
                title={"Recent Activity"}
                stackProps={{
                  className: "",
                }}
              >
                <HomeFeed>
                  {(props: InfiniteLoaderProps) => (
                    <SimpleInfiniteLoader {...props} />
                  )}
                </HomeFeed>
              </DetailsBox>
            </Stack>
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default Index;
