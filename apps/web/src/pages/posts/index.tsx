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
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";

const PostsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { postId } = router.query;
  const [currentTab, setCurrentTab] = useState<PostsFeedTabValue>("all");

  return (
    <Stack className={"w-full h-full"}>
      <OpenGraph title={t("seo.feed.postsTitle")} />
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
