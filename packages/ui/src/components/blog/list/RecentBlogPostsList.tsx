import {
  BLOG_POSTS_FEED_DEFAULT_LIMIT,
  BlogPostCard,
  CenteredErrorMessage,
  CenteredLoading,
  useBlogPosts,
} from "#@/components";
import { cn } from "#@/util";
import { Box, Button, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  limit?: number;
  /**
   * Grid of the cards. Defaults to one column on phones and two from `sm` up; narrow places like
   * a sidebar pass their own.
   */
  className?: string;
}

const RecentBlogPostsList = ({
  limit = BLOG_POSTS_FEED_DEFAULT_LIMIT,
  className,
}: Props) => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useBlogPosts({
    limit: limit,
  });

  return (
    <Stack className={"w-full"}>
      {isLoading && <CenteredLoading />}
      {error && (
        <>
          <CenteredErrorMessage error={error} />
          <Button onClick={() => refetch()}>{t("blog.read.retry")}</Button>
        </>
      )}
      {data?.data.length === 0 && <Text>{t("blog.list.empty")}</Text>}
      <Box className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
        {data?.data.map((blogPost) => (
          <BlogPostCard
            key={blogPost.id}
            post={blogPost}
            blogRoutePrefix="/blog"
          />
        ))}
      </Box>
    </Stack>
  );
};

export { RecentBlogPostsList };
