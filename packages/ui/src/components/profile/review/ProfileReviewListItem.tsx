import React from "react";
import { FindOneStatisticsDto, Review } from "@repo/wrapper/server";
import { Box, Divider, Group, Stack, Title } from "@mantine/core";
import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameFigureImage,
  GameRating,
  ItemLikesButton,
  TextLink,
  useGame,
} from "#@/components";
import { EditorContent, useEditor } from "@tiptap/react";
import sourceType = FindOneStatisticsDto.sourceType;

interface Props {
  review: Review;
}

/**
 * Renders a preview of a user's review with a visit button.
 * @constructor
 */
const ProfileReviewListItem = ({ review }: Props) => {
  const gameQuery = useGame(review.gameId, {
    relations: {
      cover: true,
    },
  });

  const editor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      editable: false,
      immediatelyRender: false,
      content: review.content ?? "<p>This review has no content.</p>",
    },
    [review.content],
  );

  return (
    <Group className={"w-full flex-nowrap p-2 bg-[#222222] items-start"}>
      <Stack className={"w-3/12  lg:w-2/12 items-center justify-start"}>
        <Box className={"w-11/12"}>
          <GameFigureImage game={gameQuery.data} />
        </Box>
        <Title size={"h4"} className={"text-center"}>
          {gameQuery.data?.name}
        </Title>
      </Stack>
      <Stack className={"w-9/12 lg:w-10/12 px-2 gap-2 min-h-64"}>
        <EditorContent editor={editor} className={"line-clamp-[10]"} />
        <Divider className={"w-full mt-auto"} />
        <Group className={"w-full justify-between"}>
          <TextLink
            href={`/game/${review.gameId}?reviewId=${review.id}`}
            className={"text-dimmed"}
          >
            Visit
          </TextLink>
          <Group>
            <ItemLikesButton
              targetUserId={review.profileUserId}
              sourceId={review.id}
              sourceType={sourceType.REVIEW}
            />
            <GameRating value={review.rating} />
          </Group>
        </Group>
      </Stack>
    </Group>
  );
};

export { ProfileReviewListItem };
