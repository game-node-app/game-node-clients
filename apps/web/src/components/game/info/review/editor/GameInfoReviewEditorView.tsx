import React, { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ReviewsService } from "@repo/wrapper/server";
import { ActionIcon, Button, Flex, Group, Text, Tooltip } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
} from "@/util/trackMatomoEvent";
import {
  Break,
  GameInfoReviewEditor,
  GameRating,
  ReviewListItem,
  useOwnCollectionEntryForGameId,
  useReviewForUserIdAndGameId,
  useUserId,
  DetailsBox,
} from "@repo/ui";

const ReviewFormSchema = z.object({
  rating: z.number().min(0).max(5).default(5),
  content: z.string().optional().or(z.literal("")).or(z.literal("<p></p>")),
});

export type TReviewFormValues = z.infer<typeof ReviewFormSchema>;

interface IGameInfoReviewEditorViewProps {
  gameId: number;
}

const GameInfoReviewEditorView = ({
  gameId,
}: IGameInfoReviewEditorViewProps) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const hasSetEditMode = useRef<boolean>(false);

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
      if (reviewQuery.data) {
        trackMatomoEvent(
          EMatomoEventCategory.Review,
          EMatomoEventAction.Update,
          "Updated a review",
        );
      } else {
        trackMatomoEvent(
          EMatomoEventCategory.Review,
          EMatomoEventAction.Create,
          "Created a review",
        );
      }
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

  /**
   * Effect to synchronize isEditMode with reviewQuery.data
   */
  useEffect(() => {
    if (!hasSetEditMode.current && reviewQuery.data != undefined) {
      setIsEditMode(false);
      hasSetEditMode.current = true;
    }
  }, [isEditMode, reviewQuery.data]);

  useEffect(() => {
    if (reviewQuery.data && !formState.dirtyFields.rating) {
      setValue("rating", reviewQuery.data.rating);
    }
  }, [formState.dirtyFields.rating, reviewQuery.data, setValue]);

  const onSubmit = (data: TReviewFormValues) => {
    reviewMutation.mutate(data);
    reviewQuery.invalidate();
    setIsEditMode(false);
  };

  if (collectionEntryQuery.data == undefined) {
    return null;
  }

  const renderInnerContent = () => {
    if (!isEditMode && reviewQuery.data != undefined) {
      return (
        <ReviewListItem
          review={reviewQuery.data}
          onEditStart={() => setIsEditMode(true)}
        />
      );
    }

    return (
      <form className={"w-full h-full"} onSubmit={handleSubmit(onSubmit)}>
        <GameInfoReviewEditor
          gameId={gameId}
          onBlur={(html) => {
            setValue("content", html);
          }}
        />
        <Break />
        <Group mt={"md"} justify={"space-between"}>
          <Text
            fz={"sm"}
            ml={{ base: 0, lg: "0.5rem" }}
            className={"text-red-500"}
          >
            {error?.message}
          </Text>
          <Group>
            <GameRating
              value={rating}
              onChange={(v) => setValue("rating", v)}
              readOnly={false}
            />
            {reviewQuery.data != undefined && (
              <Tooltip label={"Cancel edit"}>
                <ActionIcon
                  size={"lg"}
                  variant={"default"}
                  c={"red"}
                  onClick={() => setIsEditMode(false)}
                >
                  <IconX />
                </ActionIcon>
              </Tooltip>
            )}
            <Button type={"submit"} loading={reviewMutation.isPending}>
              Submit
            </Button>
          </Group>
        </Group>
      </form>
    );
  };

  return (
    <DetailsBox
      title={"Your review"}
      description={
        isEditMode
          ? "Write your opinions about this game. Reviews are public to all users."
          : undefined
      }
    >
      <Flex wrap={"wrap"} w={"100%"} h={"100%"} justify={"start"}>
        {renderInnerContent()}
      </Flex>
    </DetailsBox>
  );
};

export default GameInfoReviewEditorView;
