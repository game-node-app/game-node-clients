import React, { useEffect, useRef, useState } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Group,
    LoadingOverlay,
    Stack,
} from "@mantine/core";
import CommentEditor from "@/components/comment/editor/CommentEditor";
import { IconX } from "@tabler/icons-react";
import { Editor } from "@tiptap/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentService, CreateCommentDto } from "@/wrapper/server";
import { notifications } from "@mantine/notifications";
import { useComment } from "@/components/comment/hooks/useComment";
import {
    EMatomoEventAction,
    EMatomoEventCategory,
    trackMatomoEvent,
} from "@/util/trackMatomoEvent";

interface Props {
    /**
     * If available, user will be able to modify this comment. <br>
     * Ideally, should be cleared when 'onCancel' is called.
     */
    commentId?: string;
    /**
     * Triggered when the user clicks the cancel or finishes submitting with success.
     */
    onEditEnd?: () => void;
    sourceType: CreateCommentDto.sourceType;
    sourceId: string;
    childOf?: string;
}

const CommentEditorView = ({
    commentId,
    sourceType,
    sourceId,
    onEditEnd,
    childOf,
}: Props) => {
    const queryClient = useQueryClient();
    const editorRef = useRef<Editor>();
    const commentQuery = useComment(commentId, sourceType);
    const [previousContent, setPreviousContent] = useState<string | undefined>(
        undefined,
    );

    const clearEditor = () => {
        editorRef.current?.commands.clearContent();
    };

    const commentMutation = useMutation({
        mutationFn: async () => {
            if (editorRef.current == undefined) return;

            const content = editorRef.current?.getHTML();
            if (commentId) {
                return CommentService.commentControllerUpdateV1(commentId, {
                    sourceType,
                    content: content,
                });
            }

            return CommentService.commentControllerCreateV1({
                sourceId,
                sourceType,
                content: content,
                childOf,
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
                message: "Successfully submitted your comment!",
            });
            clearEditor();
            if (onEditEnd) onEditEnd();

            // Matomo
            if (commentId) {
                trackMatomoEvent(
                    EMatomoEventCategory.Comment,
                    EMatomoEventAction.Create,
                    "Updated a comment",
                );
                return;
            }

            if (sourceType === CreateCommentDto.sourceType.REVIEW) {
                trackMatomoEvent(
                    EMatomoEventCategory.Review,
                    EMatomoEventAction.Comment,
                    "Added comment to a review",
                );
            }

            trackMatomoEvent(
                EMatomoEventCategory.Comment,
                EMatomoEventAction.Create,
                "Created a comment",
            );
        },
    });

    const isUpdateAction =
        commentId != undefined && commentQuery.data != undefined;

    useEffect(() => {
        if (commentId == undefined && previousContent != undefined) {
            setPreviousContent(undefined);
        }

        if (commentId != undefined && commentQuery.data != undefined) {
            setPreviousContent(commentQuery.data.content);
        }
    }, [commentId, commentQuery.data, previousContent]);

    return (
        <Stack className={"w-full relative"}>
            <LoadingOverlay visible={commentQuery.isLoading} />
            <Box className={"w-full"}>
                <CommentEditor
                    content={previousContent}
                    onCreate={(props) => {
                        editorRef.current = props.editor;
                    }}
                />
            </Box>

            <Group className={"w-full justify-end"}>
                <ActionIcon
                    size={"lg"}
                    variant={"default"}
                    onClick={() => {
                        clearEditor();
                        if (onEditEnd) onEditEnd();
                    }}
                >
                    <IconX />
                </ActionIcon>
                <Button
                    type={"button"}
                    loading={commentMutation.isPending}
                    onClick={() => {
                        commentMutation.mutate();
                    }}
                >
                    {isUpdateAction ? "Update" : "Submit"}
                </Button>
            </Group>
        </Stack>
    );
};

export default CommentEditorView;
