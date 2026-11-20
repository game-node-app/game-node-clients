import React, { useState } from "react";
import { Stack } from "@mantine/core";
import {
  BackToTopButton,
  buildPresenterComponent,
  InfiniteLoaderProps,
  PostsFeedTabValue,
  PostsFeedView,
  SimpleInfiniteLoader,
} from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";

const PostsFeedViewPresenter = buildPresenterComponent(
  "PostsFeedView",
  PostsFeedView,
);

const PostsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { postId } = router.query;
  const [currentTab, setCurrentTab] = useState<PostsFeedTabValue>("all");

  return (
    <Stack className={"w-full h-full"}>
      <OpenGraph title={t("seo.feed.postsTitle")} />
      <BackToTopButton />

      <PostsFeedViewPresenter
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        targetedPostId={postId as string | undefined}
      >
        {(props: InfiniteLoaderProps) => <SimpleInfiniteLoader {...props} />}
      </PostsFeedViewPresenter>
    </Stack>
  );
};

export default PostsPage;
