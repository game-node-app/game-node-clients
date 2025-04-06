import { SimpleGrid, Stack } from "@mantine/core";
import React, { useCallback, useState } from "react";
import {
  BlogPostCard,
  CenteredLoading,
  GameViewPagination,
  useBlogPosts,
} from "#@/components";
import { getOffsetAsPage, getPageAsOffset, useRouter } from "#@/util";

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
    <Stack className="w-full min-h-dvh">
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
    </Stack>
  );
};

export { BlogPostsFeed };
