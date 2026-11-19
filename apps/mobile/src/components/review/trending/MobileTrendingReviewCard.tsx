import { IonRippleEffect } from "@ionic/react";
import { Box, Group, Image, Skeleton, Stack, Text } from "@mantine/core";
import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GAME_COVER_PLACEHOLDER,
  GameRating,
  hasReviewContent,
  ImageSize,
  Link,
  useGame,
  useGameCoverImage,
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
  const cover = useGameCoverImage(gameQuery.data, ImageSize.COVER_BIG);

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
    <Stack
      className={
        "bg-paper-2 p-4 gap-3 rounded-lg w-full h-full relative ion-activatable justify-between"
      }
    >
      <IonRippleEffect className={"rounded-lg"} />
      <Stack className={"gap-3 min-h-0"}>
        <Group className={"w-full flex-nowrap justify-between gap-2"}>
          <Box className={"relative z-10 min-w-0"}>
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
          className={
            "w-full line-clamp-6 text-sm leading-relaxed [&_a]:relative [&_a]:z-10"
          }
        />
      </Stack>
      <Group
        className={
          "flex-nowrap gap-3 pt-3 border-t border-paper-4 border-solid border-0"
        }
      >
        <Image
          alt=""
          src={cover.src ?? GAME_COVER_PLACEHOLDER}
          onError={cover.onError}
          radius={"sm"}
          className={"aspect-[264/354] w-9 shrink-0"}
        />
        <Link
          href={`/game/${gameId}?reviewId=${reviewId}`}
          className={
            "min-w-0 flex-1 after:absolute after:inset-0 after:content-['']"
          }
        >
          <Text lineClamp={1} size={"sm"} fw={600}>
            {gameQuery.data.name}
          </Text>
        </Link>
      </Group>
    </Stack>
  );
};

export { MobileTrendingReviewCard };
