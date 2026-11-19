import React from "react";
import { useQueries } from "@tanstack/react-query";
import { reviewOptions } from "../hooks/useReview.ts";
import { hasReviewContent } from "../util/hasReviewContent.ts";
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
  const reviewIds = (trendingReviews.data?.items ?? [])
    .map((item) => item?.sourceId)
    .filter((id): id is string => typeof id === "string");
  // Same keys as `useReview`, so the cards reuse these results from the cache.
  const reviewQueries = useQueries({
    queries: reviewIds.map((id) => reviewOptions(id)),
  });
  const reviewsLoading = reviewQueries.some((query) => query.isLoading);
  // Rating-only reviews (no text) are not worth a card.
  const visibleIds = reviewIds.filter((_, index) =>
    hasReviewContent(reviewQueries[index]?.data?.content),
  );
  const isEmpty =
    trendingReviews.isError ||
    trendingReviews.data?.items.length === 0 ||
    (!trendingReviews.isLoading && !reviewsLoading && visibleIds.length === 0);

  const buildSlides = () => {
    if (trendingReviews.isLoading || reviewsLoading) {
      return buildSkeletons();
    }

    return visibleIds.map((reviewId) => (
      <Carousel.Slide key={reviewId}>
        <TrendingReviewCard reviewId={reviewId} />
      </Carousel.Slide>
    ));
  };

  return (
    !isEmpty && (
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
          {buildSlides()}
        </Carousel>
      </DetailsBox>
    )
  );
};

export { TrendingReviewCarousel };
