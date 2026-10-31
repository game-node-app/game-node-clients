import {
  CenteredErrorMessage,
  CenteredLoading,
  ReviewListItem,
  ReviewListItemModal,
} from "#@/components";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { useReviews } from "#@/components/review/hooks/useReviews";
import { useTrendingReviews } from "#@/components/statistics/hooks/useTrendingReviews";
import { getOffsetAsPage, getPageAsOffset } from "#@/util";
import { Group, Pagination, Stack } from "@mantine/core";
import { StatisticsRankingsRequestDto } from "@repo/wrapper/server";
import { useMemo, useState } from "react";
import period = StatisticsRankingsRequestDto.period;

interface IGameInfoReviewListProps {
  gameId: number;
  targetReviewId?: string;
  withPagination?: boolean;
  withViewMore?: boolean;
}

const DEFAULT_LIMIT = 7;

export const DEFAULT_GAME_REVIEW_LIST_VIEW_DTO = {
  period: period.ALL,
  offset: 0,
  limit: DEFAULT_LIMIT,
  excludeOwn: true,
};

const GameInfoReviewList = ({
  gameId,
  targetReviewId,
}: IGameInfoReviewListProps) => {
  const actor = useUserId();
  const [selection, setSelection] = useState({
    gameId,
    targetReviewId,
    actor,
    offset: 0,
  });
  const sameSelection =
    selection.gameId === gameId &&
    selection.targetReviewId === targetReviewId &&
    selection.actor === actor;
  const offset = sameSelection ? selection.offset : 0;
  if (!sameSelection)
    setSelection({ gameId, targetReviewId, actor, offset: 0 });
  const trendingReviewsDto = useMemo(() => {
    return {
      ...DEFAULT_GAME_REVIEW_LIST_VIEW_DTO,
      offset: offset,
      gameId: gameId,
      reviewId: targetReviewId,
      excludeOwn: true,
    };
  }, [offset, gameId, targetReviewId]);
  const trendingReviewsQuery = useTrendingReviews(trendingReviewsDto);
  const trendingReviewsPagination = trendingReviewsQuery.data?.pagination;

  const reviewsIds = trendingReviewsQuery.data?.items
    .map((s) => s.sourceId)
    .filter((id): id is string => typeof id === "string");
  const reviewsQuery = useReviews(reviewsIds?.length ? reviewsIds : undefined);
  const isLoading = trendingReviewsQuery.isLoading || reviewsQuery.isLoading;
  const isError = trendingReviewsQuery.isError || reviewsQuery.isError;

  const hasItems = reviewsIds != undefined && reviewsIds.length > 0;

  const hasNextPage =
    trendingReviewsQuery.data != undefined &&
    trendingReviewsQuery.data.pagination.hasNextPage;

  const shouldShowPagination = (hasItems && hasNextPage) || offset > 0;

  const handlePagination = (page: number) => {
    setSelection({
      gameId,
      targetReviewId,
      actor,
      offset: getPageAsOffset(page, DEFAULT_LIMIT),
    });
  };

  const content = useMemo(() => {
    const reviews = reviewsIds
      ?.map((id) => reviewsQuery.data?.find((review) => review.id === id))
      .filter((review) => review !== undefined)
      .map((review) => <ReviewListItem key={review.id} review={review} />);

    return reviews;
  }, [reviewsIds, reviewsQuery.data]);

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
              total={
                trendingReviewsPagination
                  ? Math.min(
                      Math.ceil(
                        trendingReviewsPagination.total /
                          trendingReviewsPagination.limit,
                      ),
                      Math.floor(10000 / trendingReviewsPagination.limit) + 1,
                    )
                  : 1
              }
              onChange={handlePagination}
            />
          </Group>
        )}
      </Stack>
    </DetailsBox>
  );
};

export { GameInfoReviewList };