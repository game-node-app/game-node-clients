import React, { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { CommentEditor } from "#@/components/comment/editor/CommentEditor";
import { IconArrowRight } from "@tabler/icons-react";
import { Editor } from "@tiptap/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentService, CreateCommentDto } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { useComment } from "#@/components/comment/hooks/useComment";
import {
  EMatomoEventAction,
  EMatomoEventCategory,
  trackMatomoEvent,
} from "#@/util/trackMatomoEvent";
import { useUserProfile } from "#@/components";
import { useCommentsContext } from "#@/components/comment/view/context.ts";
import { createErrorNotification } from "#@/util";

interface Props {
  /**
   * If available, user will be able to modify this comment. <br>
   * Ideally, should be cleared when 'onEditEnd' is called.
   */
  commentId?: string;
  /**
   * Triggered when the user clicks the cancel or finishes submitting with success.
   */
  onEditEnd?: () => void;
  sourceType: CreateCommentDto.sourceType;
  sourceId: string;
}

const CommentEditorView = ({
  commentId,
  sourceType,
  sourceId,
  onEditEnd,
}: Props) => {
  const context = useCommentsContext();
  const queryClient = useQueryClient();
  const editorRef = useRef<Editor>(null);
  /**
   * Queries to fetch edited comment and/or replied to comment
   */
  const commentQuery = useComment(commentId, sourceType);
  const childOfProfileQuery = useUserProfile(
    context.repliedCommentProfileUserId,
  );

  const isLoading = commentQuery.isLoading || childOfProfileQuery.isLoading;

  const [previousContent, setPreviousContent] = useState<string | undefined>(
    undefined,
  );

  const [content, setContent] = useState("");

  const clearTargetComment = () => {
    context.updateContext({
      repliedCommentId: undefined,
      repliedCommentProfileUserId: undefined,
    });
  };

  const clearEditor = () => {
    editorRef.current?.commands.clearContent();
    clearTargetComment();
  };

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (editorRef.current == undefined) return;

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
        childOf: context.repliedCommentId,
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
          EMatomoEventAction.Update,
          "Updated a comment",
        );
        return;
      }

      trackMatomoEvent(
        EMatomoEventCategory.Comment,
        EMatomoEventAction.Create,
        "Created a comment",
      );
    },
    onError: (err) => {
      if (onEditEnd) onEditEnd();
      createErrorNotification(err);
    },
  });

  useEffect(() => {
    if (commentId == undefined && previousContent != undefined) {
      setPreviousContent(undefined);
    }

    if (commentId != undefined && commentQuery.data != undefined) {
      setPreviousContent(commentQuery.data.content);
    }
  }, [commentId, commentQuery.data, previousContent]);

  /**
   * Essentially focuses the editor when the reply button is pressed
   */
  useEffect(() => {
    if (context.repliedCommentId != undefined) {
      editorRef.current?.commands.focus();
    }
  }, [context.repliedCommentId]);

  return (
    <Stack className={"w-full sticky py-1 bottom-0 left-0 gap-1.5 mt-auto"}>
      <LoadingOverlay visible={isLoading} />
      {childOfProfileQuery.data != undefined && (
        <UnstyledButton onClick={clearTargetComment}>
          <Text className={"text-sm text-dimmed text-start underline"}>
            Replying to {childOfProfileQuery.data.username}&apos; comment
          </Text>
        </UnstyledButton>
      )}

      <Group className={"w-full flex-nowrap items-center"}>
        <Box className={"w-10/12 lg:flex-grow"}>
          <ScrollArea.Autosize mah={100}>
            <CommentEditor
              content={previousContent}
              onCreate={(props) => {
                // eslint-disable-next-line react/prop-types
                editorRef.current = props.editor;
              }}
              onUpdate={(props) => {
                setContent(props.editor.getHTML());
              }}
            />
          </ScrollArea.Autosize>
        </Box>

        <ActionIcon
          size={"xl"}
          onClick={() => {
            commentMutation.mutate();
          }}
          loading={commentMutation.isPending}
        >
          <IconArrowRight />
        </ActionIcon>
      </Group>
    </Stack>
  );
};

export { CommentEditorView };
