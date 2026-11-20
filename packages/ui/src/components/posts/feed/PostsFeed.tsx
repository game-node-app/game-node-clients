import { GamePostEditor, InfiniteLoaderChildren } from "#@/components";
import {
  PostsFeedCriteria,
  useInfinitePostsFeed,
} from "#@/components/posts/hooks/useInfinitePostsFeed.ts";
import { PostsList } from "#@/components/posts/PostsList.tsx";
import { Stack } from "@mantine/core";
import { useMemo } from "react";

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
  /**
   * Whether the inline create editor is rendered above the posts. Theme packs
   * that open the editor from their own control pass `false`.
   */
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
