import React from "react";
import { Divider, Stack, Text, Title } from "@mantine/core";
import { BlogPostsFeed } from "@repo/ui";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";
import { NextPageContext } from "next";
import { useRouter } from "next/router";

const BLOG_FEED_LIMIT = 13;

export const getServerSideProps = async (context: NextPageContext) => {
  const queryClient = new QueryClient();

  /**
   * @see useBlogPosts
   */
  const queryKey = ["blog", "posts", null, false, BLOG_FEED_LIMIT, 0];

  await queryClient.prefetchQuery({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        return await BlogPostService.blogPostControllerFindAllV1(
          undefined,
          false,
          BLOG_FEED_LIMIT,
          0,
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
  const router = useRouter();
  const { tag } = router.query;

  return (
    <Stack className="mx-auto lg:px-4 lg:py-8 gap-0">
      <Title className="text-3xl font-bold mb-6">Blog Posts</Title>
      <Text>
        Our editors share news about games and what&apos;s relevant to the
        industry. We also share updates about GameNode&apos;s development here.
      </Text>
      <Divider className={"mb-10"} />
      <BlogPostsFeed limit={BLOG_FEED_LIMIT} tag={tag as string | undefined} />
    </Stack>
  );
};

export default BlogLandingPage;
