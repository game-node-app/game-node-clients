import React, { useState } from "react";
import GameView from "@/components/game/view/GameView";
import { Box, Space, Stack } from "@mantine/core";
import CenteredLoading from "@/components/general/CenteredLoading";
import { IGameViewPaginationProps } from "@/components/game/view/GameViewPagination";
import { SearchGame } from "@/components/game/search/utils/types";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { getErrorMessage } from "@/util/getErrorMessage";
import { type ApiError } from "@/wrapper/search";

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
                <CenteredErrorMessage
                    message={"No results found. Please try again."}
                />
            );
        } else {
            return (
                <Stack
                    w={"100%"}
                    justify={"space-between"}
                    h={"100%"}
                    mt={"md"}
                >
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
