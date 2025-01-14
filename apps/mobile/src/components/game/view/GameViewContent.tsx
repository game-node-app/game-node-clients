import React, { useCallback, useContext } from "react";
import { Button, Center, Group, SimpleGrid, SimpleGridProps, Skeleton, Stack, Text } from "@mantine/core";
import { GameViewContext } from "@/components/game/view/GameView";
import GameGridItem from "@/components/game/figure/GameGridItem";
import { TGameOrSearchGame } from "@/components/game/util/types";
import CenteredLoading from "@/components/general/CenteredLoading";
import { IonItem, IonList } from "@ionic/react";
import GameListItemWithSwipe from "@/components/game/figure/GameListItemWithSwipe";

const GRID_COLUMNS_COUNT = 3;

interface IMetadataGridContentProps extends SimpleGridProps {
    items: TGameOrSearchGame[] | undefined;
    isLoading: boolean;
    isFetching: boolean;
    hasNextPage: boolean;
    onLoadMore: () => void;
}

/**
 * Mobile exclusive version of "GameViewContent" with automatic pagination handling. <br>
 * To be used with infinite queries.
 * @param items
 * @param isLoading
 * @param isFetching
 * @param hasNextPage
 * @param children
 * @param others
 * @constructor
 */
const GameViewContent = ({
    items,
    isLoading,
    isFetching,
    hasNextPage,
    onLoadMore,
    ...others
}: IMetadataGridContentProps) => {
    const { layout } = useContext(GameViewContext);

    const buildGridColumns = useCallback(() => {
        if (items == null || items.length === 0) {
            return null;
        }

        return items.map((item) => {
            return <GameGridItem key={`grid-${item.id}`} game={item} />;
        });
    }, [items]);

    const buildListItems = useCallback(() => {
        if (items == null || items.length === 0) {
            return null;
        }

        return items.map((item) => {
            return <GameListItemWithSwipe key={`list-${item.id}`} game={item} />;
        });
    }, [items]);

    const buildLoadingSkeletons = useCallback(() => {
        return new Array(6).fill(0).map((_, i) => {
            return <Skeleton key={`${layout}-skeleton-${i}`} className={"w-full min-h-[140px] mb-3"} />;
        });
    }, [layout]);

    const isEmpty = !isLoading && !isFetching && (items == undefined || items.length === 0);

    const enableLoadingSpinner = isLoading;

    const enableLoadingSkeletons = !isLoading && isFetching;

    const enableLoadMoreButton = !isLoading && !isFetching && hasNextPage;

    if (layout === "list") {
        return (
            <Stack className={"w-full h-full"}>
                {enableLoadingSpinner && <CenteredLoading />}
                <IonList className={"w-full"}>
                    {buildListItems()}
                    {enableLoadingSkeletons && buildLoadingSkeletons()}
                    {isEmpty && (
                        <IonItem className={"w-full"}>
                            <Center className={"w-full"}>
                                <Text>No items to show.</Text>
                            </Center>
                        </IonItem>
                    )}
                </IonList>
                {enableLoadMoreButton && (
                    <Group className={"w-full justify-center"}>
                        <Button onClick={onLoadMore}>Load more</Button>
                    </Group>
                )}
            </Stack>
        );
    }

    return (
        <Stack className={"w-full h-full gap-2"}>
            {isEmpty && (
                <Center>
                    <Text>No items to show.</Text>
                </Center>
            )}
            {enableLoadingSpinner && <CenteredLoading />}
            <SimpleGrid id={"game-view-content"} cols={GRID_COLUMNS_COUNT} w={"100%"} h={"100%"} {...others}>
                {buildGridColumns()}
                {enableLoadingSkeletons && buildLoadingSkeletons()}
            </SimpleGrid>
            {enableLoadMoreButton && (
                <Group className={"w-full justify-center mt-4"}>
                    <Button onClick={onLoadMore}>Load more</Button>
                </Group>
            )}
        </Stack>
    );
};

export default GameViewContent;
