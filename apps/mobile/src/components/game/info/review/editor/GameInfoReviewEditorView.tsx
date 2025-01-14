import React, { useEffect, useRef, useState } from "react";
import GameInfoReviewEditor from "@/components/game/info/review/editor/GameInfoReviewEditor";
import { DetailsBox } from "@/components/general/DetailsBox";
import { z } from "zod";
import { CreateReviewDto, ReviewsService } from "@/wrapper/server";
import { ActionIcon, Box, Button, Flex, Group, Rating, Stack, Text, Tooltip } from "@mantine/core";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Break from "@/components/general/Break";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useReviewForUserId from "@/components/review/hooks/useReviewForUserIdAndGameId";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import useUserId from "@/components/auth/hooks/useUserId";
import { notifications } from "@mantine/notifications";
import ReviewListItem from "@/components/review/view/ReviewListItem";
import { useOwnCollectionEntryForGameId } from "@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { IconX } from "@tabler/icons-react";
import GameRating from "@/components/general/input/GameRating";
import { BaseModalChildrenProps } from "@/util/types/modal-props";

const ReviewFormSchema = z.object({
    rating: z.number().min(0).max(5).default(5),
    content: z.string().min(20, "Your review needs at least 20 characters."),
});

export type TReviewFormValues = z.infer<typeof ReviewFormSchema>;

interface IGameInfoReviewEditorViewProps extends BaseModalChildrenProps {
    gameId: number;
}

const GameInfoReviewEditorView = ({ gameId, onClose }: IGameInfoReviewEditorViewProps) => {
    const { watch, handleSubmit, formState, setValue } = useForm<TReviewFormValues>({
        mode: "onSubmit",
        resolver: zodResolver(ReviewFormSchema),
        defaultValues: {
            rating: 5,
        },
    });
    const queryClient = useQueryClient();

    const userId = useUserId();
    const reviewQuery = useReviewForUserId(userId, gameId);
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
                message: reviewQuery.data != undefined ? "Review successfully updated!" : "Review created!",
                color: "green",
            });
            if (onClose) onClose();
        },
        onError: () => {
            notifications.show({
                title: "Failed",
                message: "We couldn't save your review. If this persists, please contact support.",
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
                    Your reviews are public to all users. Please exercise common sense and respect our community
                    guidelines while posting.
                </Text>
                <GameInfoReviewEditor gameId={gameId} onBlur={(v) => setValue("content", v)} />
                <Break />
                <Group mt={"md"} justify={"space-between"}>
                    <Text fz={"sm"} ml={{ base: 0, lg: "0.5rem" }} className={"text-red-500"}>
                        {error?.message}
                    </Text>
                    <Group>
                        <GameRating
                            readOnly={false}
                            defaultValue={5}
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

export default GameInfoReviewEditorView;
