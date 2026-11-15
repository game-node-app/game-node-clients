import { GameFigureProps } from "#@/components";
import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { GameListItem } from "#@/components/game/figure/GameListItem";
import { TGameOrSearchGame } from "#@/components/game/util/types";
import { GameViewContext } from "#@/components/game/view/GameView";
import { Box, Divider, SimpleGrid, SimpleGridProps } from "@mantine/core";
import { PropsWithChildren, useContext, useEffect, useMemo } from "react";

export interface GameViewContentProps
  extends PropsWithChildren<SimpleGridProps> {
  items: TGameOrSearchGame[] | undefined;
  figureProps?: GameFigureProps;
}

const GameViewContent = ({
  items,
  children,
  figureProps,
  ...others
}: GameViewContentProps) => {
  const gameViewContext = useContext(GameViewContext);
  const { layout, cols } = gameViewContext;

  const columns = useMemo(() => {
    if (items == null || items.length === 0) {
      return null;
    }

    return items.map((item, index) => {
      // Entrance: each item fades up, staggered by position (capped so long lists don't lag).
      // Keyed by game id, so only newly mounted items animate (pagination, infinite scroll).
      const animationProps = {
        className: "motion-safe:animate-gn-fade-up",
        style: { animationDelay: `${Math.min(index, 12) * 40}ms` },
      };

      if (layout === "list") {
        return (
          <Box w={"100%"} key={item.id} {...animationProps}>
            <GameListItem game={item} figureProps={figureProps} />
            <Divider mt={"xs"} variant={"dashed"} />
          </Box>
        );
      }

      return (
        <div key={item.id} {...animationProps}>
          <GameGridItem game={item} figureProps={figureProps} />
        </div>
      );
    });
  }, [figureProps, items, layout]);

  useEffect(() => {
    if (gameViewContext == null) {
      throw new Error("GameViewContent must be used within a GameView");
    }
  }, [gameViewContext]);

  return (
    <SimpleGrid
      id={"game-view-content"}
      cols={layout === "list" ? 1 : cols}
      w={"100%"}
      {...others}
    >
      {columns}
      {children}
    </SimpleGrid>
  );
};

export { GameViewContent };