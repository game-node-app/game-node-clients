import React from "react";
import { BlogPostsListView, BlogPostsNavHeader } from "@repo/ui";
import { useRouter } from "next/router";
import { Stack } from "@mantine/core";

const BlogPostArchivePage = () => {
  const router = useRouter();
  const { tag } = router.query;

  return (
    <Stack>
      <BlogPostsNavHeader />
      <BlogPostsListView
        tag={tag as string | undefined}
        onTagDeselect={() => {
          router.push("/blog/archive");
        }}
        stackProps={{
          className: "w-full !h-full min-h-dvh mb-8",
        }}
      />
    </Stack>
  );
};

export default BlogPostArchivePage;
