import { PostsFeed } from "#@/components/posts/feed/PostsFeed";
import {
  PostsFeedLayout,
  type PostsFeedTabValue,
} from "#@/components/posts/feed/PostsFeedLayout";
import type { InfiniteLoaderChildren } from "#@/components/feed/types";

export interface PostsFeedViewProps {
  currentTab: PostsFeedTabValue;
  onTabChange: (value: PostsFeedTabValue) => void;
  /** Post opened from a link; the feed shows it on top. */
  targetedPostId?: string;
  /** Platform loader (web infinite button, mobile IonInfiniteScroll). */
  children: InfiniteLoaderChildren;
}

/**
 * Default posts feed: today's tab layout plus `PostsFeed`. The Xbox screen pack
 * replaces it with pill tabs and a side column while keeping the same props.
 */
const PostsFeedView = ({
  currentTab,
  onTabChange,
  targetedPostId,
  children,
}: PostsFeedViewProps) => (
  <PostsFeedLayout currentTab={currentTab} onChange={onTabChange}>
    <PostsFeed criteria={currentTab} targetedPostId={targetedPostId}>
      {children}
    </PostsFeed>
  </PostsFeedLayout>
);

export { PostsFeedView };
