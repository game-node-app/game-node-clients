import React from "react";
import { CenteredLoading, useBlogPosts } from "#@/components";
import { Stack } from "@mantine/core";
import { BlogPostsListItem } from "#@/components/blog/list/BlogPostsListItem.tsx";

const RecentBlogPostsList = () => {
  const { data, isLoading } = useBlogPosts({
    limit: 6,
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
