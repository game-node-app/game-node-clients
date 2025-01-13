import React, { useMemo } from "react";
import { useGame } from "@/components/game/hooks/useGame";
import { DetailsBox } from "@/components/general/DetailsBox";
import { Skeleton, Text } from "@mantine/core";
import CenteredLoading from "@/components/general/CenteredLoading";
import { DEFAULT_GAME_INFO_VIEW_DTO } from "@/components/game/info/GameInfoView";

interface IProps {
    gameId: number;
}

const GameInfoDetailsDeveloperInfo = ({ gameId }: IProps) => {
    const game = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);
    const involvedCompanies = game.data?.involvedCompanies;
    const developers = useMemo(() => {
        const hasDevelopers =
            involvedCompanies != undefined &&
            involvedCompanies.some((company) => company.developer);
        if (hasDevelopers) {
            return involvedCompanies
                .filter((ic) => ic.developer)
                .map((ic) => ic.company);
        }
        return null;
    }, [involvedCompanies]);
    const publishers = useMemo(() => {
        const hasPublishers =
            involvedCompanies != undefined &&
            involvedCompanies.some((company) => company.publisher);

        if (hasPublishers) {
            return involvedCompanies
                .filter((ic) => ic.publisher)
                .map((ic) => ic.company);
        }
        return null;
    }, [involvedCompanies]);
    const developersNames =
        developers?.map((company) => company.name)?.join(", ") ??
        "Not available";
    const publishersNames =
        publishers?.map((company) => company.name).join(", ") ??
        "Not available";

    return (
        <>
            <DetailsBox withBorder withDimmedTitle title={"Developer(s)"}>
                {game.isLoading ? (
                    <Skeleton className={"w-64 h-4"} />
                ) : (
                    developersNames
                )}
            </DetailsBox>
            <DetailsBox withBorder withDimmedTitle title={"Publisher(s)"}>
                {game.isLoading ? (
                    <Skeleton className={"w-64 h-4"} />
                ) : (
                    publishersNames
                )}
            </DetailsBox>
        </>
    );
};

export default GameInfoDetailsDeveloperInfo;
