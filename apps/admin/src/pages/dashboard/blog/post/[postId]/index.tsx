import React from "react";
import {
  BlogPostDetailLayout,
  BlogPostDetailView,
  BlogPostsLayout,
} from "@repo/ui";
import { Divider, Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { PageContainer } from "@/components/PageContainer/PageContainer.tsx";

const BlogPostDetailPage = () => {
  const router = useRouter();
  const { postId } = router.query;

  return (
    <PageContainer title={"Post Preview"}>
      <Text c={"dimmed"}>
        This is how this post will look to users. Some links may not be
        available in this dashboard.
      </Text>
      <Divider className={"mb-4"} />
      <BlogPostDetailLayout postId={postId as string}>
        <BlogPostDetailView postId={postId as string} />
      </BlogPostDetailLayout>
    </PageContainer>
  );
};

export default BlogPostDetailPage;
