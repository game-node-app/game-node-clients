import React from "react";
import { useQueries } from "@tanstack/react-query";
import { reviewOptions } from "#@/components/review/hooks/useReview";
import { hasReviewContent } from "#@/components/review/util/hasReviewContent";
import { Carousel, CarouselProps } from "@mantine/carousel";
import { Skeleton } from "@mantine/core";
import { useOnMobile } from "../../general/hooks/useOnMobile.ts";
import { useTrendingReviews } from "../../statistics/hooks/useTrendingReviews.ts";
import { StatisticsRankingsRequestDto } from "../../../../../wrapper/src/server";
import { TrendingReviewCard } from "../../general/card/TrendingReviewCard.tsx";
import { DetailsBox } from "../../general/DetailsBox";
import { useTranslation } from "@repo/locales";
import period = StatisticsRankingsRequestDto.period;

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

const TrendingReviewCarousel = (props: CarouselProps) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const trendingReviews = useTrendingReviews({
    period: period.MONTH,
    offset: 0,
    limit: 10,
  });
  const reviewIds = [
    ...new Set(
      (trendingReviews.data?.items ?? [])
        .map((item) => item?.sourceId)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];
  // Same keys as `useReview`, so the cards reuse these results from the cache.
  const reviewQueries = useQueries({
    queries: reviewIds.map((id) => reviewOptions(id)),
  });
  const slides = trendingReviews.isLoading
    ? buildSkeletons()
    : reviewQueries.flatMap((query, index) => {
        if (!query.isLoading && !hasReviewContent(query.data?.content))
          return [];
        const reviewId = reviewIds[index];
        return (
          <Carousel.Slide key={reviewId}>
            {query.isLoading ? (
              <Skeleton h={"100%"} />
            ) : (
              <TrendingReviewCard reviewId={reviewId} />
            )}
          </Carousel.Slide>
        );
      });
  if (slides.length === 0) return null;

  return (
    <DetailsBox
      title={t("home.trendingReviews")}
      stackProps={{
        className: "",
      }}
    >
      <Carousel
        slideSize={{
          base: "90%",
          sm: "40%",
        }}
        height={440}
        slideGap={{
          base: "xs",
          lg: "md",
        }}
        controlsOffset="xs"
        emblaOptions={{
          dragFree: true,
          align: "start",
          slidesToScroll: onMobile ? 1 : 2,
        }}
        {...props}
      >
        {slides}
      </Carousel>
    </DetailsBox>
  );
};

export { TrendingReviewCarousel };
