import React from "react";
import { useRouter } from "next/router";
import { Stack } from "@mantine/core";
import {
  BlogPostDetailLayout,
  BlogPostDetailView,
  BlogPostsNavHeader,
} from "@repo/ui";
import { NextPageContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";

export const getServerSideProps = async ({ query }: NextPageContext) => {
  const postId = query.postId as string;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["blog", "posts", postId],
    queryFn: async () => {
      return BlogPostService.blogPostControllerFindOneByIdV1(postId);
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const BlogPostDetailPage = () => {
  const router = useRouter();
  const { postId } = router.query;

  return (
    <Stack className={"w-full items-center"}>
      <BlogPostDetailLayout>
        <BlogPostDetailView postId={postId as string} />
      </BlogPostDetailLayout>
    </Stack>
  );
};

export default BlogPostDetailPage;
