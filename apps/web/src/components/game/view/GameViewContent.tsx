import React, { PropsWithChildren, useContext, useMemo } from "react";
import { Box, Divider, SimpleGrid, SimpleGridProps } from "@mantine/core";
import { GameViewContext } from "@/components/game/view/GameView";
import GameGridItem from "@/components/game/figure/GameGridItem";
import GameListItem from "@/components/game/figure/GameListItem";
import { TGameOrSearchGame } from "@/components/game/util/types";
import { ImageSize } from "@/components/game/util/getSizedImageUrl";
import { SearchGame } from "@/components/game/search/utils/types";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { Game } from "@/wrapper/server";

interface IMetadataGridContentProps extends PropsWithChildren<SimpleGridProps> {
    items: TGameOrSearchGame[] | undefined;
}

const GameViewContent = ({
    items,
    children,
    ...others
}: IMetadataGridContentProps) => {
    const onMobile = useOnMobile();
    const { layout } = useContext(GameViewContext);
    const columns = useMemo(() => {
        if (items == null || items.length === 0) {
            return null;
        }
        return items.map((item) => {
            if (layout === "list") {
                return (
                    <Box w={"100%"} key={item.id}>
                        <GameListItem game={item} />
                        <Divider mt={"xs"} variant={"dashed"} />
                    </Box>
                );
            }

            return <GameGridItem key={item.id} game={item} />;
        });
    }, [items, layout]);

    return (
        <SimpleGrid
            id={"game-view-content"}
            cols={{
                base: layout === "list" ? 1 : 2,
                lg: layout === "list" ? 1 : 5,
            }}
            w={"100%"}
            h={"100%"}
            {...others}
        >
            {columns}
            {children}
        </SimpleGrid>
    );
};

export default GameViewContent;
