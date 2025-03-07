import React, { useEffect } from "react";
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

  useEffect(() => {
    // Minimum amount of time (ms) since document creation for
    // intersection to be considered valid
    const minimumIntersectionTime = 500;

    if (
      hasNextPage &&
      entry?.isIntersecting &&
      entry.time > minimumIntersectionTime
    ) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage, hasNextPage]);

  return (
    <div ref={ref} id={"last-element-tracker"}>
      {isFetching && <CenteredLoading />}
    </div>
  );
};

export { SimpleInfiniteLoader };
