import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DetailsBox } from "@/components/general/DetailsBox";
import GameInfoPlaytimeItem from "@/components/game/info/playtime/GameInfoPlaytimeItem";
import { Space, Stack, Text } from "@mantine/core";
import CenteredLoading from "@/components/general/CenteredLoading";
import { PlaytimeService } from "@/wrapper/server";

interface Props {
    gameId: number;
}

const GameInfoPlaytime = ({ gameId }: Props) => {
    const playtimeQuery = useQuery({
        queryKey: ["game", "playtime", gameId],
        queryFn: () => {
            return PlaytimeService.playtimeControllerFindOneByGameIdV1(gameId);
        },
        enabled: !!gameId,
        staleTime: Infinity,
        retry: false,
    });
    const playtime = playtimeQuery.data;
    return (
        <DetailsBox
            title={"Playtime"}
            withBorder
            withDimmedTitle
            stackProps={{
                gap: 1,
            }}
            enabled={playtimeQuery.isLoading || playtimeQuery.isSuccess}
        >
            <Space h={"0.8rem"} />
            <GameInfoPlaytimeItem name={"Main"} isLoading={playtimeQuery.isLoading} value={playtime?.timeMain} />
            <GameInfoPlaytimeItem
                name={"Main + Extras"}
                isLoading={playtimeQuery.isLoading}
                value={playtime?.timePlus}
            />
            <GameInfoPlaytimeItem name={"100%"} isLoading={playtimeQuery.isLoading} value={playtime?.time100} />
            <Text className={"text-center text-xs mt-4"} c={"dimmed"}>
                Data provided by <a href={"https://howlongtobeat.com"}>HLTB</a>
            </Text>
        </DetailsBox>
    );
};

export default GameInfoPlaytime;
