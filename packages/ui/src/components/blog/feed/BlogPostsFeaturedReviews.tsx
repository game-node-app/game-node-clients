import {
  BLOG_POSTS_FEED_DEFAULT_LIMIT,
  BlogPostsFeaturedReviewCard,
  CenteredLoading,
  useBlogPosts,
} from "#@/components";
import { Carousel } from "@mantine/carousel";
import { Button, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

const BlogPostsFeaturedReviews = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useBlogPosts({
    limit: BLOG_POSTS_FEED_DEFAULT_LIMIT,
    tag: "review",
  });

  const items = useMemo(() => {
    return data?.data.map((post) => {
      return (
        <Carousel.Slide key={`featured-review-${post.id}`}>
          <BlogPostsFeaturedReviewCard post={post} />
        </Carousel.Slide>
      );
    });
  }, [data?.data]);

  if (isLoading) {
    return <CenteredLoading />;
  }

  if (error)
    return (
      <Button onClick={() => refetch()}>
        {t("blog.read.error")} {t("blog.read.retry")}
      </Button>
    );
  if (data?.data.length === 0) return <Text>{t("blog.list.empty")}</Text>;
  return (
    <Carousel draggable withIndicators={false}>
      {items}
    </Carousel>
  );
};

export { BlogPostsFeaturedReviews };