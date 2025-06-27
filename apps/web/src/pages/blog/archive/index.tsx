import React from "react";
import { BlogPostsLayout, BlogPostsListView } from "@repo/ui";
import { useRouter } from "next/router";

const BlogPostArchivePage = () => {
  const router = useRouter();
  const { tag } = router.query;

  return (
    <BlogPostsLayout>
      <BlogPostsListView
        tag={tag as string | undefined}
        onTagDeselect={() => {
          router.push("/blog/archive");
        }}
        stackProps={{
          className: "w-full !h-full min-h-dvh mb-8",
        }}
      />
    </BlogPostsLayout>
  );
};

export default BlogPostArchivePage;
