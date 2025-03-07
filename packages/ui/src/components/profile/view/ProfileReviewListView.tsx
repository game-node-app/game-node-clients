import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  FindStatisticsTrendingGamesDto,
  FindStatisticsTrendingReviewsDto,
} from "../../../../../wrapper/src/server";
import { ReviewListItem } from "#@/components/review/view/ReviewListItem";
import { Group, Pagination, Stack, Tabs, Text } from "@mantine/core";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { ParsedUrlQuery } from "querystring";
import { TBasePaginationRequest } from "#@/util/types/pagination";
import { GameView } from "#@/components/game/view/GameView";
import { useReviewsForUserId } from "#@/components/review/hooks/useReviewsForUserId";
import { useRouter } from "#@/util";

const DEFAULT_LIMIT = 7;

interface IUserViewListView {
  userId: string;
}

const ProfileReviewListView = ({ userId }: IUserViewListView) => {
  const onMobile = useOnMobile();
  const router = useRouter();
  const ownUserId = useUserId();
  const hasSetInitialQueryParams = useRef(false);

  const [page, setPage] = useState(1);

  const [offset, setOffset] = useState(0);
  const reviewsQuery = useReviewsForUserId(userId, offset, DEFAULT_LIMIT);

  const isEmpty =
    reviewsQuery.data == undefined || reviewsQuery.data.data.length === 0;
  const isLoading = reviewsQuery.isLoading;
  const isError = reviewsQuery.isError;

  const handlePagination = (page: number) => {
    const offset = (page - 1) * DEFAULT_LIMIT;
    setPage(page);
  };

  const items = useMemo(() => {
    return reviewsQuery.data?.data.map((review) => {
      return <ReviewListItem key={review.id} review={review} withGameInfo />;
    });
  }, [reviewsQuery.data]);

  if (isLoading) {
    return <CenteredLoading />;
  } else if (isError) {
    return (
      <CenteredErrorMessage
        message={"Failed to fetch reviews. Please try again."}
      />
    );
  } else if (isEmpty) {
    if (userId != undefined && userId === ownUserId) {
      return (
        <Text className={"text-center"}>
          You have no reviews. Make your first one 😉
        </Text>
      );
    }
    return <Text className={"text-center"}>User has no reviews.</Text>;
  }
  return (
    <Stack w={"100%"} justify={"space-between"}>
      <Stack w={"100%"} align={"start"}>
        {items}
      </Stack>
      {!isEmpty && (
        <GameView.Pagination
          page={page}
          paginationInfo={reviewsQuery.data?.pagination}
          onPaginationChange={handlePagination}
        />
      )}
    </Stack>
  );
};

export { ProfileReviewListView };
