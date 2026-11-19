import { IonRippleEffect } from "@ionic/react";
import { Box, Group, Skeleton, Stack, Text } from "@mantine/core";
import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameFigureImage,
  GameRating,
  hasReviewContent,
  Link,
  useGame,
  UserAvatarGroup,
  useReview,
} from "@repo/ui";
import { EditorContent, useEditor } from "@tiptap/react";

interface Props {
  reviewId: string;
}

/**
 * Review-first card: the written opinion is the content, the game is context.
 * Rating-only reviews are filtered out by the carousel, and also render
 * nothing here as a safety net.
 */
const MobileTrendingReviewCard = ({ reviewId }: Props) => {
  const reviewQuery = useReview(reviewId);
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
    return <Skeleton className={"w-full h-full"} />;
  } else if (
    reviewQuery.data == undefined ||
    gameQuery.data == undefined ||
    !hasReviewContent(reviewQuery.data.content)
  ) {
    return null;
  }

  return (
    <Link
      href={`/game/${gameId}?reviewId=${reviewId}`}
      className={"w-full h-full"}
    >
      <Stack
        className={
          "bg-paper-2 p-4 gap-3 rounded-lg w-full h-full relative ion-activatable justify-between"
        }
      >
        <IonRippleEffect className={"rounded-lg"} />
        <Stack className={"gap-3 min-h-0"}>
          <Group className={"w-full flex-nowrap justify-between gap-2"}>
            <Box className={"min-w-0"}>
              <UserAvatarGroup
                groupProps={{ gap: "xs" }}
                avatarProps={{ size: "sm" }}
                textProps={{
                  lineClamp: 1,
                  size: "sm",
                  fw: 600,
                }}
                userId={reviewQuery.data.profileUserId}
              />
            </Box>
            <GameRating value={reviewQuery.data.rating} size={"sm"} />
          </Group>
          <EditorContent
            editor={editor}
            className={"w-full line-clamp-6 text-sm leading-relaxed"}
          />
        </Stack>
        <Group
          className={
            "flex-nowrap gap-3 pt-3 border-t border-paper-4 border-solid border-0"
          }
        >
          <Box className={"min-w-9 w-9"}>
            <GameFigureImage game={gameQuery.data} />
          </Box>
          <Text
            lineClamp={1}
            size={"sm"}
            fw={600}
            className={"min-w-0 flex-1"}
          >
            {gameQuery.data.name}
          </Text>
        </Group>
      </Stack>
    </Link>
  );
};

export { MobileTrendingReviewCard };
