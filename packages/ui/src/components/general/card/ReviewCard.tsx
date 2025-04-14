import React from "react";
import {
  Box,
  Button,
  Group,
  Overlay,
  Paper,
  Skeleton,
  Text,
} from "@mantine/core";
import { useOnMobile } from "#@/components";
import { useReview } from "../../review";
import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  getSizedImageUrl,
  ImageSize,
  useGame,
} from "../../game";
import { UserAvatarGroup } from "../avatar";
import { GameRating } from "../input";
import { Link } from "#@/util";
import { EditorContent, useEditor } from "@tiptap/react";

interface IProps {
  reviewId: string;
}

/**
 * Inspired by:
 * https://ui.mantine.dev/component/cards-carousel/
 *
 * @param review
 * @param backgroundUrl
 * @constructor
 */
const ReviewCard = ({ reviewId }: IProps) => {
  const onMobile = useOnMobile();
  const reviewQuery = useReview(reviewId);
  const gameId = reviewQuery.data?.gameId;
  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  const editor = useEditor(
    {
      extensions: DEFAULT_REVIEW_EDITOR_EXTENSIONS,
      editable: false,
      content: reviewQuery.data?.content,
      immediatelyRender: false,
    },
    [reviewQuery.data?.content],
  );

  if (reviewQuery.isLoading || gameQuery.isLoading) {
    return <Skeleton h={"100%"} />;
  } else if (reviewQuery.data == undefined || gameQuery.data == undefined) {
    return null;
  }

  const profileUserId = reviewQuery.data?.profileUserId;

  const backgroundUrl = getSizedImageUrl(
    gameQuery.data.cover?.url,
    ImageSize.COVER_BIG,
  );

  return (
    <Paper
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "none",
      }}
      className={
        "relative w-full h-full flex flex-col justify-between items-start bg-cover bg-center p-xl rounded-md shadow-md z-0"
      }
    >
      <Overlay color="#000" backgroundOpacity={0.7} className={"z-10"} />
      <div className="z-20 relative w-full">
        <Group className={"w-full justify-between flex-nowrap"}>
          <Box className={"max-w-64"}>
            <UserAvatarGroup
              avatarProps={{
                size: "lg",
              }}
              userId={profileUserId}
            />
          </Box>

          <GameRating value={reviewQuery.data.rating} size={"lg"} />
        </Group>

        {editor && (
          <EditorContent className={"line-clamp-[8]"} editor={editor} />
        )}
      </div>
      <Link href={`/game/${gameId}`}>
        <Button variant="white" color="dark" className={"z-10"}>
          Visit
        </Button>
      </Link>
    </Paper>
  );
};

export { ReviewCard };
