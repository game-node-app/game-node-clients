import React from "react";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import { BlogPostCard, GameViewPagination, useBlogPosts } from "@repo/ui";
import CenteredLoading from "@/components/general/CenteredLoading.tsx";
import { PageContainer } from "@/components/PageContainer/PageContainer.tsx";
import { useRouter } from "next/router";

const BlogPostsListPage = () => {
  const router = useRouter();
  const blogPostsQuery = useBlogPosts({
    limit: 20,
    offset: 0,
    includeDraft: true,
  });

  return (
    <PageContainer title={"Blog posts"}>
      <Text className={"text-dimmed my-2"}>
        Draft posts are not visible to users.
      </Text>
      {blogPostsQuery.isLoading && <CenteredLoading />}
      <Stack>
        <SimpleGrid cols={2} spacing={"md"}>
          {blogPostsQuery.data?.data.map((blogPost) => {
            return (
              <BlogPostCard
                key={blogPost.id}
                post={blogPost}
                onClick={() => router.push(`/dashboard/blog/${blogPost.id}`)}
                onEdit={() =>
                  router.push(`/dashboard/blog/${blogPost.id}/edit`)
                }
              />
            );
          })}
        </SimpleGrid>
        <GameViewPagination page={} paginationInfo={} onPaginationChange={} />
      </Stack>
    </PageContainer>
  );
};

export default BlogPostsListPage;
