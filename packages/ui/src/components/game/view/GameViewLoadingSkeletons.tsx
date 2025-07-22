import React, { useMemo } from "react";
import { Skeleton } from "@mantine/core";

export interface GameViewLoadingSkeletonsProps {
  count?: number;
  isVisible: boolean;
}

/**
 * Renders game cover-like loading skeletons. Should be used as children of {@link GameViewContent}.
 * @param count
 * @param isVisible
 * @constructor
 */
const GameViewLoadingSkeletons = ({
  count = 6,
  isVisible,
}: GameViewLoadingSkeletonsProps) => {
  return useMemo(() => {
    if (!isVisible) return null;

    return new Array(count).fill(0).map((_, i) => {
      return <Skeleton key={i} className={"w-full h-36 lg:h-52"} />;
    });
  }, [count, isVisible]);
};

export { GameViewLoadingSkeletons };
