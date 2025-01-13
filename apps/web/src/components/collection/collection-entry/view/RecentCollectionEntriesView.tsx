import React, { useMemo } from "react";
import useCollectionEntriesForUserId from "@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import GameView from "@/components/game/view/GameView";
import { useGames } from "@/components/game/hooks/useGames";
import CenteredLoading from "@/components/general/CenteredLoading";

interface Props {
    userId: string;
    offset?: number;
    limit?: number;
}

const RecentCollectionEntriesView = ({
    userId,
    offset = 0,
    limit = 12,
}: Props) => {
    const collectionEntriesQuery = useCollectionEntriesForUserId(
        userId as string,
        offset,
        limit,
    );

    const gameIds = useMemo(() => {
        return collectionEntriesQuery.data?.data?.map((entry) => entry.gameId);
    }, [collectionEntriesQuery]);

    const gamesQuery = useGames({
        gameIds: gameIds,
        relations: {
            cover: true,
        },
    });

    const games = gamesQuery.data;

    if (gamesQuery.isLoading || collectionEntriesQuery.isLoading) {
        return <CenteredLoading message={"Fetching games..."} />;
    }
    return (
        <GameView layout={"grid"}>
            <GameView.Content items={games} />
        </GameView>
    );
};

export default RecentCollectionEntriesView;
