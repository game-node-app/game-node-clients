import React, { useContext, useMemo } from "react";
import { Skeleton } from "@mantine/core";
import { GameViewContext, useOnMobile } from "#@/components";
import { cn } from "#@/util/cn.ts";

export interface GameViewLoadingSkeletonsProps {
  isVisible: boolean;
  /**
   * This makes the loading skeletons "fill" the remainder of the last row before rendering more itens.
   * This should be the total itens actually rendered by {@link GameViewContent}
   */
  itemCount?: number;
}

/**
 * Renders game cover-like loading skeletons. Should be used as children of {@link GameViewContent}.
 * @param count
 * @param isVisible
 * @constructor
 */
const GameViewLoadingSkeletons = ({
  isVisible,
  itemCount = 0,
}: GameViewLoadingSkeletonsProps) => {
  const onMobile = useOnMobile();
  const { layout, cols } = useContext(GameViewContext);

  const colsPerRow =
    layout === "list" ? 1 : onMobile ? (cols.base ?? 3) : (cols.lg ?? 5);

  const count = useMemo(() => {
    if (layout === "list") return 4;

    const remainder = itemCount % colsPerRow;
    const remainingInRow = (colsPerRow - remainder) % colsPerRow;

    return remainingInRow + colsPerRow * 3;
  }, [layout, itemCount, colsPerRow]);

  return useMemo(() => {
    if (!isVisible) return null;

    return Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn("w-full h-24 xs:h-32 md:h-40 lg:h-52", {
          "col-span-full": layout === "list",
          "aspect-square": layout === "grid",
        })}
      />
    ));
  }, [count, isVisible, layout]);
};

export { GameViewLoadingSkeletons };
