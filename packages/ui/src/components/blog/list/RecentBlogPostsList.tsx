import React from "react";
import {
  BLOG_POSTS_FEED_DEFAULT_LIMIT,
  CenteredLoading,
  useBlogPosts,
} from "#@/components";
import { Stack } from "@mantine/core";
import { BlogPostsListItem } from "#@/components/blog/list/BlogPostsListItem.tsx";

interface Props {
  limit?: number;
}

const RecentBlogPostsList = ({
  limit = BLOG_POSTS_FEED_DEFAULT_LIMIT,
}: Props) => {
  const { data, isLoading } = useBlogPosts({
    limit: limit,
    includeDraft: false,
  });

  return (
    <Stack className={"w-full"}>
      {isLoading && <CenteredLoading />}
      {data?.data.map((blogPost) => (
        <BlogPostsListItem key={blogPost.id} post={blogPost} />
      ))}
    </Stack>
  );
};

export { RecentBlogPostsList };
