import React from "react";
import { Box, Group, Skeleton, Stack, Text } from "@mantine/core";
import {
  DEFAULT_REVIEW_EDITOR_EXTENSIONS,
  GameFigureImage,
  GameGridItem,
  GameRating,
  Link,
  useGame,
  UserAvatarGroup,
  useReview,
} from "@repo/ui";
import { EditorContent, useEditor } from "@tiptap/react";
import { IonRippleEffect } from "@ionic/react";

interface Props {
  reviewId: string;
}

const MobileTrendingReviewCard = ({ reviewId }: Props) => {
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
    return <Skeleton className={"w-full h-full"} />;
  } else if (reviewQuery.data == undefined || gameQuery.data == undefined) {
    return null;
  }

  return (
    <Link
      href={`/game/${gameId}?reviewId=${reviewId}`}
      className={"w-full h-full"}
    >
      <Stack
        className={
          "bg-paper-2 p-2 gap-0 rounded-md w-full h-full relative ion-activatable"
        }
      >
        <IonRippleEffect className={"rounded-md"} />
        <Group className={"w-full flex-nowrap justify-start gap-1"}>
          <Box className={"min-w-16 w-16"}>
            <GameFigureImage game={gameQuery.data} />
          </Box>
          <Stack className={"grow gap-xs"}>
            <Text className={"font-bold text-sm"}>{gameQuery.data.name}</Text>
            <UserAvatarGroup
              groupProps={{
                gap: "xs",
              }}
              avatarProps={{
                size: "xs",
              }}
              textProps={{
                lineClamp: 1,
                size: "xs",
                className: "!text-dimmed-alt-0",
              }}
              userId={reviewQuery.data.profileUserId}
            />
            <GameRating value={reviewQuery.data.rating} size={"md"} />
          </Stack>
        </Group>
        <EditorContent
          editor={editor}
          className={"w-full line-clamp-6 text-dimmed-alt-0 text-sm"}
        />
      </Stack>
    </Link>
  );
};

export { MobileTrendingReviewCard };
