import {
  BLOG_FEATURED_POSTS_LIMIT,
  BlogPostCompactCard,
  CenteredErrorMessage,
  CenteredLoading,
  useBlogPosts,
} from "#@/components";
import { BlogPostFeaturedCard } from "#@/components/blog/card/BlogPostFeaturedCard.tsx";
import { getErrorMessage } from "#@/util";
import { Box, Button, Text } from "@mantine/core";

import { useTranslation } from "@repo/locales";

/** Latest post as a hero, the next two as compact rows (side by side on `lg`). */
const BlogPostsFeatured = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useBlogPosts({
    limit: BLOG_FEATURED_POSTS_LIMIT,
  });

  if (isLoading) {
    return <CenteredLoading />;
  }
  if (error && !data) {
    return (
      <>
        <CenteredErrorMessage message={getErrorMessage(error)} />
        <Button onClick={() => refetch()}>{t("blog.read.retry")}</Button>
      </>
    );
  }

  const [hero, ...rest] = data?.data ?? [];
  if (!hero) return <Text>{t("blog.list.empty")}</Text>;

  return (
    <Box className={"grid grid-cols-1 lg:grid-cols-3 gap-3"}>
      <Box className={"lg:col-span-2 lg:row-span-2"}>
        <BlogPostFeaturedCard post={hero} />
      </Box>
      {rest.map((post) => (
        <BlogPostCompactCard key={post.id} post={post} />
      ))}
    </Box>
  );
};

export { BlogPostsFeatured };
