import React from "react";
import { BlogArticleDto } from "@repo/wrapper/server";
import {
  AspectRatio,
  Box,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "#@/util";
import { UserAvatarGroup } from "#@/components";
import dayjs from "dayjs";

interface Props {
  post: BlogArticleDto;
}

const BlogPostFeaturedCard = ({ post }: Props) => {
  const imageUrl = post.cover.url;

  if (imageUrl == undefined) return null;

  return (
    <Link href={`/blog/post/${post.id}`} className={"w-full h-full"}>
      <Box
        className={
          "w-full h-full relative hover:scale-[102%] transition-transform duration-200"
        }
      >
        <Stack
          className={
            "z-10 top-0 absolute w-full h-full justify-end items-start text-gray-100 p-4 gap-0.5"
          }
        >
          <Title size={"h3"} className={"font-semibold"}>
            {post.title}
          </Title>
          <Text lineClamp={2}>{post.excerpt}</Text>
          <Group>
            <Box className={"max-w-40 lg:max-w-48"}>
              <UserAvatarGroup
                avatarProps={{
                  size: "sm",
                }}
                userId={post.profileUserId}
              />
            </Box>
            <Text>{dayjs(post.publishedAt).format("DD/MM/YYYY")}</Text>
          </Group>
        </Stack>
        <AspectRatio ratio={4 / 2} className={"relative"}>
          <Image
            src={imageUrl}
            alt={post.cover.alt}
            className={"w-full h-full rounded-lg"}
          />
          <div className="rounded-lg absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.1)_0%,_rgba(10,10,10,0.6)_54%,_rgba(0,0,0,1)_100%)]"></div>
        </AspectRatio>
      </Box>
    </Link>
  );
};

export { BlogPostFeaturedCard };
