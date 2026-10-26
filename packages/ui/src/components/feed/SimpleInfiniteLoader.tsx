import React, { useEffect, useRef } from "react";
import { CenteredLoading, InfiniteLoaderProps } from "#@/components";
import { useIntersection } from "@mantine/hooks";

const SimpleInfiniteLoader = ({
  hasNextPage,
  isFetching,
  fetchNextPage,
}: InfiniteLoaderProps) => {
  const { ref, entry } = useIntersection({
    threshold: 0.5,
  });
  const handledEntry = useRef<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    // Minimum amount of time (ms) since document creation for
    // intersection to be considered valid
    const minimumIntersectionTime = 500;
    const bounds = entry?.rootBounds;
    const rect = entry?.target.getBoundingClientRect();

    if (
      hasNextPage &&
      !isFetching &&
      entry?.isIntersecting &&
      entry.time > minimumIntersectionTime &&
      entry !== handledEntry.current &&
      (!bounds ||
        (rect &&
          rect.bottom >= bounds.top &&
          rect.top <= bounds.bottom &&
          rect.right >= bounds.left &&
          rect.left <= bounds.right))
    ) {
      handledEntry.current = entry;
      fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage, isFetching]);

  return (
    <div ref={ref} id={"last-element-tracker"}>
      {isFetching && <CenteredLoading />}
    </div>
  );
};

export { SimpleInfiniteLoader };
