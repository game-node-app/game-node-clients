import React from "react";
import { Carousel } from "@mantine/carousel";
import { Skeleton } from "@mantine/core";
import useOnMobile from "../../general/hooks/useOnMobile.ts";
import { useTrendingReviews } from "../../statistics/hooks/useTrendingReviews.ts";
import { FindStatisticsTrendingReviewsDto } from "@repo/wrapper/server";
import period = FindStatisticsTrendingReviewsDto.period;
import { ReviewCard } from "../../general/card/ReviewCard";
import { DetailsBox } from "../../general/DetailsBox";

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

const TrendingReviewCarousel = () => {
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
          <ReviewCard reviewId={reviewStatistics.reviewId!} />
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
          align="start"
          slideGap={{
            base: "xs",
            lg: "md",
          }}
          slidesToScroll={onMobile ? 1 : 2}
          controlsOffset="xs"
          dragFree
        >
          {buildSlides()}
        </Carousel>
      </DetailsBox>
    )
  );
};

export { TrendingReviewCarousel };
