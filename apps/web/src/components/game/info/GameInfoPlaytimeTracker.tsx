import React, { useMemo } from "react";
import useUserId from "@/components/auth/hooks/useUserId";
import { DetailsBox } from "@/components/general/DetailsBox";
import { Group, Stack, Text } from "@mantine/core";
import { usePlaytimeForGame } from "@/components/playtime/hooks/usePlaytimeForGame";
import UserPlaytimeItem from "@/components/playtime/UserPlaytimeItem";

interface Props {
    gameId: number;
}

const GameInfoPlaytimeTracker = ({ gameId }: Props) => {
    const userId = useUserId();

    const playtimeQuery = usePlaytimeForGame(userId, gameId);

    const playtimes = playtimeQuery.data;

    const items = useMemo(() => {
        return playtimes?.map((playtime) => (
            <UserPlaytimeItem
                key={playtime.id}
                playtime={playtime}
                withBackground={false}
                withTitle={false}
            />
        ));
    }, [playtimes]);

    if (playtimes == undefined || playtimes.length === 0) {
        return null;
    }

    return (
        <DetailsBox withBorder withDimmedTitle title={"Your play sessions"}>
            <Stack className={"w-full"}>{items}</Stack>
        </DetailsBox>
    );
};

export default GameInfoPlaytimeTracker;
