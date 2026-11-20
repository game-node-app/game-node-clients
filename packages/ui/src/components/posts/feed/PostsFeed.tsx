import { GamePostEditor, InfiniteLoaderProps } from "#@/components";
import {
  PostsFeedCriteria,
  useInfinitePostsFeed,
} from "#@/components/posts/hooks/useInfinitePostsFeed.ts";
import {
  PostsFeedEmpty,
  PostsFeedSkeleton,
} from "#@/components/posts/feed/PostsFeedStates.tsx";
import { PostsList } from "#@/components/posts/PostsList.tsx";
import { Stack } from "@mantine/core";
import { type ReactNode, useMemo, useState } from "react";

export interface PostsFeedChildrenProps extends InfiniteLoaderProps {
  /** Reveals the post editor, same as the "Create" button above the feed. */
  openEditor: () => void;
}

interface Props {
  criteria: PostsFeedCriteria;
  children: (props: PostsFeedChildrenProps) => ReactNode;
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
  const [editorEnabled, setEditorEnabled] = useState(false);
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
      <GamePostEditor
        withEnableButton
        enabled={editorEnabled}
        onEnabledChange={setEditorEnabled}
      />
      {postsFeedQuery.data && <PostsList items={items} />}
      {postsFeedQuery.isPending && <PostsFeedSkeleton />}
      {postsFeedQuery.data && items.length === 0 && (
        <PostsFeedEmpty onCreate={() => setEditorEnabled(true)} />
      )}
      {children({
        fetchNextPage: async () => {
          if (hardLimit != undefined) return;
          await postsFeedQuery.fetchNextPage();
        },
        isFetching: postsFeedQuery.isFetching,
        hasNextPage: postsFeedQuery.hasNextPage,
        openEditor: () => setEditorEnabled(true),
      })}
    </Stack>
  );
};

export { PostsFeed };
