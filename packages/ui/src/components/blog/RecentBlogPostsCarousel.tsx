import React, { useCallback } from "react";
import { Carousel } from "@mantine/carousel";
import { Paper, Skeleton } from "@mantine/core";
import {
  BlogPostCard,
  DetailsBox,
  TextLink,
  useBlogPosts,
  useOnMobile,
} from "#@/components";
import { useRouter } from "#@/util";

const buildSkeletons = () => {
  const skeletons = [];
  for (let i = 0; i < 6; i++) {
    skeletons.push(
      <Carousel.Slide key={i}>
        <Skeleton h={"100%"} />
      </Carousel.Slide>,
    );
  }

  return skeletons;
};

const RecentBlogPostsCarousel = () => {
  const router = useRouter();
  const onMobile = useOnMobile();

  const { data, isLoading } = useBlogPosts({
    limit: 6,
    includeDraft: false,
  });

  const buildSlides = useCallback(() => {
    if (isLoading) {
      return buildSkeletons();
    }

    return data?.data.map((blogPost) => {
      return (
        <Carousel.Slide key={blogPost.id}>
          <Paper className={"w-full h-full bg-paper"} shadow={"sm"}>
            <BlogPostCard post={blogPost} blogRoutePrefix="/blog" />
          </Paper>
        </Carousel.Slide>
      );
    });
  }, [data?.data, isLoading]);

  return (
    <DetailsBox
      title={"Recent blog posts"}
      stackProps={{
        className: "",
      }}
    >
      <Carousel
        slideSize={{
          base: "100%",
          lg: "35%",
        }}
        emblaOptions={{
          dragFree: true,
          align: "start",
        }}
        slideGap={"xs"}
        withIndicators={false}
        withControls={!onMobile}
      >
        {buildSlides()}
      </Carousel>
      <TextLink href={"/blog"}>See more</TextLink>
    </DetailsBox>
  );
};

export { RecentBlogPostsCarousel };
