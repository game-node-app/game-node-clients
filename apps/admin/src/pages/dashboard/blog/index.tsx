import React, { useState } from "react";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import {
  BlogPostCard,
  GameViewPagination,
  getOffsetAsPage,
  getPageAsOffset,
  useBlogPosts,
} from "@repo/ui";
import CenteredLoading from "@/components/general/CenteredLoading.tsx";
import { PageContainer } from "@/components/PageContainer/PageContainer.tsx";
import { useRouter } from "next/router";

const DEFAULT_LIMIT = 20;

const BlogPostsListPage = () => {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const blogPostsQuery = useBlogPosts({
    limit: DEFAULT_LIMIT,
    offset: offset,
    includeDraft: true,
  });

  return (
    <PageContainer title={"Blog posts"}>
      <Text className={"text-dimmed my-2"}>
        Draft posts are not visible to users.
      </Text>
      {blogPostsQuery.isLoading && <CenteredLoading />}
      <Stack className={"min-h-dvh"}>
        <SimpleGrid
          cols={{
            base: 1,
            lg: 2,
          }}
          spacing={"md"}
        >
          {blogPostsQuery.data?.data.map((blogPost) => {
            return (
              <BlogPostCard
                key={blogPost.id}
                post={blogPost}
                blogRoutePrefix={"/dashboard/blog"}
                onEdit={() =>
                  router.push(`/dashboard/blog/${blogPost.id}/edit`)
                }
                withActions
              />
            );
          })}
        </SimpleGrid>
        <GameViewPagination
          wrapperProps={{
            className: "mt-auto",
          }}
          page={getOffsetAsPage(offset, DEFAULT_LIMIT)}
          paginationInfo={blogPostsQuery.data?.pagination}
          onPaginationChange={(page) =>
            setOffset(getPageAsOffset(page, DEFAULT_LIMIT))
          }
        />
      </Stack>
    </PageContainer>
  );
};

export default BlogPostsListPage;
