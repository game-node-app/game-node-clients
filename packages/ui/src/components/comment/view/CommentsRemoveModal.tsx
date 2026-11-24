import type { CommentSource } from "#@/components/comment/types";
import { createErrorNotification, Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { Button, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { CommentService } from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SessionAuth } from "#@/components/auth/SessionAuth";

interface Props extends BaseModalProps, CommentSource {
  commentId: string;
}

const CommentsRemoveModal = ({
  opened,
  onClose,
  commentId,
  sourceId,
  sourceType,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const commentRemoveMutation = useMutation({
    mutationFn: () => {
      return CommentService.commentControllerDeleteV1(commentId, {
        sourceType,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", sourceType, sourceId],
      });
      // the comment count on the source's card comes from its statistics
      void queryClient.invalidateQueries({
        queryKey: ["statistics", sourceType, sourceId],
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
                commentRemoveMutation.mutate();
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
