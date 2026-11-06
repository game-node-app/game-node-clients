import React, { useState } from "react";
import { FloatingIndicator, Group, Stack, Tabs } from "@mantine/core";
import {
  BackToTopButton,
  buildGameCategoryFilters,
  CenteredErrorMessage,
  ConsoleHome,
  DynamicAwardsOverview,
  DynamicRecapOverview,
  GameSearchBar,
  GameSearchTips,
  GameSearchViewActions,
  GameView,
  GameViewLayoutOption,
  getErrorMessage,
  HomeReleases,
  RecentActivityList,
  RecentBlogPostsCarousel,
  RecommendationCarousel,
  TrendingGamesList,
  THEMES,
  TrendingReviewCarousel,
  useAppTheme,
  useSearchGames,
  useUrlState,
  useUserId,
} from "@repo/ui";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { Activity } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import type = Activity.type;

const HomePage = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const [theme] = useAppTheme();
  const isConsole = THEMES[theme].layout === "console";
  const [feedTab, setFeedTab] = useState<string | null>("all");
  const [feedTabsList, setFeedTabsList] = useState<HTMLDivElement | null>(null);
  const [feedTabRefs, setFeedTabRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  // Mantine's FloatingIndicator pattern: mutate the same object, so the per-render ref callbacks
  // (called with null, then the node) never clear the target mid-switch and the slide animates
  const setFeedTabRef = (value: string) => (node: HTMLButtonElement | null) => {
    feedTabRefs[value] = node;
    setFeedTabRefs(feedTabRefs);
  };

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

  // both: the raw query drops results as soon as the input is cleared, the debounced one stops an empty search firing while it catches up
  const isQueryEnabled =
    (searchParameters.query?.length ?? 0) > 2 && debouncedQuery.length > 2;

  const searchQuery = useSearchGames(
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
  // keepPreviousData would otherwise keep the last results on screen after the input is cleared
  const { data, isLoading, isSuccess, isError, error } = isQueryEnabled
    ? searchQuery
    : {
        data: undefined,
        isLoading: false,
        isSuccess: false,
        isError: false,
        error: null,
      };

  const isEmpty = isSuccess && data?.data?.items?.length === 0;

  const enablePagination = (data?.pagination?.totalPages ?? 1) > 1;

  /**
   * Trending games, reviews, etc.
   */
  const extraItemsEnabled = !isLoading && !isError && data == undefined;

  const searchView = (
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
  );

  return (
    <Stack mih={"100%"} pos={"relative"} className="mt-12 mb-8">
      <BackToTopButton />
      {isConsole && <ConsoleHome search={searchView} />}
      <Stack className={"w-full items-center gap-xs"}>
        {!isConsole && searchView}
        {extraItemsEnabled && (
          <Stack
            w={"100%"}
            h={"100%"}
            justify={"center"}
            align={"center"}
            mt={"1rem"}
            gap={40}
          >
            {/* console themes show these as ConsoleHome rows */}
            {!isConsole && <TrendingGamesList />}
            {!isConsole && userId && (
              <RecommendationCarousel criteria="played" />
            )}
            {/* console themes show these as ConsoleReviewRow */}
            {!isConsole && <TrendingReviewCarousel />}
            <DynamicAwardsOverview />
            <DynamicRecapOverview />
            <RecentBlogPostsCarousel />
            {/* transparent tab color hides the static underline; the FloatingIndicator slides instead */}
            <Tabs
              value={feedTab}
              onChange={setFeedTab}
              color={"transparent"}
              className={"w-full"}
            >
              <Tabs.List ref={setFeedTabsList} pos={"relative"}>
                <Tabs.Tab value={"all"} ref={setFeedTabRef("all")}>
                  {t("home.recentActivity")}
                </Tabs.Tab>
                <Tabs.Tab value={"reviews"} ref={setFeedTabRef("reviews")}>
                  {t("home.lastReviews")}
                </Tabs.Tab>
                <FloatingIndicator
                  target={feedTab ? feedTabRefs[feedTab] : null}
                  parent={feedTabsList}
                  transitionDuration={250}
                  // above the hovered tab, whose background and gray hover border otherwise cover the line
                  style={{
                    zIndex: 2,
                    pointerEvents: "none",
                    borderBottom:
                      "2px solid var(--mantine-primary-color-filled)",
                  }}
                />
              </Tabs.List>
              <Tabs.Panel value={"all"} pt={"md"}>
                <RecentActivityList limit={6} cols={{ base: 1, md: 2 }} />
              </Tabs.Panel>
              <Tabs.Panel value={"reviews"} pt={"md"}>
                <RecentActivityList
                  limit={6}
                  type={type.REVIEW}
                  cols={{ base: 1, md: 2 }}
                />
              </Tabs.Panel>
            </Tabs>
            <HomeReleases />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default HomePage;
