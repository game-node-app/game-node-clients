import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { BlogPostCreateEditForm } from "@/components/blog/BlogPostCreateEditForm.tsx";

const BlogCreatePage = () => {
  return (
    <PageContainer title={"Create a new blog post"}>
      <BlogPostCreateEditForm />
    </PageContainer>
  );
};

export default BlogCreatePage;
