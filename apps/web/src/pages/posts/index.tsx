import React, { useState } from "react";
import { Stack } from "@mantine/core";
import {
  BackToTopButton,
  InfiniteLoaderProps,
  PostsFeed,
  PostsFeedLayout,
  PostsFeedTabValue,
  SimpleInfiniteLoader,
} from "@repo/ui";
import { useRouter } from "next/router";

const PostsPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const [currentTab, setCurrentTab] = useState<PostsFeedTabValue>("all");

  return (
    <Stack className={"w-full h-full"}>
      <BackToTopButton />

      <PostsFeedLayout currentTab={currentTab} onChange={setCurrentTab}>
        <PostsFeed
          criteria={currentTab}
          targetedPostId={postId as string | undefined}
        >
          {(props: InfiniteLoaderProps) => <SimpleInfiniteLoader {...props} />}
        </PostsFeed>
      </PostsFeedLayout>
    </Stack>
  );
};

export default PostsPage;
