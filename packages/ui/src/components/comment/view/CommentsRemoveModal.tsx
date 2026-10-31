import { UserComment } from "#@/components/comment/types";
import { getCommentSourceId } from "#@/components/comment/util/getCommentSourceId";
import { getCommentSourceType } from "#@/components/comment/util/getCommentSourceType";
import { createErrorNotification, Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { CommentService } from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { SessionAuth } from "#@/components/auth/SessionAuth";

interface Props extends BaseModalProps {
  comment: UserComment;
}

const CommentsRemoveModal = ({ opened, onClose, comment }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const sourceType = useMemo(() => {
    return getCommentSourceType(comment);
  }, [comment]);

  const sourceId = useMemo(() => {
    return getCommentSourceId(comment);
  }, [comment]);

  const commentRemoveMutation = useMutation({
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
        message: t("comment.messages.removed"),
      });
    },
    onError: createErrorNotification,
  });

  return (
    <Modal
      title={t("comment.titles.removeModal")}
      opened={opened}
      onClose={onClose}
    >
      <SessionAuth>
        <Stack w={"100%"} align={"center"}>
          <Text>{t("comment.messages.confirmRemove")}</Text>
          <Group>
            <Button onClick={onClose} color={"blue"}>
              {t("actions.goBack")}
            </Button>
            <Button
              onClick={() => {
                commentRemoveMutation.mutate(comment.id);
              }}
              color={"red"}
            >
              {t("actions.confirm")}
            </Button>
          </Group>
        </Stack>
      </SessionAuth>
    </Modal>
  );
};

export { CommentsRemoveModal };