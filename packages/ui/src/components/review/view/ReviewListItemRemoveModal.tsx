import { useUserId } from "#@/components/auth/hooks/useUserId";
import { Modal } from "#@/util";
import { BaseModalProps } from "#@/util/types/modal-props";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { ReviewsService } from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

interface Props extends BaseModalProps {
  reviewId: string;
}

const ReviewListItemRemoveModal = ({ reviewId, opened, onClose }: Props) => {
  const { t } = useTranslation();
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
  });
  return (
    <Modal opened={opened} onClose={onClose} title={t("review.remove")}>
      <SessionAuth>
        <Stack align={"center"}>
          <Text fz={"lg"}>{t("review.messages.confirmRemove")}</Text>
          <Group wrap={"nowrap"} justify={"center"}>
            <Button onClick={onClose} color={"blue"}>
              {t("actions.goBack")}
            </Button>
            <Button
              onClick={() => {
                reviewRemoveMutation.mutate();
                onClose();
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

export { ReviewListItemRemoveModal };