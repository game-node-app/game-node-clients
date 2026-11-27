import React from "react";

export interface InfiniteLoaderProps {
  fetchNextPage: () => Promise<void>;
  isFetching: boolean;
  hasNextPage: boolean;
  /**
   * How far outside the viewport the loader starts fetching (IntersectionObserver
   * `rootMargin`). Widening it on feed-like lists hides the request latency.
   */
  rootMargin?: string;
}

export type InfiniteLoaderChildren = (
  props: InfiniteLoaderProps,
) => React.ReactNode;
