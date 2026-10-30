import React from "react";
import {
  AspectRatio,
  Box,
  Card,
  Group,
  Image,
  ImageProps,
  Text,
  Title,
} from "@mantine/core";
import { UserAvatarGroup } from "#@/components";
import dayjs from "dayjs";
import { BlogArticleDto } from "@repo/wrapper/server";
import { Link } from "#@/util";

interface Props {
  post: BlogArticleDto;
  imageProps?: ImageProps;
  blogRoutePrefix: string;
}

const BlogPostCard = ({ post, blogRoutePrefix }: Props) => {
  const imageUrl = post.cover.url;

  return (
    <Card
      shadow="sm"
      radius="md"
      className="hover:shadow-xl transition-shadow duration-200 bg-paper w-full h-full"
    >
      <Card.Section>
        <AspectRatio ratio={37 / 28}>
          <Image src={imageUrl} alt={post.cover.alt} />
        </AspectRatio>
      </Card.Section>
      <Card.Section className={"px-3 my-3"}>
        <Link href={`${blogRoutePrefix}/post/${post.id}`} className={"w-full"}>
          <Title lineClamp={2} size={"h3"} className={"text-center text-white"}>
            {post.title}
          </Title>
        </Link>
      </Card.Section>
      <Text lineClamp={3}>{post.excerpt}</Text>
      <Card.Section
        className={"flex justify-between flex-nowrap gap-5 px-3 my-2 mt-auto"}
      >
        <Box className={"max-w-40 lg:max-w-48"}>
          <UserAvatarGroup
            avatarProps={{
              size: "sm",
            }}
            groupProps={{
              gap: 3,
            }}
            userId={post.profileUserId}
          />
        </Box>
        <Group className={"relative items-baseline"}>
          <Text>{dayjs(post.publishedAt).format("DD/MM/YYYY")}</Text>
        </Group>
      </Card.Section>
    </Card>
  );
};

export { BlogPostCard };
