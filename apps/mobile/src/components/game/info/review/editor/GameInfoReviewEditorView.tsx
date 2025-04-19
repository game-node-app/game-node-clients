import React from "react";
import { z } from "zod";
import { ReviewsService } from "@repo/wrapper/server";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  BaseModalChildrenProps,
  CenteredErrorMessage,
  GameRating,
  getErrorMessage,
  useOwnCollectionEntryForGameId,
  useReviewForUserIdAndGameId,
  useUserId,
  GameInfoReviewEditor,
  Break,
} from "@repo/ui";

const ReviewFormSchema = z.object({
  rating: z.number().min(0).max(5).default(5),
  content: z.string().optional().or(z.literal("")).or(z.literal("<p></p>")),
});

export type TReviewFormValues = z.infer<typeof ReviewFormSchema>;

interface IGameInfoReviewEditorViewProps extends BaseModalChildrenProps {
  gameId: number;
}

const GameInfoReviewEditorView = ({
  gameId,
  onClose,
}: IGameInfoReviewEditorViewProps) => {
  const { watch, handleSubmit, formState, setValue } =
    useForm<TReviewFormValues>({
      mode: "onSubmit",
      resolver: zodResolver(ReviewFormSchema),
      defaultValues: {
        rating: 5,
      },
    });
  const queryClient = useQueryClient();

  const userId = useUserId();
  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);
  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);

  const reviewMutation = useMutation({
    mutationFn: async (data: TReviewFormValues) => {
      await ReviewsService.reviewsControllerCreateOrUpdateV1({
        ...data,
        gameId: gameId,
      });
    },
    onSuccess: () => {
      reviewQuery.invalidate();
      notifications.show({
        title: "Success",
        message:
          reviewQuery.data != undefined
            ? "Review successfully updated!"
            : "Review created!",
        color: "green",
      });
      if (onClose) onClose();
    },
    onError: () => {
      notifications.show({
        title: "Failed",
        message:
          "We couldn't save your review. If this persists, please contact support.",
        color: "red",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
  });

  const rating = watch("rating");
  const error = formState.errors.content || formState.errors.rating;

  const onSubmit = (data: TReviewFormValues) => {
    reviewMutation.mutate(data);
    reviewQuery.invalidate();
  };

  if (collectionEntryQuery.data == undefined) {
    return null;
  }

  return (
    <Stack className={"w-full h-full min-h-[600px]"}>
      <form className={"w-full h-full"} onSubmit={handleSubmit(onSubmit)}>
        <Text className={"text-sm text-dimmed mb-2"}>
          Your reviews are public to all users. Please exercise common sense and
          respect our community guidelines while posting.
        </Text>
        <GameInfoReviewEditor
          gameId={gameId}
          onBlur={(v) => setValue("content", v)}
        />
        <Break />
        <Group mt={"md"} justify={"space-between"}>
          {reviewMutation.isError && (
            <CenteredErrorMessage
              message={getErrorMessage(reviewMutation.error)}
            />
          )}
          {error && error.message && (
            <CenteredErrorMessage message={error.message} />
          )}
          <Group className={"w-full justify-end"}>
            <GameRating
              readOnly={false}
              value={rating}
              onChange={(v) => setValue("rating", v)}
            />
            <Button type={"submit"} loading={reviewMutation.isPending}>
              Submit
            </Button>
          </Group>
        </Group>
      </form>
    </Stack>
  );
};

export { GameInfoReviewEditorView };
