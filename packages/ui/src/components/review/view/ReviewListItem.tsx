import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { DEFAULT_REVIEW_EDITOR_EXTENSIONS } from "#@/components/game/info/review/editor/GameInfoReviewEditor";
import {
  Box,
  Divider,
  Flex,
  Group,
  Spoiler,
  Stack,
  Title,
} from "@mantine/core";
import { FindOneStatisticsDto, Review } from "@repo/wrapper/server";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { UserAvatarGroup } from "#@/components/general/avatar/UserAvatarGroup";
import { ReviewListItemComments } from "#@/components/review/view/ReviewListItemComments";
import { ItemLikesButton } from "#@/components/statistics/input/ItemLikesButton";
import {
  GameFigureImage,
  GameRating,
  GameTitleWithFigure,
  ReviewListItemDropdownButton,
  TextLink,
} from "#@/components";

interface IReviewListViewProps {
  review: Review;
  onEditStart?: () => void;
}

const ReviewListItem = ({ review, onEditStart }: IReviewListViewProps) => {
  const onMobile = useOnMobile();
  const [isReadMore, setIsReadMore] = useState<boolean>(false);

  const editor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      content: review?.content,
      editable: false,
    },
    [review],
  );

  const profileUserId = review.profileUserId;

  const isScoreOnlyReview = review.content == null;

  return (
    <Group className={"w-full p-2 bg-[#262525] @container"}>
      <Group className={"w-full flex-wrap lg:flex-nowrap items-start gap-0"}>
        <Stack
          className={
            "w-full lg:w-2/12 items-start lg:items-center justify-start"
          }
        >
          <Box className={"w-full lg:w-11/12"}>
            <UserAvatarGroup
              groupProps={{
                wrap: onMobile ? "nowrap" : "wrap",
                pt: onMobile ? "xs" : "lg",
                gap: "xs",
                justify: onMobile ? "start" : "center",
              }}
              avatarProps={{
                size: onMobile ? "md" : "xl",
              }}
              withHorizontalBreak={!onMobile}
              userId={profileUserId}
            />
          </Box>
        </Stack>
        <Stack
          className={"w-full lg:w-10/12 gap-2"}
          data-score-only={isScoreOnlyReview ? "true" : "false"}
        >
          {isScoreOnlyReview ? (
            <GameRating value={review.rating} size={"xl"} mt={"lg"} />
          ) : (
            <Spoiler
              hideLabel={"Show less"}
              showLabel={"Show more"}
              expanded={isReadMore}
              onExpandedChange={setIsReadMore}
              maxHeight={300}
            >
              <EditorContent editor={editor} className={"w-full"} />
            </Spoiler>
          )}
        </Stack>
      </Group>
      <Flex className={"justify-end w-full"}>
        <Stack className={"w-full lg:w-10/12"}>
          <Divider className={"w-full mt-auto"} />
          <Group
            className={
              "w-full flex-nowrap justify-between data-[score-only=true]:justify-end"
            }
          >
            <GameRating
              value={review.rating}
              className={"data-[score-only=true]:hidden"}
              size={"lg"}
              data-score-only={isScoreOnlyReview ? "true" : "false"}
            />
            <Group className={"flex-nowrap flex-grow justify-end"}>
              <Group className={"gap-1"}>
                <ReviewListItemComments review={review} />
                <ItemLikesButton
                  targetUserId={review.profileUserId}
                  sourceId={review.id}
                  sourceType={FindOneStatisticsDto.sourceType.REVIEW}
                />
              </Group>

              <ReviewListItemDropdownButton
                review={review}
                onEditStart={onEditStart}
              />
            </Group>
          </Group>
        </Stack>
      </Flex>
    </Group>
  );
};

export { ReviewListItem };
