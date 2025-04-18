import React, { useState } from "react";
import { Button, Stack, TextInput } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { AchievementsCodeService } from "@repo/wrapper/server";
import { notifications } from "@mantine/notifications";
import { BaseModalProps, Modal } from "#@/util";

const RedeemAchievementCodeModal = ({ opened, onClose }: BaseModalProps) => {
  const [achievementCode, setAchievementCode] = useState<string | undefined>(
    undefined,
  );

  const redeemMutation = useMutation({
    mutationFn: async () => {
      if (!achievementCode) {
        throw new Error("An achievement code must be provided!");
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
        message: "Successfully redeemed your code. Enjoy!",
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
      title={"Redeem a achievement with a code"}
    >
      <Stack>
        <TextInput
          value={achievementCode}
          onChange={(v) => setAchievementCode(v.currentTarget.value)}
          label={"Your achievement code"}
          description={"It may contain letters and numbers"}
        />
        <Button
          disabled={
            achievementCode == undefined || achievementCode.length === 0
          }
          onClick={() => {
            redeemMutation.mutate();
          }}
        >
          Redeem
        </Button>
      </Stack>
    </Modal>
  );
};

export { RedeemAchievementCodeModal };
