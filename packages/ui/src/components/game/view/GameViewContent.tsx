import React, { PropsWithChildren, useContext, useMemo } from "react";
import { Box, Divider, SimpleGrid, SimpleGridProps } from "@mantine/core";
import { GameViewContext } from "#@/components/game/view/GameView";
import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { GameListItem } from "#@/components/game/figure/GameListItem";
import { TGameOrSearchGame } from "#@/components/game/util/types";

export interface GameViewContentProps
  extends PropsWithChildren<SimpleGridProps> {
  items: TGameOrSearchGame[] | undefined;
}

const GameViewContent = ({
  items,
  children,
  ...others
}: GameViewContentProps) => {
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
        base: layout === "list" ? 1 : 3,
        lg: layout === "list" ? 1 : 5,
      }}
      w={"100%"}
      {...others}
    >
      {columns}
      {children}
    </SimpleGrid>
  );
};

export { GameViewContent };
