import {
  ActionIcon,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Popover,
  Text,
} from "@mantine/core";
import React from "react";
import {
  BlogPostsFeatured,
  BlogPostsFeaturedReviews,
  DetailsBox,
  RecentBlogPostsList,
} from "#@/components";
import { IconQuestionMark } from "@tabler/icons-react";
import { Link } from "#@/util";
import { useTranslation } from "@repo/locales";

const BlogPostsFeed = () => {
  const { t } = useTranslation();

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
              <Text className={"text-wrap"}>{t("blog.disclaimer")}</Text>
              <Text className={"text-sm text-dimmed text-wrap"}>
                {t("blog.contentNotice")}
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
          title={t("blog.recentPosts")}
          stackProps={{
            className: "lg:!w-2/3",
          }}
        >
          <RecentBlogPostsList />
          <Center>
            <Link href={"/blog/archive"}>
              <Button className={"mt-4"}>{t("blog.buttons.seeMore")}</Button>
            </Link>
          </Center>
        </DetailsBox>
        <DetailsBox
          title={t("blog.recentReviews")}
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
