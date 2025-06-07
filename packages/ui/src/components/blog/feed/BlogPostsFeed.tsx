import { ActionIcon, Box, Divider, Group, Popover, Text } from "@mantine/core";
import React from "react";
import {
  BlogPostsFeatured,
  BlogPostsFeaturedReviews,
  DetailsBox,
  RecentBlogPostsList,
} from "#@/components";
import { IconQuestionMark } from "@tabler/icons-react";
import { BlogPostsFeaturedReviewCard } from "#@/components/blog/card/BlogPostsFeaturedReviewCard.tsx";

const BlogPostsFeed = () => {
  return (
    <DetailsBox
      title={""}
      stackProps={{
        className: "w-full min-h-dvh",
      }}
      rightSide={
        <Popover position={"left-end"}>
          <Popover.Target>
            <ActionIcon>
              <IconQuestionMark />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Box className={"w-full max-w-60"}>
              <Text className={"text-wrap"}>
                Our blog posts are published by independent contributors as a
                way to give visibility to the great writers and editors of our
                community. You too can write for us if interested!
              </Text>
              <Text className={"text-sm text-dimmed text-wrap"}>
                As such, these blog posts may not share or reflect the ideals,
                vision or opinions of the core GameNode team. Content is of
                responsibility of the Post author. Please contact our team
                through Discord if you notice any issues.
              </Text>
            </Box>
          </Popover.Dropdown>
        </Popover>
      }
    >
      <BlogPostsFeatured />
      <Divider className={"w-full my-6"} />
      <Group className={"w-full lg:flex-nowrap lg:items-start"}>
        <DetailsBox
          title={"Recent posts"}
          stackProps={{
            className: "lg:!w-2/3",
          }}
        >
          <RecentBlogPostsList />
        </DetailsBox>
        <DetailsBox
          title={"Recent reviews"}
          stackProps={{
            className: "lg:!w-1/3",
          }}
        >
          <BlogPostsFeaturedReviews />
        </DetailsBox>
      </Group>
    </DetailsBox>
  );
};

export { BlogPostsFeed };
