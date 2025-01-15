import React from "react";
import { Carousel } from "@mantine/carousel";
import { Skeleton } from "@mantine/core";
import { DetailsBox } from "@/components/general/DetailsBox";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import ReviewCard from "@/components/general/card/ReviewCard";
import { useTrendingReviews } from "@/components/statistics/hooks/useTrendingReviews";
import { FindStatisticsTrendingReviewsDto } from "@repo/wrapper/server";

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

export const TrendingReviewCarousel = () => {
    const onMobile = useOnMobile();
    const trendingReviews = useTrendingReviews({
        offset: 0,
        limit: 10,
        period: FindStatisticsTrendingReviewsDto.period.MONTH,
    });
    const isEmpty = trendingReviews.isError || trendingReviews.data?.data.length === 0;

    const buildSlides = () => {
        if (trendingReviews.isLoading) {
            return buildSkeletons();
        }

        return trendingReviews.data?.data?.map((reviewStatistics) => {
            if (reviewStatistics == undefined || reviewStatistics.reviewId == undefined) {
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
                    dragFree
                    withControls={false}
                >
                    {buildSlides()}
                </Carousel>
            </DetailsBox>
        )
    );
};
