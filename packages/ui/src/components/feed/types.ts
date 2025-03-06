import React from "react";

export interface InfiniteLoaderProps {
  fetchNextPage: () => Promise<void>;
  isFetching: boolean;
  hasNextPage: boolean;
}

export type InfiniteLoaderChildren = (
  props: InfiniteLoaderProps,
) => React.ReactNode;
