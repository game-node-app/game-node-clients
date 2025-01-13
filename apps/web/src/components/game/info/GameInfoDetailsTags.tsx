import React, { ReactElement, ReactNode, useMemo } from "react";
import { Game } from "@/wrapper/server";
import { getGameGenres } from "@/components/game/util/getGameGenres";
import { getGameThemes } from "@/components/game/util/getGameThemes";
import { Badge, Group, Skeleton } from "@mantine/core";
import { getGameModes } from "@/components/game/util/getGameModes";
import { getGamePerspectives } from "@/components/game/util/getGamePerspectives";
import { shuffleArray } from "@/util/shuffleArray";
import { DetailsBox } from "@/components/general/DetailsBox";
import { useGame } from "@/components/game/hooks/useGame";
import CenteredLoading from "@/components/general/CenteredLoading";
import Link from "next/link";
import { DEFAULT_GAME_INFO_VIEW_DTO } from "@/components/game/info/GameInfoView";

interface TagBuilderElement {
    id: number;
    category: string;
    name: string;
}

const getGameTags = (game?: Game): TagBuilderElement[] => {
    if (!game) return [];
    const tagsElements: any[] = [];

    const genres = game?.genres;
    const themes = game?.themes;
    const modes = game?.gameModes;
    const perspectives = game?.playerPerspectives;

    tagsElements.push(
        genres?.map((genre): TagBuilderElement => {
            return {
                category: "genres",
                name: genre.name!,
                id: genre.id,
            };
        }),
    );
    tagsElements.push(
        themes?.map(
            (theme): TagBuilderElement => ({
                category: "themes",
                id: theme.id,
                name: theme.name!,
            }),
        ),
    );
    tagsElements.push(
        modes?.map(
            (mode): TagBuilderElement => ({
                category: "gameModes",
                id: mode.id,
                name: mode.name!,
            }),
        ),
    );
    tagsElements.push(
        perspectives?.map(
            (perspective): TagBuilderElement => ({
                category: "playerPerspectives",
                id: perspective.id,
                name: perspective.name!,
            }),
        ),
    );

    return tagsElements.flat();
};

interface IProps {
    gameId: number | undefined;
}

/**
 * Component that shows tags (badges) of a game's genres, themes, modes, etc.
 * @param game
 * @constructor
 */
const GameInfoDetailsTags = ({ gameId }: IProps) => {
    const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);
    const game = gameQuery.data;

    const badges: ReactNode[] | null = useMemo(() => {
        if (!game) return null;

        const tags = getGameTags(game);

        return tags
            .filter((tag) => tag != undefined)
            .map((tag) => {
                return (
                    <Link
                        key={`tag-${tag.category}-${tag.id}`}
                        href={`/explore?${tag.category}=${tag.id}`}
                    >
                        <Badge>{tag.name}</Badge>
                    </Link>
                );
            });
    }, [game]);

    return (
        <DetailsBox withBorder withDimmedTitle title={"Tags"}>
            <Group justify={"start"} gap={10}>
                {gameQuery.isLoading && (
                    <Skeleton className={"w-10/12 lg:w-4/12 h-4"}></Skeleton>
                )}
                {badges}
            </Group>
        </DetailsBox>
    );
};

export default GameInfoDetailsTags;
