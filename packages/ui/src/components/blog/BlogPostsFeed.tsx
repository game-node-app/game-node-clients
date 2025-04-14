import {
  ActionIcon,
  Box,
  Popover,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import React, { useCallback, useState } from "react";
import {
  BlogPostCard,
  CenteredLoading,
  DetailsBox,
  GameViewPagination,
  useBlogPosts,
} from "#@/components";
import { getOffsetAsPage, getPageAsOffset, useRouter } from "#@/util";
import { IconQuestionMark } from "@tabler/icons-react";

interface Props {
  limit?: number;
  tag?: string;
}

const BlogPostsFeed = ({ limit = 20, tag }: Props) => {
  const router = useRouter();
  const [offset, setOffset] = useState(0);

  const postsQuery = useBlogPosts({
    limit: limit,
    offset: offset,
    includeDraft: false,
    tag: tag,
  });

  const posts = postsQuery.data?.data;

  const renderRemainingPosts = useCallback(() => {
    const remainingItems = posts?.slice(1);
    return remainingItems?.map((post, index) => {
      return (
        <BlogPostCard
          key={index}
          post={post}
          onClick={() => {
            router.push(`/blog/post/${post.id}`);
          }}
        />
      );
    });
  }, [posts, router]);

  const firstPost = posts?.at(0);

  if (postsQuery.isLoading) return <CenteredLoading />;

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
      {firstPost && (
        <BlogPostCard
          post={firstPost}
          onClick={() => {
            router.push(`/blog/post/${firstPost.id}`);
          }}
        />
      )}
      <SimpleGrid
        cols={{
          base: 1,
          lg: 2,
        }}
        className="w-full"
      >
        {renderRemainingPosts()}
      </SimpleGrid>
      <GameViewPagination
        wrapperProps={{
          className: "mt-auto",
        }}
        page={getOffsetAsPage(offset, limit)}
        paginationInfo={postsQuery.data?.pagination}
        onPaginationChange={(page) => setOffset(getPageAsOffset(page, limit))}
      />
    </DetailsBox>
  );
};

export { BlogPostsFeed };
