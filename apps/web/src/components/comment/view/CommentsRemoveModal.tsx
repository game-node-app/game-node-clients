import React, { useMemo } from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, CommentService, FindAllCommentsDto } from "@/wrapper/server";
import { notifications } from "@mantine/notifications";
import { UserComment } from "@/components/comment/types";
import { getCommentSourceType } from "@/components/comment/util/getCommentSourceType";
import { getCommentSourceId } from "@/components/comment/util/getCommentSourceId";

interface Props extends BaseModalProps {
    comment: UserComment;
}

const CommentsRemoveModal = ({ opened, onClose, comment }: Props) => {
    const queryClient = useQueryClient();

    const sourceType = useMemo(() => {
        return getCommentSourceType(comment);
    }, [comment]);

    const sourceId = useMemo(() => {
        return getCommentSourceId(comment);
    }, [comment]);

    const commentRemoveMutation = useMutation<any, ApiError, any>({
        mutationFn: async (commentId: string) => {
            return CommentService.commentControllerDeleteV1(commentId, {
                sourceType,
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["comments", sourceType, sourceId],
            });
        },
        onSuccess: () => {
            notifications.show({
                color: "green",
                message: "Successfully removed your comment!",
            });
        },
    });

    return (
        <Modal title={"Remove comment"} opened={opened} onClose={onClose}>
            <Modal.Body>
                <SessionAuth>
                    <Stack w={"100%"} align={"center"}>
                        <Text>
                            Are you sure you want to remove this comment?
                        </Text>
                        <Group>
                            <Button onClick={onClose} color={"blue"}>
                                Go back
                            </Button>
                            <Button
                                onClick={() => {
                                    commentRemoveMutation.mutate(comment.id);
                                }}
                                color={"red"}
                            >
                                Confirm
                            </Button>
                        </Group>
                    </Stack>
                </SessionAuth>
            </Modal.Body>
        </Modal>
    );
};

export default CommentsRemoveModal;
