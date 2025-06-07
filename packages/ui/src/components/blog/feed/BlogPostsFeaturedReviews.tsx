import React, { useMemo } from "react";
import {
  BLOG_POSTS_FEED_DEFAULT_LIMIT,
  BlogPostsFeaturedReviewCard,
  CenteredLoading,
  useBlogPosts,
} from "#@/components";
import { Carousel } from "@mantine/carousel";

const BlogPostsFeaturedReviews = () => {
  const { data, isLoading } = useBlogPosts({
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

  return (
    <Carousel draggable withIndicators={false}>
      {items}
    </Carousel>
  );
};

export { BlogPostsFeaturedReviews };
