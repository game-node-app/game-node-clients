import React, { useMemo, useState } from "react";
import { Button, Group, Pagination, Stack, Text } from "@mantine/core";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { useTrendingReviews } from "#@/components/statistics/hooks/useTrendingReviews";
import { useReviews } from "#@/components/review/hooks/useReviews";
import { FindStatisticsTrendingReviewsDto } from "@repo/wrapper/server";
import {
  CenteredErrorMessage,
  CenteredLoading,
  ReviewListItem,
  ReviewListItemModal,
  useUserId,
} from "#@/components";
import period = FindStatisticsTrendingReviewsDto.period;
import { getOffsetAsPage, getPageAsOffset, Link } from "#@/util";

interface IGameInfoReviewListProps {
  gameId: number;
  targetReviewId?: string;
  withPagination?: boolean;
  withViewMore?: boolean;
}

const DEFAULT_LIMIT = 7;

export const DEFAULT_GAME_REVIEW_LIST_VIEW_DTO: FindStatisticsTrendingReviewsDto =
  {
    period: period.ALL,
    offset: 0,
    limit: DEFAULT_LIMIT,
    excludeOwn: true,
  };

const GameInfoReviewList = ({
  gameId,
  targetReviewId,
}: IGameInfoReviewListProps) => {
  const ownUserId = useUserId();
  const [offset, setOffset] = useState(0);
  const trendingReviewsDto = useMemo((): FindStatisticsTrendingReviewsDto => {
    return {
      ...DEFAULT_GAME_REVIEW_LIST_VIEW_DTO,
      offset: offset,
      gameId: gameId,
      reviewId: targetReviewId,
    };
  }, [offset, gameId, targetReviewId]);
  const trendingReviewsQuery = useTrendingReviews(trendingReviewsDto);
  const trendingReviewsPagination = trendingReviewsQuery.data?.pagination;

  const reviewsIds = trendingReviewsQuery.data?.data.map((s) => s.reviewId!);
  const reviewsQuery = useReviews(reviewsIds);
  const isLoading = trendingReviewsQuery.isLoading || reviewsQuery.isLoading;
  const isError = trendingReviewsQuery.isError || reviewsQuery.isError;

  const hasItems = reviewsIds != undefined && reviewsIds.length > 0;

  const hasNextPage =
    trendingReviewsQuery.data != undefined &&
    trendingReviewsQuery.data.pagination.hasNextPage;

  const shouldShowPagination = (hasItems && hasNextPage) || offset > 0;

  const handlePagination = (page: number) => {
    setOffset(getPageAsOffset(page, DEFAULT_LIMIT));
  };

  const content = useMemo(() => {
    const reviews = reviewsQuery.data
      // Give priority to reviews with content
      ?.toSorted((a, b) => {
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

    return reviews;
  }, [reviewsQuery.data]);

  if (isLoading) {
    return <CenteredLoading className={"mt-6 mb-6"} />;
  } else if (isError) {
    return (
      <CenteredErrorMessage
        message={"Failed to fetch reviews. Please try again."}
      />
    );
  } else if (content == undefined || content.length === 0) {
    return <CenteredErrorMessage message={"No reviews yet."} />;
  }

  return (
    <DetailsBox title={"From our users"}>
      <ReviewListItemModal reviewId={targetReviewId} />
      <Stack w={"100%"} justify={"space-between"}>
        <Stack w={"100%"} align={"start"} gap={"xs"}>
          {content}
        </Stack>

        {shouldShowPagination && (
          <Group w={"100%"} justify={"center"}>
            <Pagination
              value={getOffsetAsPage(offset, DEFAULT_LIMIT)}
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
