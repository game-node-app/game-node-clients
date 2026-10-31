import { BlogPostsNavHeader } from "#@/components";
import { Stack } from "@mantine/core";
import { PropsWithChildren } from "react";

const BlogPostsLayout = ({ children }: PropsWithChildren) => {
  return (
    <Stack className={"w-full"}>
      <BlogPostsNavHeader />
      {children}
    </Stack>
  );
};

export { BlogPostsLayout };