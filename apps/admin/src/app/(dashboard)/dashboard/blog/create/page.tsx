import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { BlogPostCreateForm } from "@/components/blog/BlogPostCreateForm";

const BlogCreatePage = () => {
  return (
    <PageContainer title={"Create a new blog post"}>
      <BlogPostCreateForm />
    </PageContainer>
  );
};

export default BlogCreatePage;
