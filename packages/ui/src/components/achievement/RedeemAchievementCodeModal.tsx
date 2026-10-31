import { BaseModalProps, Modal } from "#@/util";
import { Button, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { AchievementsCodeService } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const RedeemAchievementCodeModal = ({ opened, onClose }: BaseModalProps) => {
  const { t } = useTranslation();
  const [achievementCode, setAchievementCode] = useState<string | undefined>(
    undefined,
  );

  const redeemMutation = useMutation({
    mutationFn: async () => {
      if (!achievementCode) {
        throw new Error(t("achievements.validation.codeRequired"));
      }
      await AchievementsCodeService.achievementsCodeControllerConsumeV1(
        achievementCode,
      );
    },
    onError: (err) => {
      notifications.show({
        message: err.message,
        color: "red",
      });
    },
    onSuccess: () => {
      notifications.show({
        message: t("achievements.messages.redeemed"),
        color: "green",
      });
      onClose();
      // TODO: Invalidate queries here
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("achievements.titles.redeemCode")}
    >
      <Stack>
        <TextInput
          value={achievementCode}
          onChange={(v) => setAchievementCode(v.currentTarget.value)}
          label={t("achievements.labels.code")}
          description={t("achievements.descriptions.codeFormat")}
        />
        <Button
          disabled={
            achievementCode == undefined || achievementCode.length === 0
          }
          onClick={() => {
            redeemMutation.mutate();
          }}
        >
          {t("achievements.buttons.redeem")}
        </Button>
      </Stack>
    </Modal>
  );
};

export { RedeemAchievementCodeModal };