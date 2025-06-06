import React, { useState } from "react";
import { Box, Space, Stack } from "@mantine/core";
import { type ApiError } from "@repo/wrapper/search";
import {
  CenteredErrorMessage,
  CenteredLoading,
  GameView,
  getErrorMessage,
  IGameViewPaginationProps,
  SearchGame,
} from "@repo/ui";

interface ISearchResultScreenProps extends IGameViewPaginationProps {
  enabled: boolean;
  isLoading: boolean;
  isError: boolean;
  error?: ApiError | null;
  results: SearchGame[] | undefined;
}

const GameSearchResultView = ({
  enabled,
  isError,
  error,
  isLoading,
  results,
  paginationInfo,
  onPaginationChange,
  page,
}: ISearchResultScreenProps) => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const render = () => {
    if (!enabled) {
      return null;
    }
    if (isError && error) {
      return <CenteredErrorMessage message={getErrorMessage(error)} />;
    } else if (isLoading) {
      return <CenteredLoading />;
    } else if (results == undefined || results.length === 0) {
      return (
        <CenteredErrorMessage message={"No results found. Please try again."} />
      );
    } else {
      return (
        <Stack w={"100%"} justify={"space-between"} h={"100%"} mt={"md"}>
          <Box className="w-full flex justify-end">
            <GameView.LayoutSwitcher setLayout={setLayout} />
          </Box>

          <Box className={"w-full mt-5"} />

          <GameView.Content items={results} />

          <Space h={"2rem"} />
          <GameView.Pagination
            page={page}
            paginationInfo={paginationInfo}
            onPaginationChange={onPaginationChange}
          />
        </Stack>
      );
    }
  };

  return <GameView layout={layout}>{render()}</GameView>;
};

export default GameSearchResultView;
