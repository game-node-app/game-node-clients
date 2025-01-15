import React, { useMemo, useRef, useState } from "react";
import { Chip, Group, Pagination, Stack, Text } from "@mantine/core";
import { ReviewListItem } from "@/components/review/view/ReviewListItem";
import { useOnMobile } from "@/components/general/hooks/useOnMobile";
import { TBasePaginationRequest } from "@/util/types/pagination";
import { DetailsBox } from "@/components/general/DetailsBox";
import { useUserId } from "@/components/auth/hooks/useUserId";
import { ParsedUrlQuery } from "querystring";
import { useTrendingReviews } from "@/components/statistics/hooks/useTrendingReviews";
import { FindStatisticsTrendingReviewsDto } from "../../../../../../wrapper/src/server";
import { useReviews } from "@/components/review/hooks/useReviews";
import { CenteredLoading } from "@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "@/components/general/CenteredErrorMessage";
import { Link } from "@/util/link";
import period = FindStatisticsTrendingReviewsDto.period;

interface IGameInfoReviewListProps {
  gameId: number;
}

const DEFAULT_LIMIT = 7;

export const DEFAULT_GAME_REVIEW_LIST_VIEW_DTO: FindStatisticsTrendingReviewsDto =
  {
    period: period.ALL,
    offset: 0,
    limit: DEFAULT_LIMIT,
  };

const GameInfoReviewList = ({ gameId }: IGameInfoReviewListProps) => {
  const onMobile = useOnMobile();
  const ownUserId = useUserId();
  const hasSetInitialQueryParams = useRef(false);
  const [offset, setOffset] = useState(0);
  const trendingReviewsDto = useMemo((): FindStatisticsTrendingReviewsDto => {
    return {
      ...DEFAULT_GAME_REVIEW_LIST_VIEW_DTO,
      offset: offset,
      gameId: gameId,
    };
  }, [offset, gameId]);
  const trendingReviewsQuery = useTrendingReviews(trendingReviewsDto);
  const trendingReviewsPagination = trendingReviewsQuery.data?.pagination;

  const reviewsIds = trendingReviewsQuery.data?.data.map((s) => s.reviewId!);
  const reviewsQuery = useReviews(reviewsIds);

  const isEmpty =
    reviewsQuery.data == undefined || reviewsQuery.data.length === 0;
  const isLoading = trendingReviewsQuery.isLoading || reviewsQuery.isLoading;
  const isError = trendingReviewsQuery.isError || reviewsQuery.isError;

  const shouldShowPagination =
    (trendingReviewsQuery.data != undefined &&
      trendingReviewsQuery.data.pagination.hasNextPage) ||
    offset > 0;

  const handlePagination = (page: number) => {
    const offset = (page - 1) * DEFAULT_LIMIT;
    setOffset(offset);
  };

  const content = useMemo(() => {
    const reviews = reviewsQuery.data
      ?.filter((review) => {
        return review.profileUserId !== ownUserId;
      })
      // Give priority to reviews with content
      .toSorted((a, b) => {
        if (a.content == null) {
          return 1;
        } else if (b.content == null) {
          return -1;
        }

        return 0;
      })
      .map((review) => {
        return <ReviewListItem key={review.id} review={review} />;
      });

    if (reviews == undefined) {
      return (
        <Text className={"text-center"}>
          No reviews yet. Be the first one! 😉
        </Text>
      );
    } else if (
      reviews.length === 0 &&
      reviewsQuery.data?.some((review) => review.profileUserId === ownUserId)
    ) {
      return (
        <Text className={"text-center"}>
          Other users' reviews will appear here.
        </Text>
      );
    } else if (reviews.length === 0) {
      return (
        <Text className={"text-center"}>
          No reviews yet. Be the first one! 😉
        </Text>
      );
    }

    return reviews;
  }, [reviewsQuery.data, ownUserId]);

  if (isLoading) {
    return <CenteredLoading className={"mt-6 mb-6"} />;
  } else if (isError) {
    return (
      <CenteredErrorMessage
        message={"Failed to fetch reviews. Please try again."}
      />
    );
  }

  return (
    <DetailsBox enabled={content != undefined} title={"Reviews"}>
      <Stack w={"100%"} justify={"space-between"}>
        <Stack w={"100%"} align={"start"}>
          {content}
        </Stack>

        {shouldShowPagination && (
          <Group w={"100%"} justify={"center"}>
            <Pagination
              total={trendingReviewsPagination?.totalPages ?? 1}
              onChange={handlePagination}
            />
          </Group>
        )}
      </Stack>
    </DetailsBox>
  );
};

export { GameInfoReviewList };
