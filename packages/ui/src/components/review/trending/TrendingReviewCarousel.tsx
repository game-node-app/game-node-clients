import React from "react";
import { Carousel, CarouselProps } from "@mantine/carousel";
import { Skeleton } from "@mantine/core";
import { useOnMobile } from "../../general/hooks/useOnMobile.ts";
import { useTrendingReviews } from "../../statistics/hooks/useTrendingReviews.ts";
import { FindStatisticsTrendingReviewsDto } from "../../../../../wrapper/src/server";
import { TrendingReviewCard } from "../../general/card/TrendingReviewCard.tsx";
import { DetailsBox } from "../../general/DetailsBox";
import period = FindStatisticsTrendingReviewsDto.period;

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

const TrendingReviewCarousel = (props: CarouselProps) => {
  const onMobile = useOnMobile();
  const trendingReviews = useTrendingReviews({
    period: period.MONTH,
    offset: 0,
    limit: 10,
  });
  const isEmpty =
    trendingReviews.isError || trendingReviews.data?.data.length === 0;

  const buildSlides = () => {
    if (trendingReviews.isLoading) {
      return buildSkeletons();
    }

    return trendingReviews.data?.data?.map((reviewStatistics) => {
      if (
        reviewStatistics == undefined ||
        reviewStatistics.reviewId == undefined
      ) {
        return null;
      }
      return (
        <Carousel.Slide key={reviewStatistics.id}>
          <TrendingReviewCard reviewId={reviewStatistics.reviewId!} />
        </Carousel.Slide>
      );
    });
  };

  return (
    !isEmpty && (
      <DetailsBox
        title={"Trending Reviews"}
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
