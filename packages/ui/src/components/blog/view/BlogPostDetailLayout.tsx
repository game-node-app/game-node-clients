import React, { PropsWithChildren } from "react";
import { Flex, Paper, Stack } from "@mantine/core";
import {
  BlogPostsNavHeader,
  BlogPostTagBadges,
  DetailsBox,
  RecentBlogPostsList,
} from "#@/components";

const BlogPostDetailLayout = ({ children }: PropsWithChildren) => {
  return (
    <Stack className={"w-full"}>
      <BlogPostsNavHeader />
      <Flex
        className={
          "flex-col gap-4 lg:flex-row lg:flex-nowrap lg:items-start py-4"
        }
      >
        <Paper className={"w-full lg:w-8/12"}>{children}</Paper>
        <Stack className={"lg:w-4/12 lg:gap-8 h-full"}>
          <Paper className={"p-5"}>
            <DetailsBox title={"Recent posts"}>
              <RecentBlogPostsList />
            </DetailsBox>
          </Paper>
          <Paper className={"p-5"}>
            <DetailsBox title={"Tags"}>
              <BlogPostTagBadges />
            </DetailsBox>
          </Paper>
        </Stack>
      </Flex>
    </Stack>
  );
};

export { BlogPostDetailLayout };
