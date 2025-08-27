import React, { useMemo } from "react";
import {
  GamePostEditor,
  InfiniteLoaderChildren,
  useOnMobilePlatform,
} from "#@/components";
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
}

const PostsFeed = ({ criteria, targetedPostId, children }: Props) => {
  const postsFeedQuery = useInfinitePostsFeed({
    criteria,
    limit: 20,
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
      <GamePostEditor />
      {postsFeedQuery.data && <PostsList items={items} />}
      {children({
        fetchNextPage: async () => {
          await postsFeedQuery.fetchNextPage();
        },
        isFetching: postsFeedQuery.isFetching,
        hasNextPage: postsFeedQuery.hasNextPage,
      })}
    </Stack>
  );
};

export { PostsFeed };
