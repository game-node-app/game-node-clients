import React from "react";
import { SimpleGrid, Stack } from "@mantine/core";
import { Game } from "@/wrapper/server";
import { getLocalizedFirstReleaseDate } from "@/components/game/util/getLocalizedFirstReleaseDate";
import { DetailsBox } from "@/components/general/DetailsBox";
import GameInfoPlatforms from "@/components/game/info/GameInfoPlatforms";
import GameInfoDetailsDeveloperInfo from "@/components/game/info/GameInfoDetailsDeveloperInfo";
import GameInfoDetailsTags from "@/components/game/info/GameInfoDetailsTags";
import GameInfoPlaytime from "@/components/game/info/playtime/GameInfoPlaytime";
import GameInfoExternalStores from "@/components/game/info/GameInfoExternalStores";
import GameInfoScore from "./GameInfoScore";

interface IGameInfoDetailsProps {
    game: Game | undefined;
}

const GameInfoDetails = ({ game }: IGameInfoDetailsProps) => {
    if (!game) {
        return null;
    }

    return (
        <Stack align={"start"} justify={"start"} gap={"0.5rem"} w={"100%"}>
            <SimpleGrid cols={{ base: 1, lg: 2 }} w={"100%"}>
                <DetailsBox withBorder withDimmedTitle title={"Launch date"}>
                    {getLocalizedFirstReleaseDate(game.firstReleaseDate) ?? "Not available"}
                </DetailsBox>
                <GameInfoDetailsDeveloperInfo gameId={game.id} />
                <GameInfoDetailsTags gameId={game.id} />
                <DetailsBox title={"Where to play"} withBorder withDimmedTitle>
                    <GameInfoPlatforms gameId={game.id} className={"my-4 gap-5"} />
                </DetailsBox>
                <DetailsBox title={"Where to buy"} withBorder withDimmedTitle>
                    <GameInfoExternalStores gameId={game.id} className={"my-4 gap-5"} />
                </DetailsBox>
                <DetailsBox withBorder withDimmedTitle title={"Summary"}>
                    {game.summary ?? "Not available"}
                </DetailsBox>
                <GameInfoScore gameId={game.id} />
                <GameInfoPlaytime gameId={game.id} />
            </SimpleGrid>
        </Stack>
    );
};

export default GameInfoDetails;
