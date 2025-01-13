import React from "react";
import { Review, ReviewsService } from "@/wrapper/server";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { BaseModalProps } from "@/util/types/modal-props";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserId from "@/components/auth/hooks/useUserId";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
    EMatomoEventAction,
    EMatomoEventCategory,
    trackMatomoEvent,
} from "@/util/trackMatomoEvent";

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
            trackMatomoEvent(
                EMatomoEventCategory.Review,
                EMatomoEventAction.Remove,
                "Removed a review",
            );
        },
    });
    return (
        <Modal opened={opened} onClose={onClose} title={"Remove review"}>
            <SessionAuth>
                <Modal.Body>
                    <Stack align={"center"}>
                        <Text fz={"lg"}>
                            Are you sure you want to remove this review?
                        </Text>
                        <Group wrap={"nowrap"} justify={"center"}>
                            <Button onClick={onClose} color={"blue"}>
                                Go back
                            </Button>
                            <Button
                                onClick={() => {
                                    reviewRemoveMutation.mutate();
                                    onClose();
                                }}
                                color={"red"}
                            >
                                Confirm
                            </Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </SessionAuth>
        </Modal>
    );
};

export default ReviewListItemRemoveModal;
