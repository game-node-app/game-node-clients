import React, { useMemo } from "react";
import { BlogPost } from "@repo/wrapper/server";
import {
  AspectRatio,
  Box,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getS3StoredUpload, Link } from "#@/util";
import { IconCalendarMonth } from "@tabler/icons-react";
import dayjs from "dayjs";
import { TextLink } from "#@/components";

interface Props {
  post: BlogPost;
}

const BlogPostsListItem = ({ post }: Props) => {
  const imageUrl = useMemo(() => {
    if (!post.image) return null;

    return getS3StoredUpload(`${post.image.filename}.${post.image.extension}`);
  }, [post.image]);

  return (
    <Group className={"w-full flex-nowrap"}>
      <Link href={`/blog/post/${post.id}`}>
        <AspectRatio ratio={80 / 80} w={80} miw={80}>
          <Image src={imageUrl} alt={post.title} />
        </AspectRatio>
      </Link>

      <Stack className={"grow justify-start"}>
        <Link
          href={`/blog/post/${post.id}`}
          className={"hover:text-brand-4 transition-[0.6s]"}
        >
          <Text className={"font-bold"} lineClamp={2}>
            {post.title}
          </Text>
        </Link>
        <Group className={"gap-0"}>
          <IconCalendarMonth size={"1.2rem"} />
          <Text className={"text-sm text-dimmed"}>
            {dayjs(post.createdAt).format("DD/MM/YYYY")}
          </Text>
        </Group>
      </Stack>
    </Group>
  );
};

export { BlogPostsListItem };
