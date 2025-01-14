import React from "react";
import { Review, ReviewsService } from "@/wrapper/server";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { BaseModalProps } from "@/util/types/modal-props";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserId from "@/components/auth/hooks/useUserId";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import ActionConfirm from "@/components/general/ActionConfirm";
import { notifications } from "@mantine/notifications";

interface Props extends BaseModalProps {
    reviewId: string;
}

const ReviewListItemRemoveModal = ({ reviewId, opened, onClose }: Props) => {
    const queryClient = useQueryClient();
    const userId = useUserId();
    const reviewRemoveMutation = useMutation({
        mutationFn: async () => {
            await ReviewsService.reviewsControllerDeleteV1(reviewId);
        },
        onSettled: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: ["review"] }).then();
            }
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: "Your review has been removed.",
            });
        },
    });
    return (
        <ActionConfirm
            onClose={onClose}
            opened={opened}
            onConfirm={() => {
                reviewRemoveMutation.mutate();
            }}
            title="Are you sure you want to remove this review?"
        />
    );
};

export default ReviewListItemRemoveModal;
