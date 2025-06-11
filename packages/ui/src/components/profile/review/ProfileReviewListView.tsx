import React, { useMemo, useRef, useState } from "react";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile.ts";
import { useUserId } from "#@/components/auth/hooks/useUserId.tsx";
import { Stack, Text } from "@mantine/core";
import { CenteredLoading } from "#@/components/general/CenteredLoading.tsx";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage.tsx";
import { GameView } from "#@/components/game/view/GameView.tsx";
import { useReviewsForUserId } from "#@/components/review/hooks/useReviewsForUserId.ts";
import { useRouter } from "#@/util";
import { ProfileReviewListItem } from "#@/components";

const DEFAULT_LIMIT = 7;

interface IUserViewListView {
  userId: string;
}

const ProfileReviewListView = ({ userId }: IUserViewListView) => {
  const ownUserId = useUserId();

  const [page, setPage] = useState(1);

  const pageAsOffset = (page - 1) * DEFAULT_LIMIT;

  const reviewsQuery = useReviewsForUserId(userId, pageAsOffset, DEFAULT_LIMIT);

  const isEmpty =
    reviewsQuery.data == undefined || reviewsQuery.data.data.length === 0;
  const isLoading = reviewsQuery.isLoading;
  const isError = reviewsQuery.isError;

  const handlePagination = (page: number) => {
    setPage(page);
  };

  const items = useMemo(() => {
    return reviewsQuery.data?.data.map((review) => {
      return <ProfileReviewListItem key={review.id} review={review} />;
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
      <GameView.Pagination
        page={page}
        paginationInfo={reviewsQuery.data?.pagination}
        onPaginationChange={handlePagination}
      />
    </Stack>
  );
};

export { ProfileReviewListView };
