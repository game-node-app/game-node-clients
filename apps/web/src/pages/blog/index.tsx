import React from "react";
import { Stack } from "@mantine/core";
import {
  BLOG_POSTS_FEED_DEFAULT_LIMIT,
  BlogPostsFeed,
  BlogPostsLayout,
} from "@repo/ui";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { blogPostsOptions } from "@repo/ui";
import { SupportedLanguage } from "@repo/locales";
import { NextPageContext } from "next";

export const getServerSideProps = async (context: NextPageContext) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(
    blogPostsOptions(
      { limit: BLOG_POSTS_FEED_DEFAULT_LIMIT },
      (context.locale ?? "en") as SupportedLanguage,
    ),
  );

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
