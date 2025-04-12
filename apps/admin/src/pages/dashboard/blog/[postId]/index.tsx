import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { Divider, Text } from "@mantine/core";
import { BlogPostDetailView } from "@repo/ui";
import { useRouter } from "next/router";

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
      <BlogPostDetailView postId={postId as string} />
    </PageContainer>
  );
};

export default BlogPostDetailPage;
