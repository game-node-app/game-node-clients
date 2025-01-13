import React, { useMemo } from "react";
import { Container, SimpleGrid } from "@mantine/core";
import { useGames } from "@/components/game/hooks/useGames";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import GameGridItem from "@/components/game/figure/GameGridItem";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import useCollectionEntriesForUserId from "@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import getFavoriteCollectionEntries from "@/components/collection/collection-entry/util/getFavoriteCollectionEntries";
import { useFavoriteCollectionEntriesForUserId } from "@/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import CenteredLoading from "@/components/general/CenteredLoading";

interface Props {
    userId: string;
    limit?: number;
}

const ProfileFavoriteGames = ({ userId, limit = 10 }: Props) => {
    const onMobile = useOnMobile();
    const favoriteCollectionEntriesQuery =
        useFavoriteCollectionEntriesForUserId(userId, 0, limit);
    const gamesIds = favoriteCollectionEntriesQuery.data?.data.map(
        (entry) => entry.gameId,
    );
    const gamesQuery = useGames({
        gameIds: gamesIds || [],
        relations: {
            cover: true,
        },
    });

    const isLoading =
        favoriteCollectionEntriesQuery.isLoading || gamesQuery.isLoading;

    const isError =
        favoriteCollectionEntriesQuery.isError || gamesQuery.isError;

    const isEmpty =
        favoriteCollectionEntriesQuery.data == undefined ||
        favoriteCollectionEntriesQuery.data.data.length === 0 ||
        gamesQuery.data == undefined ||
        gamesQuery.data.length === 0;

    if (isLoading) {
        return <CenteredLoading />;
    } else if (isEmpty) {
        return (
            <CenteredErrorMessage
                message={"This user has no public favorite games."}
            />
        );
    } else if (isError) {
        return (
            <CenteredErrorMessage
                message={"We couldn't fetch this data. Please try again."}
            />
        );
    }
    return (
        <SimpleGrid cols={onMobile ? 3 : 5} w={"100%"}>
            {gamesQuery.data?.map((game) => {
                return <GameGridItem key={game.id} game={game} />;
            })}
        </SimpleGrid>
    );
};

export default ProfileFavoriteGames;
