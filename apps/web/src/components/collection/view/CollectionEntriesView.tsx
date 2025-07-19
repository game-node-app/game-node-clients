import React, { useCallback, useState } from "react";
import { Game } from "@repo/wrapper/server";
import { Box, Flex, Skeleton, Space, Stack } from "@mantine/core";
import {
  CenteredErrorMessage,
  GameView,
  IGameViewPaginationProps,
  SelectWithOrdering,
  TGameOrSearchGame,
} from "@repo/ui";

interface ICollectionEntriesViewProps extends IGameViewPaginationProps {
  isLoading: boolean;
  isError: boolean;
  games: TGameOrSearchGame[] | undefined;
  onChangeOrder: (value: string, order: "ASC" | "DESC") => void;
}

const CollectionEntriesView = ({
  games,
  isError,
  isLoading,
  paginationInfo,
  onPaginationChange,
  page,
  onChangeOrder,
}: ICollectionEntriesViewProps) => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(6).fill(0).map((_, i) => {
      return <Skeleton key={i} className={"w-full h-40 lg:h-52 mt-4"} />;
    });
  }, []);

  const enablePagination =
    paginationInfo != undefined && (paginationInfo.totalPages ?? 1) > 1;

  if (isError) {
    return (
      <CenteredErrorMessage message={"An error occurred. Please try again."} />
    );
  } else if (!isLoading && (games == undefined || games.length === 0)) {
    return <CenteredErrorMessage message={"This collection is empty."} />;
  }

  return (
    <GameView layout={layout}>
      <Stack
        className={"w-full"}
        justify={"space-between"}
        h={"100%"}
        mt={"md"}
      >
        <Box className="w-full flex justify-between mb-8">
          <Box className={"max-w-40"}>
            <SelectWithOrdering
              description={"Order by"}
              data={[
                {
                  value: "addedDate",
                  label: "Added Date",
                },
                {
                  value: "releaseDate",
                  label: "Release Date",
                },
              ]}
              defaultValue={"addedDate"}
              onChange={onChangeOrder}
            />
          </Box>

          <Flex className={""}>
            <GameView.LayoutSwitcher setLayout={setLayout} />
          </Flex>
        </Box>
        <GameView.Content items={games!}>
          {isLoading && buildLoadingSkeletons()}
        </GameView.Content>
        <Space h={"2rem"} className={"mt-auto"} />
        {enablePagination && (
          <GameView.Pagination
            page={page}
            paginationInfo={paginationInfo}
            onPaginationChange={onPaginationChange}
          />
        )}
      </Stack>
    </GameView>
  );
};

export default CollectionEntriesView;
