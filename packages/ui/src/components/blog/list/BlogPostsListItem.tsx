import React from "react";
import { BlogArticleDto } from "@repo/wrapper/server";
import { AspectRatio, Group, Image, Stack, Text } from "@mantine/core";
import { Link } from "#@/util";
import dayjs from "dayjs";
import { UserAvatarGroup } from "#@/components";

interface Props {
  post: BlogArticleDto;
}

const BlogPostsListItem = ({ post }: Props) => {
  const imageUrl = post.cover.url;

  return (
    <Group
      className={"w-full flex-nowrap rounded-lg border-[#222222] border-2"}
    >
      <Link
        href={`/blog/post/${post.id}`}
        className={"w-4/12 lg:w-3/12 lg:min-w-32 h-28 lg:h-32"}
      >
        <Image
          src={imageUrl}
          alt={post.cover.alt}
          className={"w-full h-full rounded-tl-lg rounded-bl-lg"}
        />
      </Link>

      <Stack className={"w-8/12 lg:w-9/12 justify-start pe-4"}>
        <Link
          href={`/blog/post/${post.id}`}
          className={"hover:text-brand-4 transition-[0.6s] "}
        >
          <Text className={"font-bold max-w-36"} lineClamp={2}>
            {post.title}
          </Text>
        </Link>
        <Text lineClamp={2}>{post.excerpt}</Text>
        <Group className={"w-full flex-nowrap justify-between"}>
          <UserAvatarGroup
            userId={post.profileUserId}
            avatarProps={{
              size: "sm",
            }}
          />
          <Text className={"text-sm text-dimmed"}>
            {dayjs(post.publishedAt).format("DD/MM/YYYY")}
          </Text>
        </Group>
      </Stack>
    </Group>
  );
};

export { BlogPostsListItem };
