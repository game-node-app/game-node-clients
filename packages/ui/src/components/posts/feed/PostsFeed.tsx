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
      {withEditor && (
        <GamePostEditor
          withEnableButton
          enabled={editorEnabled}
          onEnabledChange={setEditorEnabled}
        />
      )}
      {postsFeedQuery.data && <PostsList items={items} />}
      {postsFeedQuery.isPending && <PostsFeedSkeleton />}
      {postsFeedQuery.data && items.length === 0 && (
        <PostsFeedEmpty
          onCreate={withEditor ? () => setEditorEnabled(true) : undefined}
        />
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
