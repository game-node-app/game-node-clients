import {
  BackToTopButton,
  InfiniteLoaderProps,
  PostsFeed,
  PostsFeedLayout,
  PostsFeedTabValue,
  SimpleInfiniteLoader,
} from "#@/components";
import { buildPresenterComponent } from "#@/context";
import { Stack } from "@mantine/core";
import { useState } from "react";

export interface PostsFeedViewProps {
  /** Shown on top of the feed (e.g. opened from a notification or a shared link). */
  targetedPostId?: string;
}

const DEFAULT_PostsFeedView = ({ targetedPostId }: PostsFeedViewProps) => {
  const [currentTab, setCurrentTab] = useState<PostsFeedTabValue>("all");

  return (
    <Stack className={"w-full h-full"}>
      <BackToTopButton />

      <PostsFeedLayout currentTab={currentTab} onChange={setCurrentTab}>
        <PostsFeed criteria={currentTab} targetedPostId={targetedPostId}>
          {(props: InfiniteLoaderProps) => <SimpleInfiniteLoader {...props} />}
        </PostsFeed>
      </PostsFeedLayout>
    </Stack>
  );
};

const PostsFeedView = buildPresenterComponent(
  "PostsFeedView",
  DEFAULT_PostsFeedView,
);

export { PostsFeedView };
