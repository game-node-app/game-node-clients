import React, { useMemo, useState } from "react";
import { Center, FocusTrap, Stack, Text } from "@mantine/core";
import {
  buildGameCategoryFilters,
  GameSearchBar,
  GameSearchTips,
  GameSearchViewActions,
  GameView,
  GameViewLayoutOption,
  SimpleInfiniteLoader,
  TGameOrSearchGame,
  useInfiniteSearchGames,
  useUrlState,
} from "@repo/ui";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { getErrorMessage } from "@/util/getErrorMessage";
import { useDebouncedValue } from "@mantine/hooks";
import { AppPage } from "@/components/general/AppPage";
import { IconSearch } from "@tabler/icons-react";

const GameSearchPage = () => {
  const [searchParams, setSearchParams] = useUrlState(
    {
      query: "",
      includeExtraContent: false,
    },
    {
      replace: true,
    },
  );

  const { includeExtraContent, query } = searchParams;

  const [debouncedQuery] = useDebouncedValue(query ?? "", 300);

  const [layout, setLayout] = useState<GameViewLayoutOption>("grid");

  const isQueryEnabled =
    searchParams.query != undefined && searchParams.query.length >= 3;

  const { data, hasNextPage, fetchNextPage, isFetching, isError, error } =
    useInfiniteSearchGames(
      {
        query: debouncedQuery,
        category: buildGameCategoryFilters({
          includeDlcs: includeExtraContent,
          includeExtraContent: includeExtraContent,
        }),
        limit: 24,
      },
      isQueryEnabled,
    );

  const items = useMemo(() => {
    return data?.pages
      ?.flatMap((page) => page.data?.items)
      .filter((item) => item != undefined) as TGameOrSearchGame[] | undefined;
  }, [data]);

  return (
    <AppPage withSearch={false}>
      <Stack className={"w-full min-h-96 mb-8"}>
        <GameView layout={layout}>
          <FocusTrap>
            <GameSearchBar
              onChange={(query) => setSearchParams({ query })}
              withButton={false}
              leftSection={<IconSearch size={21} />}
            />
          </FocusTrap>
          <GameSearchViewActions
            includeExtraContent={includeExtraContent}
            onExtraContentChange={(value) =>
              setSearchParams({ includeExtraContent: value })
            }
            onLayoutChange={setLayout}
          />
          <GameSearchTips />
          {isError && <CenteredErrorMessage message={getErrorMessage(error)} />}
          {!isQueryEnabled ? (
            <Center>
              <Text>Start typing to see results.</Text>
            </Center>
          ) : (
            <>
              <GameView.Content items={items}>
                <GameView.LoadingSkeletons isVisible={isFetching} />
              </GameView.Content>
              <SimpleInfiniteLoader
                fetchNextPage={async () => {
                  if (isFetching) return;
                  await fetchNextPage();
                }}
                isFetching={isFetching}
                hasNextPage={hasNextPage}
              />
            </>
          )}
        </GameView>
      </Stack>
    </AppPage>
  );
};

export default GameSearchPage;
