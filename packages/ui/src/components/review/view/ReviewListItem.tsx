import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { DEFAULT_REVIEW_EDITOR_EXTENSIONS } from "#@/components/game/info/review/editor/GameInfoReviewEditor";
import { Box, Flex, Group, Spoiler, Stack } from "@mantine/core";
import { FindOneStatisticsDto, Review } from "@repo/wrapper/server";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { UserAvatarGroup } from "#@/components/general/avatar/UserAvatarGroup";
import { ReviewListItemComments } from "#@/components/review/view/ReviewListItemComments";
import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import {
  GameRating,
  GameTitleWithFigure,
  ReviewListItemDropdownButton,
} from "#@/components";

interface IReviewListViewProps {
  review: Review;
  withGameInfo?: boolean;
  onEditStart?: () => void;
}

const ReviewListItem = ({
  review,
  onEditStart,
  withGameInfo,
}: IReviewListViewProps) => {
  const onMobile = useOnMobile();
  const [isReadMore, setIsReadMore] = useState<boolean>(false);

  const nonEditableEditor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      content: review?.content,
      editable: false,
    },
    [review],
  );

  const profileUserId = review.profileUserId;
  const gameIdToUse = withGameInfo ? review.gameId : undefined;

  const isScoreOnlyReview = review.content == null;

  return (
    <Stack w={"100%"} align={"center"}>
      <Group
        w={"100%"}
        justify={"flex-start"}
        wrap={onMobile ? "wrap" : "nowrap"}
        align={"start"}
      >
        <Flex
          direction={{
            base: "row",
          }}
          w={{
            base: "100%",
            lg: "15%",
          }}
          justify={{
            base: "space-between",
            lg: "center",
          }}
          align={{
            base: "center",
            lg: "center",
          }}
          wrap={onMobile ? "nowrap" : "wrap"}
        >
          <UserAvatarGroup
            avatarProps={{
              size: onMobile ? "lg" : "xl",
            }}
            userId={profileUserId}
            groupProps={{
              justify: onMobile ? "start" : "center",
            }}
            withHorizontalBreak={!onMobile}
          />
          {!isScoreOnlyReview && (
            <GameRating
              value={review.rating}
              size={isScoreOnlyReview ? "lg" : "md"}
            />
          )}
        </Flex>
        <Stack className={`w-full`}>
          {isScoreOnlyReview ? (
            <GameRating
              value={review.rating}
              size={isScoreOnlyReview ? "lg" : "md"}
            />
          ) : (
            <Spoiler
              hideLabel={"Show less"}
              showLabel={"Show more"}
              expanded={isReadMore}
              onExpandedChange={setIsReadMore}
              maxHeight={300}
            >
              <EditorContent editor={nonEditableEditor} className={"w-full"} />
            </Spoiler>
          )}

          <Group
            justify={withGameInfo ? "space-between" : "end"}
            wrap={"nowrap"}
          >
            {gameIdToUse && (
              <Box className={"max-w-6 lg:max-w-60"}>
                <GameTitleWithFigure gameId={gameIdToUse} />
              </Box>
            )}
            <Group className={"flex-nowrap justify-start"}>
              <ReviewListItemComments review={review} />
              <ItemLikesButton
                targetUserId={review.profileUserId}
                sourceId={review.id}
                sourceType={FindOneStatisticsDto.sourceType.REVIEW}
              />

              <ReviewListItemDropdownButton
                review={review}
                onEditStart={onEditStart}
              />
            </Group>
          </Group>
        </Stack>
      </Group>
    </Stack>
  );
};

export { ReviewListItem };
