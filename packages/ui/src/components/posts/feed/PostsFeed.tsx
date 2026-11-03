import {
  GamePostEditor,
  InfiniteLoaderChildren,
  useUserId,
} from "#@/components";
import type { PostsFeedTabValue } from "#@/components/posts/feed/PostsFeedLayout.tsx";
import { useInfinitePosts } from "#@/components/posts/hooks/useInfinitePosts.ts";
import { useInfinitePostsFeed } from "#@/components/posts/hooks/useInfinitePostsFeed.ts";
import { PostsList } from "#@/components/posts/PostsList.tsx";
import { Stack } from "@mantine/core";
import { useMemo } from "react";

interface Props {
  criteria: PostsFeedTabValue;
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
  withEditor?: boolean;
}

const PostsFeed = ({
  criteria,
  targetedPostId,
  limit = 20,
  hardLimit,
  withEditor = true,
  children,
}: Props) => {
  const userId = useUserId();
  const isOwn = criteria === "mine";

  const feedQuery = useInfinitePostsFeed({
    criteria: isOwn ? "all" : criteria,
    limit: hardLimit ?? limit,
    postId: targetedPostId,
    enabled: !isOwn,
  });
  const ownQuery = useInfinitePosts({
    profileUserId: userId,
    limit: hardLimit ?? limit,
    enabled: isOwn && userId != undefined,
  });
  const postsFeedQuery = isOwn ? ownQuery : feedQuery;

  const items = useMemo(() => {
    if (postsFeedQuery.data == undefined) {
      return [];
    }
    return postsFeedQuery.data?.pages.flatMap((page) => page.data);
  }, [postsFeedQuery.data]);

  return (
    <Stack>
      {withEditor && <GamePostEditor withEnableButton />}
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
