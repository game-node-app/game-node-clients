import React, { useCallback, useMemo } from "react";
import {
    Group,
    GroupProps,
    Image,
    ImageProps,
    Popover,
    Skeleton,
    Text,
} from "@mantine/core";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import { getGamePlatformInfo } from "@/components/game/util/getGamePlatformInfo";
import { useGame } from "@/components/game/hooks/useGame";
import { useQuery } from "@tanstack/react-query";
import { GameRepositoryService } from "@/wrapper/server";
import { sleep } from "@/util/sleep";
import { DEFAULT_GAME_INFO_VIEW_DTO } from "@/components/game/info/GameInfoView";

interface IGameInfoPlatformsProps extends GroupProps {
    gameId: number | undefined;
    iconsProps?: ImageProps;
}

const GameInfoPlatforms = ({
    gameId,
    iconsProps,
    ...others
}: IGameInfoPlatformsProps) => {
    const onMobile = useOnMobile();
    const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);
    const iconsQuery = useQuery({
        queryKey: ["game", "platform", "icon", gameId],
        queryFn: async () => {
            if (!gameId) return null;
            try {
                return GameRepositoryService.gameRepositoryControllerGetIconNamesForPlatformAbbreviationsV1(
                    gameId,
                );
            } catch (e) {
                console.error(e);
                return [];
            }
        },
    });

    const buildIconsSkeletons = useCallback(() => {
        return new Array(4).fill(0).map((_, i) => {
            return <Skeleton key={i} className={"h-[40px] w-[56px]"} />;
        });
    }, []);

    const icons = useMemo(() => {
        const icons = iconsQuery.data;
        if (!icons) return null;
        return icons.map((icon) => {
            return (
                <Image
                    key={icon}
                    w={60}
                    alt={icon}
                    src={getServerStoredIcon(icon)}
                    {...iconsProps}
                />
            );
        });
    }, [iconsProps, iconsQuery.data]);

    const isEmpty = icons == undefined || icons.length === 0;
    const platformInfo = getGamePlatformInfo(gameQuery.data);
    const platformsNames = platformInfo.platformsAbbreviations?.join(", ");
    return (
        <Popover shadow={"md"}>
            <Popover.Target>
                <Group
                    w={"100%"}
                    justify={onMobile ? "center" : "start"}
                    wrap={"wrap"}
                    {...others}
                >
                    {iconsQuery.isLoading ? buildIconsSkeletons() : icons}
                    {!iconsQuery.isLoading && isEmpty && "Not available"}
                </Group>
            </Popover.Target>
            <Popover.Dropdown>
                <Text fz={"sm"}>{platformsNames ?? "Not available"}</Text>
            </Popover.Dropdown>
        </Popover>
    );
};

export default GameInfoPlatforms;
