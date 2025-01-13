import { UserComment } from "@/components/comment/types";
import React, { useMemo, useState } from "react";
import { Divider, Group } from "@mantine/core";
import CommentEditorView from "@/components/comment/editor/CommentEditorView";
import CommentsListItem from "@/components/comment/view/CommentsListItem";
import { CreateCommentDto } from "@/wrapper/server";

interface UseRenderedCommentsProps {
    data: UserComment[];
    // The original content ID (e.g. the review id)
    sourceId: string;
    sourceType: CreateCommentDto.sourceType;
}

export function useRenderedComments({
    data,
    sourceId,
    sourceType,
}: UseRenderedCommentsProps) {
    const [editedCommentId, setEditedCommentId] = useState<string | undefined>(
        undefined,
    );

    return useMemo(() => {
        return data
            .toSorted((a, b) => {
                const aCreateDate = new Date(a.createdAt);
                const bCreateDate = new Date(b.createdAt);
                return aCreateDate.getTime() - bCreateDate.getTime();
            })
            .map((comment) => {
                if (comment.id === editedCommentId) {
                    return (
                        <Group
                            key={`editing-${comment.id}`}
                            className={"w-full h-full"}
                            wrap={"nowrap"}
                        >
                            <Divider
                                orientation={"vertical"}
                                color={"brand"}
                                size={"sm"}
                            />
                            <CommentEditorView
                                sourceType={sourceType}
                                sourceId={sourceId}
                                commentId={editedCommentId}
                                onEditEnd={() => {
                                    setEditedCommentId(undefined);
                                }}
                            />
                        </Group>
                    );
                }

                return (
                    <Group
                        className={"w-full h-full"}
                        wrap={"nowrap"}
                        key={comment.id}
                    >
                        <Divider orientation={"vertical"} size={"sm"} />
                        <CommentsListItem
                            key={comment.id}
                            comment={comment}
                            onEditStart={(commentId) =>
                                setEditedCommentId(commentId)
                            }
                        />
                    </Group>
                );
            });
    }, [data, editedCommentId, sourceId, sourceType]);
}
