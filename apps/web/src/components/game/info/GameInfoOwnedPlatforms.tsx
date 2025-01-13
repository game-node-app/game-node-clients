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
import {
    CollectionsEntriesService,
    GameRepositoryService,
} from "@/wrapper/server";
import { useOwnCollectionEntryForGameId } from "@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";

interface IGameInfoOwnedPlatformsProps extends GroupProps {
    gameId: number | undefined;
    iconsProps?: ImageProps;
}

const GameInfoOwnedPlatforms = ({
    gameId,
    iconsProps,
    ...others
}: IGameInfoOwnedPlatformsProps) => {
    const onMobile = useOnMobile();
    const collectionEntry = useOwnCollectionEntryForGameId(gameId);
    const iconsQuery = useQuery({
        queryKey: [
            "game",
            "owned-platforms",
            "icon",
            gameId,
            collectionEntry.data?.id,
        ],
        queryFn: async () => {
            if (!collectionEntry.data) return [];
            if (!gameId) return [];
            try {
                return await CollectionsEntriesService.collectionsEntriesControllerGetIconsForOwnedPlatformsV1(
                    collectionEntry.data.id,
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
    const platformsNames = collectionEntry.data?.ownedPlatforms
        .map((platform) => {
            return platform.abbreviation;
        })
        .join(", ");
    return (
        <Popover shadow={"md"}>
            <Popover.Target>
                <Group
                    w={"100%"}
                    justify={onMobile ? "center" : "start"}
                    wrap={"wrap"}
                    {...others}
                >
                    {!iconsQuery.isLoading && isEmpty && "Not available"}
                    {iconsQuery.isLoading ? buildIconsSkeletons() : icons}
                </Group>
            </Popover.Target>
            <Popover.Dropdown>
                <Text fz={"sm"}>{platformsNames ?? "Not available"}</Text>
            </Popover.Dropdown>
        </Popover>
    );
};

export default GameInfoOwnedPlatforms;
