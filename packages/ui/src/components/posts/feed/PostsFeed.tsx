import React, { useMemo } from "react";
import { GamePostEditor, InfiniteLoaderChildren } from "#@/components";
import { Stack } from "@mantine/core";
import {
  PostsFeedCriteria,
  useInfinitePostsFeed,
} from "#@/components/posts/hooks/useInfinitePostsFeed.ts";
import { PostsList } from "#@/components/posts/PostsList.tsx";

interface Props {
  criteria: PostsFeedCriteria;
  children: InfiniteLoaderChildren;
  /**
   * This post will appear on top
   */
  targetedPostId?: string;
  limit?: number;
  /**
   * If set, the feed will be limited to this number of posts.
   * Pagination will be disabled if this is set.
   */
  hardLimit?: number;
}

const PostsFeed = ({
  criteria,
  targetedPostId,
  limit = 20,
  hardLimit,
  children,
}: Props) => {
  const postsFeedQuery = useInfinitePostsFeed({
    criteria,
    limit: hardLimit ?? limit,
    postId: targetedPostId,
  });
  const items = useMemo(() => {
    if (postsFeedQuery.data == undefined) {
      return [];
    }
    return postsFeedQuery.data?.pages.flatMap((page) => page.data);
  }, [postsFeedQuery.data]);

  return (
    <Stack>
      <GamePostEditor withEnableButton />
      {postsFeedQuery.data && <PostsList items={items} />}
      {children({
        fetchNextPage: async () => {
          if (hardLimit != undefined) return;
          await postsFeedQuery.fetchNextPage();
        },
        isFetching: postsFeedQuery.isFetching,
        hasNextPage: postsFeedQuery.hasNextPage,
      })}
    </Stack>
  );
};

export { PostsFeed };
