import React, { useMemo, useState } from "react";
import { Divider, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useCollection } from "@/components/collection/hooks/useCollection";
import { useGames } from "@/components/game/hooks/useGames";
import GameView, { GameViewLayoutOption } from "@/components/game/view/GameView";
import { useInfiniteCollectionEntriesForCollectionId } from "../collection-entry/hooks/useInfiniteCollectionEntriesForCollectionId";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";

interface ICollectionViewProps {
    libraryUserId: string;
    collectionId: string;
}

const DEFAULT_LIMIT = 24;

const CollectionView = ({ collectionId }: ICollectionViewProps) => {
    const [layout, setLayout] = useState<GameViewLayoutOption>("grid");

    const collectionQuery = useCollection(collectionId);
    const collection = collectionQuery.data;

    const collectionEntriesQuery = useInfiniteCollectionEntriesForCollectionId({
        collectionId,
        limit: DEFAULT_LIMIT,
        orderBy: {
            addedDate: "DESC",
        },
    });

    const gamesIds = useMemo(() => {
        const ids = collectionEntriesQuery.data?.pages.flatMap((page) => page?.data.map((entry) => entry.gameId));

        return ids?.filter((id) => id != undefined);
    }, [collectionEntriesQuery.data]);

    const gamesQuery = useGames(
        {
            gameIds: gamesIds,
            relations: {
                cover: true,
            },
        },
        true,
    );

    const games = gamesQuery.data;

    const isLoading = collectionQuery.isLoading || collectionEntriesQuery.isLoading || gamesQuery.isLoading;
    const isError = collectionQuery.isError || collectionEntriesQuery.isError || gamesQuery.isError;
    const isFetching = collectionEntriesQuery.isFetching || gamesQuery.isFetching;

    return (
        <Stack w={"100%"} h={"100%"} gap={0} align={"center"}>
            <Group className="w-full flex-nowrap justify-between">
                <Stack w="100%">
                    {collectionQuery.isLoading && (
                        <>
                            <Skeleton className={"w-32 h-9"} />
                            <Skeleton className={"w-48 h-6"} />
                        </>
                    )}
                    <Title size={"h3"} className={"w-full break-words"}>
                        {collection?.name}
                    </Title>
                    <Text c={"dimmed"} w={"100%"} className={"break-words"}>
                        {collectionQuery.data?.description}
                    </Text>
                </Stack>
            </Group>
            <Divider className={"w-[calc(100%-2rem)]"} my={"sm"} variant={"dashed"} />
            <Stack>
                <GameView layout={layout}>
                    <GameView.LayoutSwitcher setLayout={setLayout} />
                    <GameView.Content
                        items={games}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        hasNextPage={collectionEntriesQuery.hasNextPage}
                        onLoadMore={() => {
                            if (!isLoading && !isFetching) {
                                collectionEntriesQuery.fetchNextPage();
                            }
                        }}
                    />
                    {isError && (
                        <CenteredErrorMessage message="Failed to fetch collection entries. Please try again." />
                    )}
                </GameView>
            </Stack>
        </Stack>
    );
};

export default CollectionView;
