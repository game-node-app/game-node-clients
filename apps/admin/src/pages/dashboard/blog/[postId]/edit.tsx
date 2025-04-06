import React from "react";
import { CenteredLoading, useBlogPost } from "@repo/ui";
import { useRouter } from "next/router";
import { PageContainer } from "@/components/PageContainer/PageContainer.tsx";
import { BlogPostCreateEditForm } from "@/components/blog/BlogPostCreateEditForm.tsx";

const BlogPostEditPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const editingPostQuery = useBlogPost(postId as string);

  console.log(editingPostQuery.data);
  return (
    <PageContainer title={"Edit post"}>
      {editingPostQuery.isLoading && <CenteredLoading message={"Loading..."} />}
      <BlogPostCreateEditForm editingPostId={postId as string} />
    </PageContainer>
  );
};

export default BlogPostEditPage;
