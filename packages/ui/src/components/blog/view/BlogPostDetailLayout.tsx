import React, { PropsWithChildren } from "react";
import { Flex, Paper, Stack } from "@mantine/core";
import {
  BlogPostTagBadges,
  DetailsBox,
  RecentBlogPostsList,
} from "#@/components";

const BlogPostDetailLayout = ({ children }: PropsWithChildren) => {
  return (
    <Flex
      className={"flex-col gap-4 lg:flex-row lg:flex-nowrap lg:items-start"}
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
  );
};

export { BlogPostDetailLayout };
