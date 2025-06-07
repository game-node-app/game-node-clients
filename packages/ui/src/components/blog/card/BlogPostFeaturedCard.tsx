import React, { useMemo } from "react";
import { BlogPost } from "@repo/wrapper/server";
import {
  AspectRatio,
  BackgroundImage,
  Box,
  Group,
  Image,
  Overlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getS3StoredUpload, Link } from "#@/util";
import { UserAvatarGroup } from "#@/components";
import { IconCalendarMonth } from "@tabler/icons-react";
import dayjs from "dayjs";

interface Props {
  post: BlogPost;
}

const BlogPostFeaturedCard = ({ post }: Props) => {
  const imageUrl = useMemo(() => {
    if (!post.image) return null;

    return getS3StoredUpload(`${post.image.filename}.${post.image.extension}`);
  }, [post.image]);

  if (imageUrl == undefined) return null;

  return (
    <Link href={`/blog/post/${post.id}`} className={"w-full h-full"}>
      <Box
        className={
          "rounded-lg w-full h-full relative hover:scale-[102%] transition-transform duration-200"
        }
      >
        <Stack
          className={
            "z-10 absolute w-full h-full justify-end items-start text-gray-100 p-4 gap-0.5"
          }
        >
          <Title size={"h3"} className={"font-semibold"}>
            {post.title}
          </Title>
          <Group>
            <Box className={"max-w-40 lg:max-w-48"}>
              <UserAvatarGroup
                avatarProps={{
                  size: "sm",
                }}
                userId={post.profileUserId}
              />
            </Box>
            <Text>{dayjs(post.createdAt).format("DD/MM/YYYY")}</Text>
          </Group>
        </Stack>
        <AspectRatio ratio={4 / 2} className={"relative "}>
          <Image src={imageUrl} className={"w-full h-full"} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.1)_0%,_rgba(10,10,10,0.6)_54%,_rgba(0,0,0,1)_100%)]"></div>
        </AspectRatio>
      </Box>
    </Link>
  );
};

export { BlogPostFeaturedCard };
