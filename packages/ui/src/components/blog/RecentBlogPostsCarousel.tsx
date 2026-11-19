import React, { useCallback } from "react";
import { Carousel } from "@mantine/carousel";
import { Button, Group, Skeleton, Stack, Text } from "@mantine/core";
import { BlogPostCard, useBlogPosts, useOnMobile } from "#@/components";
import { Link } from "#@/util";
import { useTranslation } from "@repo/locales";
import { IconArrowRight } from "@tabler/icons-react";

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

  return (
    <Stack component="section" className="w-full gap-2">
      <Group justify="space-between" wrap="nowrap">
        <Text component="h2" fw={600}>
          {t("blog.recentPosts")}
        </Text>
        <Link
          href="/blog"
          className="hidden min-h-9 shrink-0 items-center gap-1.5 rounded-md text-sm font-medium text-dimmed transition-colors hover:text-white md:inline-flex"
        >
          {t("blog.buttons.browseBlog")}
          <IconArrowRight aria-hidden size={16} />
        </Link>
      </Group>
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
      <Link href="/blog" className="w-full min-h-min md:hidden">
        <Button
          component={"span"}
          variant={"light"}
          radius={"xl"}
          size={"md"}
          fullWidth
          rightSection={<IconArrowRight size={18} />}
        >
          {t("blog.buttons.seeMore")}
        </Button>
      </Link>
    </Stack>
  );
};

export { RecentBlogPostsCarousel };
