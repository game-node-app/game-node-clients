import React, { PropsWithChildren } from "react";
import { Stack } from "@mantine/core";
import { BlogPostsNavHeader } from "#@/components";

const BlogPostsLayout = ({ children }: PropsWithChildren) => {
  return (
    <Stack className={"w-full"}>
      <BlogPostsNavHeader />
      {children}
    </Stack>
  );
};

export { BlogPostsLayout };
