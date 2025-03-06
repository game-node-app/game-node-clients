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
  /**
   * Queries to fetch edited comment and/or replied to comment
   */
  const commentQuery = useComment(commentId, sourceType);
  const childOfCommentQuery = useComment(childOf, sourceType);
  const childOfProfileQuery = useUserProfile(
    childOfCommentQuery.data?.profileUserId,
  );

  const isLoading =
    commentQuery.isLoading ||
    childOfCommentQuery.isLoading ||
    childOfProfileQuery.isLoading;

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
    if (childOf != undefined) {
      editorRef.current?.commands.focus();
    }
  }, [childOf]);

  return (
    <Stack className={"w-full sticky py-1 bottom-0 left-0 gap-1.5"}>
      <LoadingOverlay visible={isLoading} />
      {childOfProfileQuery.data != undefined && (
        <UnstyledButton onClick={onEditEnd}>
          <Text className={"text-sm text-dimmed text-start"}>
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
