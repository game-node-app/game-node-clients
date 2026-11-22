import { useOnMobile } from "#@/components";
import { buildPresenterComponent } from "#@/context";
import { Link } from "#@/util";
import { MEDIA_BUTTON_STYLE } from "#@/theme/mediaSurface";
import { Box, Button, Group, Paper, Skeleton } from "@mantine/core";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  getSizedImageUrl,
  ImageSize,
  useGame,
} from "../../game";
import { useReview } from "../../review";
import { UserAvatarGroup } from "../avatar";
import { GameRating } from "../input";

export interface ReviewCardProps {
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
const DEFAULT_TrendingReviewCard = ({ reviewId }: ReviewCardProps) => {
  useOnMobile();
  const reviewQuery = useReview(reviewId, { refetchOnMount: false });
  const gameId = reviewQuery.data?.gameId;
  const gameQuery = useGame(
    gameId,
    {
      relations: {
        cover: true,
      },
    },
    { ownerUserId: reviewQuery.data?.profileUserId },
  );

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
    ImageSize.COVER_BIG_2X,
  );

  return (
    <Paper
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "none",
        backgroundColor: "var(--gn-media-fade)",
      }}
      className={
        "relative w-full h-full flex flex-col justify-between items-start bg-cover bg-center p-xl rounded-md shadow-md z-0"
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-media-content-scrim"
      />
      <div className="relative w-full media-ink">
        <Group className={"w-full justify-between flex-nowrap"}>
          <Box className={"max-w-64"}>
            <UserAvatarGroup
              avatarProps={{
                size: "lg",
              }}
              userId={profileUserId}
              textProps={{ c: "var(--gn-media-text)" }}
            />
          </Box>

          <GameRating value={reviewQuery.data.rating} size={"lg"} />
        </Group>

        {editor && (
          <EditorContent className={"line-clamp-[8]"} editor={editor} />
        )}
      </div>
      <Link href={`/game/${gameId}`}>
        <Button
          variant="white"
          color="dark"
          className={"z-10"}
          style={MEDIA_BUTTON_STYLE}
        >
          Visit
        </Button>
      </Link>
    </Paper>
  );
};

const TrendingReviewCard = buildPresenterComponent(
  "TrendingReviewCard",
  DEFAULT_TrendingReviewCard,
);

export { TrendingReviewCard };
