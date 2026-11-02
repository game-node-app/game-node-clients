import React, { useCallback } from "react";
import { Carousel } from "@mantine/carousel";
import { Button, Text, Skeleton } from "@mantine/core";
import {
  BlogPostCard,
  DetailsBox,
  TextLink,
  useBlogPosts,
  useOnMobile,
} from "#@/components";
import { useTranslation } from "@repo/locales";
import { useAppTheme } from "#@/components/theme/useAppTheme";
import { ConsoleBlogSection } from "#@/components/theme/console/ConsoleBlogSection";

const buildSkeletons = () => {
  const skeletons: React.ReactNode[] = [];
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
  const { t } = useTranslation();
  const onMobile = useOnMobile();

  const [theme] = useAppTheme();
  const { data, isLoading, error, refetch } = useBlogPosts({
    limit: 6,
  });

  const buildSlides = useCallback(() => {
    if (isLoading) {
      return buildSkeletons();
    }

    return data?.data.map((blogPost) => {
      return (
        <Carousel.Slide key={blogPost.id}>
          <BlogPostCard post={blogPost} blogRoutePrefix="/blog" />
        </Carousel.Slide>
      );
    });
  }, [data?.data, isLoading]);

  if (theme === "xbox") {
    return (
      <ConsoleBlogSection
        posts={data?.data}
        isLoading={isLoading}
        isError={error != undefined}
        onRetry={refetch}
      />
    );
  }

  return (
    <DetailsBox
      title={t("blog.recentPosts")}
      stackProps={{
        className: "",
      }}
    >
      {error && (
        <Button onClick={() => refetch()}>
          {t("blog.read.error")} {t("blog.read.retry")}
        </Button>
      )}
      {data?.data.length === 0 && <Text>{t("blog.list.empty")}</Text>}
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
      <TextLink href={"/blog"}>{t("blog.buttons.seeMore")}</TextLink>
    </DetailsBox>
  );
};

export { RecentBlogPostsCarousel };
