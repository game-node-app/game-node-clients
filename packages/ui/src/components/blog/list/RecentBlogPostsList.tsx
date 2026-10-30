import React from "react";
import {
  BLOG_POSTS_FEED_DEFAULT_LIMIT,
  CenteredLoading,
  CenteredErrorMessage,
  useBlogPosts,
} from "#@/components";
import { Button, Text, Stack } from "@mantine/core";
import { BlogPostsListItem } from "#@/components/blog/list/BlogPostsListItem.tsx";

interface Props {
  limit?: number;
}

import { useTranslation } from "@repo/locales";

const RecentBlogPostsList = ({
  limit = BLOG_POSTS_FEED_DEFAULT_LIMIT,
}: Props) => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useBlogPosts({
    limit: limit,
  });

  return (
    <Stack className={"w-full"}>
      {isLoading && <CenteredLoading />}
      {error && (
        <>
          <CenteredErrorMessage error={error} />
          <Button onClick={() => refetch()}>{t("blog.read.retry")}</Button>
        </>
      )}
      {data?.data.length === 0 && <Text>{t("blog.list.empty")}</Text>}
      {data?.data.map((blogPost) => (
        <BlogPostsListItem key={blogPost.id} post={blogPost} />
      ))}
    </Stack>
  );
};

export { RecentBlogPostsList };
