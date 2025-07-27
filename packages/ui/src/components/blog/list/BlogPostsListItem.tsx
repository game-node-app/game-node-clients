import React, { useMemo } from "react";
import { BlogPost } from "@repo/wrapper/server";
import { AspectRatio, Group, Image, Stack, Text } from "@mantine/core";
import { getS3StoredUpload, Link } from "#@/util";
import dayjs from "dayjs";
import { UserAvatarGroup } from "#@/components";

interface Props {
  post: BlogPost;
}

const BlogPostsListItem = ({ post }: Props) => {
  const imageUrl = useMemo(() => {
    if (!post.image) return null;

    return getS3StoredUpload(`${post.image.filename}.${post.image.extension}`);
  }, [post.image]);

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
          alt={post.title}
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
        <Group className={"w-full flex-nowrap justify-between"}>
          <UserAvatarGroup
            userId={post.profileUserId}
            avatarProps={{
              size: "sm",
            }}
          />
          <Text className={"text-sm text-dimmed"}>
            {dayjs(post.createdAt).format("DD/MM/YYYY")}
          </Text>
        </Group>
      </Stack>
    </Group>
  );
};

export { BlogPostsListItem };
