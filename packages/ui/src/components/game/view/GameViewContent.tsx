import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
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
  const gameViewContext = useContext(GameViewContext);
  const { layout, cols } = gameViewContext;

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

  useEffect(() => {
    if (gameViewContext == null) {
      throw new Error("GameViewContent must be used within a GameView");
    }
  }, [gameViewContext]);

  return (
    <SimpleGrid id={"game-view-content"} cols={cols} w={"100%"} {...others}>
      {columns}
      {children}
    </SimpleGrid>
  );
};

export { GameViewContent };
