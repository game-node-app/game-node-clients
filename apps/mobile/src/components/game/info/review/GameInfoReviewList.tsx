import React, { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { Chip, ComboboxItem, Flex, Group, Pagination, Select, Stack, Tabs, Text } from "@mantine/core";
import ReviewListItem from "@/components/review/view/ReviewListItem";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import { TBasePaginationRequest } from "@/util/types/pagination";
import { DetailsBox } from "@/components/general/DetailsBox";
import useUserId from "@/components/auth/hooks/useUserId";
import { ParsedUrlQuery } from "querystring";
import { useTrendingReviews } from "@/components/statistics/hooks/useTrendingReviews";
import { FindStatisticsTrendingReviewsDto } from "@/wrapper/server";
import { useReviews } from "@/components/review/hooks/useReviews";
import CenteredLoading from "@/components/general/CenteredLoading";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { Carousel } from "@mantine/carousel";

interface IGameInfoReviewListProps {
    gameId: number;
}
// Should only be used for the actual request. Pagination is done client side.
const DEFAULT_LIMIT = 300;
const INTERNAL_DEFAULT_LIMIT = 7;

export const DEFAULT_GAME_REVIEW_LIST_VIEW_DTO: FindStatisticsTrendingReviewsDto = {
    offset: 0,
    limit: DEFAULT_LIMIT,
    period: FindStatisticsTrendingReviewsDto.period.ALL,
};

const GameInfoReviewList = ({ gameId }: IGameInfoReviewListProps) => {
    const ownUserId = useUserId();

    const trendingReviewsDto = useMemo((): FindStatisticsTrendingReviewsDto => {
        return {
            ...DEFAULT_GAME_REVIEW_LIST_VIEW_DTO,
            gameId: gameId,
            // reviewId: reviewId as string | undefined,
        };
    }, [gameId]);

    const trendingReviewsQuery = useTrendingReviews(trendingReviewsDto);

    const reviewsIds = trendingReviewsQuery.data?.data.map((s) => s.reviewId!);
    const reviewsQuery = useReviews(reviewsIds);

    const isEmpty = reviewsQuery.data == undefined || reviewsQuery.data.length === 0;
    const isLoading = trendingReviewsQuery.isLoading || reviewsQuery.isLoading;
    const isError = trendingReviewsQuery.isError || reviewsQuery.isError;

    const buildItemSlides = useCallback(() => {
        if (reviewsQuery.data != undefined && Array.isArray(reviewsQuery.data)) {
            const totalPages = Math.ceil(reviewsQuery.data?.length / INTERNAL_DEFAULT_LIMIT);
            return new Array(totalPages).fill(0).map((v, i) => {
                const indexAsPage = i + 1;
                const sliceStart = indexAsPage > 1 ? indexAsPage * INTERNAL_DEFAULT_LIMIT - 1 : 0;
                const sliceEnd = sliceStart + INTERNAL_DEFAULT_LIMIT;
                const slicedItems = reviewsQuery.data!.slice(sliceStart, sliceEnd);
                // Avoids creating a "page" for empty content
                if (slicedItems.length === 0) {
                    return null;
                }

                return (
                    <Carousel.Slide key={i} className={"w-full mb-14"}>
                        {slicedItems
                            .filter((review) => review.profileUserId !== ownUserId)
                            .map((review) => {
                                return <ReviewListItem key={review.id} review={review} />;
                            })}
                    </Carousel.Slide>
                );
            });
        }
    }, [ownUserId, reviewsQuery.data]);

    if (isLoading) {
        return <CenteredLoading />;
    } else if (isError) {
        return <CenteredErrorMessage message={"Failed to fetch reviews. Please try again."} />;
    }

    return (
        <DetailsBox title={"Reviews"}>
            <Stack w={"100%"}>
                {isEmpty && (
                    <Flex className={"w-full"}>
                        <Text>No reviews yet. Be the first one! ;)</Text>
                    </Flex>
                )}
                <Carousel
                    draggable={true}
                    withControls={false}
                    slideSize="100%"
                    align="start"
                    slideGap={"xs"}
                    withIndicators={true}
                >
                    {/* ...slides */}
                    {buildItemSlides()}
                </Carousel>
            </Stack>
        </DetailsBox>
    );
};

export default GameInfoReviewList;
