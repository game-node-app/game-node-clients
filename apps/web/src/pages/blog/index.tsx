import React from "react";
import { Stack } from "@mantine/core";
import {
  BLOG_POSTS_FEED_DEFAULT_LIMIT,
  BlogPostsFeed,
  BlogPostsLayout,
} from "@repo/ui";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";
import { NextPageContext } from "next";

export const getServerSideProps = async (context: NextPageContext) => {
  const queryClient = new QueryClient();

  /**
   * @see useBlogPosts
   */
  const queryKey = [
    "blog",
    "posts",
    null,
    false,
    BLOG_POSTS_FEED_DEFAULT_LIMIT,
    null,
  ];

  await queryClient.prefetchQuery({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        return await BlogPostService.blogPostControllerFindAllV1(
          undefined,
          false,
          BLOG_POSTS_FEED_DEFAULT_LIMIT,
          undefined,
        );
      } catch (err) {
        console.error(err);
      }
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const BlogLandingPage = () => {
  return (
    <Stack className="mx-auto lg:px-4 lg:py-8">
      <BlogPostsLayout>
        <BlogPostsFeed />
      </BlogPostsLayout>
    </Stack>
  );
};

export default BlogLandingPage;
