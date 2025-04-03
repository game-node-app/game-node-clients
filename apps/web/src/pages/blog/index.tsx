import React from "react";
import { Group, Stack, Title } from "@mantine/core";
import { BlogPostsFeed } from "@repo/ui";

const BlogLandingPage = () => {
  return (
    <Stack className="container mx-auto px-4 py-8">
      <Title className="text-3xl font-bold mb-6">Our Blog Posts</Title>
      <BlogPostsFeed />
    </Stack>
  );
};

export default BlogLandingPage;
