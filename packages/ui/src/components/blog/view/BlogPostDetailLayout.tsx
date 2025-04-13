import React, { PropsWithChildren } from "react";
import { Group, Paper, Stack } from "@mantine/core";
import {
  BlogPostTagBadges,
  BlogPostTags,
  DetailsBox,
  RecentBlogPostsList,
} from "#@/components";

const BlogPostDetailLayout = ({ children }: PropsWithChildren) => {
  return (
    <Group className={"flex-nowrap items-start"}>
      <Paper withBorder className={"w-full lg:w-8/12"}>
        {children}
      </Paper>
      <Stack className={"hidden lg:flex lg:w-4/12 gap-8 h-full"}>
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
    </Group>
  );
};

export { BlogPostDetailLayout };
