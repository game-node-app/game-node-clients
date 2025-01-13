import React, { useCallback, useMemo, useState } from "react";
import { CollectionEntry, Game } from "@/wrapper/server";
import { Flex, Skeleton, Stack } from "@mantine/core";
import GameView from "@/components/game/view/GameView";
import CenteredLoading from "@/components/general/CenteredLoading";
import { Box, Space } from "@mantine/core";
import GameViewLayoutSwitcher from "@/components/game/view/GameViewLayoutSwitcher";
import { IGameViewPaginationProps } from "@/components/game/view/GameViewPagination";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import SelectWithOrdering from "@/components/general/input/select/SelectWithOrdering";

interface ICollectionEntriesViewProps extends IGameViewPaginationProps {
    isLoading: boolean;
    isError: boolean;
    games: Game[] | undefined;
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
        return new Array(4).fill(0).map((_, i) => {
            return <Skeleton key={i} className={"w-full h-60 mt-4"} />;
        });
    }, []);

    const render = () => {
        if (isError) {
            return (
                <CenteredErrorMessage
                    message={"An error occurred. Please try again."}
                />
            );
        } else if (!isLoading && (games == undefined || games.length === 0)) {
            return (
                <CenteredErrorMessage message={"This collection is empty."} />
            );
        } else {
            return (
                <Stack
                    className={"w-[calc(100%-2rem)]"}
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
                            <GameViewLayoutSwitcher setLayout={setLayout} />
                        </Flex>
                    </Box>
                    <GameView.Content items={games!}>
                        {isLoading && buildLoadingSkeletons()}
                    </GameView.Content>
                    <Space h={"2rem"} />
                    {!isLoading && !isError && (
                        <GameView.Pagination
                            page={page}
                            paginationInfo={paginationInfo}
                            onPaginationChange={onPaginationChange}
                        />
                    )}
                </Stack>
            );
        }
    };

    return <GameView layout={layout}>{render()}</GameView>;
};

export default CollectionEntriesView;
