import React from "react";
import { GameRating, useBlogPosts, useGame } from "#@/components";
import {
  AspectRatio,
  Box,
  Divider,
  Group,
  Image,
  Spoiler,
  Stack,
  Title,
  Text,
} from "@mantine/core";
import { Link } from "#@/util";
import dayjs from "dayjs";
import { BlogArticleDto } from "@repo/wrapper/server";

interface Props {
  post: BlogArticleDto;
}

const BlogPostsFeaturedReviewCard = ({ post }: Props) => {
  const reviewInfo = post.review;

  const gameQuery = useGame(reviewInfo?.gameId, {
    relations: {
      cover: true,
    },
  });

  const imageUrl = post.cover.url;

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

        <Text lineClamp={2}>{post.excerpt}</Text>
        <Text>{dayjs(post.publishedAt).format("DD/MM/YYYY")}</Text>
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

        <Image src={imageUrl} alt={post.cover.alt} className={"rounded-sm"} />
      </AspectRatio>
    </Box>
  );
};

export { BlogPostsFeaturedReviewCard };
