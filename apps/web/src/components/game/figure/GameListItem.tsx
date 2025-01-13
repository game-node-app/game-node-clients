import React, { PropsWithChildren, useMemo, useState } from "react";
import {
    AspectRatio,
    Box,
    Group,
    Stack,
    Text,
    Title,
    Badge,
    Flex,
} from "@mantine/core";
import GameFigureImage, {
    IGameFigureProps,
} from "@/components/game/figure/GameFigureImage";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import Link from "next/link";
import { getLocalizedFirstReleaseDate } from "@/components/game/util/getLocalizedFirstReleaseDate";
import { TGameOrSearchGame } from "@/components/game/util/types";
import { getGameGenres } from "@/components/game/util/getGameGenres";
import { getGamePlatformInfo } from "@/components/game/util/getGamePlatformInfo";
import { getGameCategoryName } from "@/components/game/util/getGameCategoryName";
import GameInfoPlatforms from "@/components/game/info/GameInfoPlatforms";
import GameFigureWithQuickAdd from "@/components/game/figure/GameFigureWithQuickAdd";

interface IGameListFigureProps {
    game: TGameOrSearchGame;
    figureProps?: Partial<IGameFigureProps>;
    /**
     * If quick add functionality should be enabled. Checks will still be performed to see if
     * it's possible to show the game add modal.
     */
    withQuickAdd?: boolean;
}

const GameListItem = ({
    game,
    figureProps,
    withQuickAdd = true,
}: IGameListFigureProps) => {
    let name = game.name ?? "Unknown";
    const onMobile = useOnMobile();
    if (onMobile) {
        if (name.length > 30) {
            name = name.substring(0, 30) + "...";
        }
    }

    const genres = getGameGenres(game);
    const genreNames = genres?.join(", ");

    const Figure = withQuickAdd ? GameFigureWithQuickAdd : GameFigureImage;

    return (
        <Group
            justify={"center"}
            align={"start"}
            w={"100%"}
            h={"100%"}
            wrap={"nowrap"}
        >
            <Box className="h-auto w-2/5 lg:w-1/6">
                <Figure
                    game={game}
                    href={`/game/${game.id}`}
                    imageProps={{
                        styles: {
                            root: {
                                alignItems: "baseline !important",
                                justifyContent: "start !important",
                            },
                        },
                    }}
                    {...figureProps}
                />
            </Box>
            <Stack
                h={"100%"}
                className="w-2/4 ms-2 !grow"
                align={"start"}
                justify="start"
            >
                <Stack gap={"xs"}>
                    <Link href={`/game/${game.id}`}>
                        <Title size="h4" className="font-bold">
                            {name}
                        </Title>
                    </Link>
                    <Text size="sm" className="text-gray-500">
                        {getLocalizedFirstReleaseDate(
                            game.firstReleaseDate,
                            undefined,
                        )}
                    </Text>
                </Stack>
                <Flex className={"w-full"}>
                    <GameInfoPlatforms
                        gameId={game.id}
                        justify={"start"}
                        iconsProps={{
                            w: 28,
                        }}
                    />
                </Flex>

                <Text size="sm" c={"dimmed"}>
                    {genreNames}
                </Text>
            </Stack>
        </Group>
    );
};

export default GameListItem;
