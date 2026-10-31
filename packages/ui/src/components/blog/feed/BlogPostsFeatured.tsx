import {
  CenteredErrorMessage,
  CenteredLoading,
  useBlogPosts,
} from "#@/components";
import { BlogPostFeaturedCard } from "#@/components/blog/card/BlogPostFeaturedCard.tsx";
import { getErrorMessage, getRandomItems } from "#@/util";
import { Box, Button, Text } from "@mantine/core";
import { useMemo } from "react";

import { useTranslation } from "@repo/locales";

const BlogPostsFeatured = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useBlogPosts({
    limit: 50,
  });

  const randomPosts = useMemo(() => {
    if (data == undefined || data.data == undefined) {
      return [];
    }

    return getRandomItems(data.data, 3);
  }, [data]);

  const renderedItems = useMemo(() => {
    return randomPosts.map((post, i) => {
      return (
        <Box
          key={post.id}
          className={
            i === 0
              ? "relative col-span-3 lg:col-span-2 lg:row-span-2 overflow-hidden"
              : "relative col-span-3 lg:col-span-1 overflow-hidden"
          }
        >
          <BlogPostFeaturedCard post={post} />
        </Box>
      );
    });
  }, [randomPosts]);

  if (isLoading) {
    return <CenteredLoading />;
  }
  if (error) {
    return (
      <>
        <CenteredErrorMessage message={getErrorMessage(error)} />
        <Button onClick={() => refetch()}>{t("blog.read.retry")}</Button>
      </>
    );
  }

  if (data?.data.length === 0) return <Text>{t("blog.list.empty")}</Text>;
  return (
    <Box className={"grid grid-cols-3 gap-4 lg:min-h-96"}>{renderedItems}</Box>
  );
};

export { BlogPostsFeatured };