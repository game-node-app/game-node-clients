import React, { useMemo } from "react";
import {
  BLOG_POST_EDITOR_EXTENSIONS,
  GameRating,
  useBlogPosts,
  useGame,
} from "#@/components";
import {
  AspectRatio,
  Box,
  Divider,
  Group,
  Image,
  Spoiler,
  Stack,
  Title,
} from "@mantine/core";
import { getS3StoredUpload, Link } from "#@/util";
import { BlogPost } from "@repo/wrapper/server";
import { EditorContent, useEditor } from "@tiptap/react";
import "./BlogPostsFeaturedReviewCard.css";

interface Props {
  post: BlogPost;
}

const BlogPostsFeaturedReviewCard = ({ post }: Props) => {
  const reviewInfo = post.review;

  const gameQuery = useGame(reviewInfo?.gameId, {
    relations: {
      cover: true,
    },
  });

  const imageUrl = useMemo(() => {
    if (!post || !post.image) return null;

    return getS3StoredUpload(`${post.image.filename}.${post.image.extension}`);
  }, [post]);

  if (reviewInfo == undefined) return null;

  return (
    <Box className={"w-full h-full relative"}>
      <Stack
        className={
          "z-10 absolute w-full h-full justify-end items-center text-gray-100 px-4 pb-8"
        }
      >
        <Link href={`/blog/post/${post.id}`}>
          <Title ta={"center"} size={"h3"} lineClamp={6}>
            {post.title}
          </Title>
        </Link>

        <Divider size={"lg"} className={"border-brand-5 w-full"} />
        <Link href={`/blog/post/${post.id}`} className={"w-full"}>
          <Group className={"w-full justify-between"}>
            <Title size={"h4"}>{gameQuery.data?.name}</Title>
            <GameRating value={reviewInfo.rating} />
          </Group>
        </Link>
      </Stack>
      <AspectRatio ratio={3 / 4} className={"relative"}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.1)_0%,_rgba(10,10,10,0.6)_54%,_rgba(0,0,0,1)_100%)]"></div>

        <Image src={imageUrl} className={"rounded-sm"} />
      </AspectRatio>
    </Box>
  );
};

export { BlogPostsFeaturedReviewCard };
