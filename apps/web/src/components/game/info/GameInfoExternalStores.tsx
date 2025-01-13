import React, { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GameRepositoryService } from "@/wrapper/server";
import {
    Group,
    GroupProps,
    Image,
    ImageProps,
    Skeleton,
    Tooltip,
} from "@mantine/core";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { useGameExternalStores } from "@/components/game/hooks/useGameExternalStores";

interface Props extends GroupProps {
    gameId: number;
    iconsProps?: ImageProps;
}

const GameInfoExternalStores = ({ gameId, iconsProps, ...others }: Props) => {
    const onMobile = useOnMobile();
    const externalStoresQuery = useGameExternalStores(gameId);

    const buildIconsSkeletons = useCallback(() => {
        return new Array(4).fill(0).map((_, i) => {
            return <Skeleton key={i} className={"h-[40px] w-[56px]"} />;
        });
    }, []);
    const externalStoreItems: React.ReactNode[] | null = useMemo(() => {
        const externalStores = externalStoresQuery.data;
        if (!externalStores) return null;
        const storeElements: React.ReactNode[] = externalStores
            .map((externalStore) => {
                if (externalStore.icon == undefined) return null;
                return (
                    <a
                        key={externalStore.id}
                        href={externalStore.url}
                        target={"_blank"}
                    >
                        <Tooltip label={externalStore.storeName}>
                            <Image
                                w={42}
                                alt={
                                    externalStore.storeName || "External store"
                                }
                                src={getServerStoredIcon(externalStore.icon)}
                                {...iconsProps}
                            />
                        </Tooltip>
                    </a>
                );
            })
            .filter((element) => element != undefined);
        return storeElements;
    }, [externalStoresQuery.data, iconsProps]);

    const isEmpty =
        !externalStoresQuery.isLoading && externalStoreItems == undefined;

    return (
        <Group
            wrap={"wrap"}
            w={"100%"}
            justify={onMobile ? "center" : "start"}
            {...others}
        >
            {externalStoresQuery.isLoading
                ? buildIconsSkeletons()
                : externalStoreItems}
            {isEmpty && "Not available"}
        </Group>
    );
};

export default GameInfoExternalStores;
