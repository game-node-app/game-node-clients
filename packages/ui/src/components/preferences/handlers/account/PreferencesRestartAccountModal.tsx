import React, { useState } from "react";
import { BaseModalProps, createErrorNotification, Modal } from "#@/util";
import { Button, List, Stack, Text, TextInput } from "@mantine/core";
import { useUserId, useUserProfile } from "#@/components";
import { useMutation } from "@tanstack/react-query";
import { UserAccountService } from "@repo/wrapper/server";
import Session from "supertokens-auth-react/recipe/session";
import { useTranslation } from "@repo/locales";

const PreferencesRestartAccountModal = ({
  opened,
  onClose,
}: BaseModalProps) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const { data: profile } = useUserProfile(userId);
  const [hasConfirmedUsername, setHasConfirmedUsername] = useState(false);

  const restartMutation = useMutation({
    mutationFn: async () => {
      await UserAccountService.userAccountControllerRestartUserAccountV1();
    },
    onError: createErrorNotification,
    onSuccess: async () => {
      await Session.signOut();
    },
  });

  return (
    <Modal
      title={t("preferences.titles.restartAccount")}
      onClose={onClose}
      opened={opened}
    >
      <Stack>
        <Text className={"text-lg font-medium"}>
          {t("preferences.messages.confirmRestart")}
        </Text>
        <Text>{t("preferences.labels.whatWillDo")}</Text>
        <List listStyleType={"disc"}>
          <List.Item>{t("preferences.restartWarnings.profile")}</List.Item>
          <List.Item>{t("preferences.restartWarnings.achievements")}</List.Item>
          <List.Item>{t("preferences.restartWarnings.connections")}</List.Item>
          <List.Item>{t("preferences.restartWarnings.activity")}</List.Item>
          <List.Item>{t("preferences.restartWarnings.preferences")}</List.Item>
          <List.Item>{t("preferences.restartWarnings.reviews")}</List.Item>
          <List.Item>{t("preferences.restartWarnings.libraryFull")}</List.Item>
          <List.Item>{t("preferences.restartWarnings.playtimeFull")}</List.Item>
        </List>
        <Text className={"text-sm text-dimmed"}>
          {t("preferences.messages.restartNote1")}
        </Text>
        <Text className={"text-sm text-dimmed"}>
          {t("preferences.messages.restartNote2")}
        </Text>
        <Text>{t("preferences.messages.irreversible")}</Text>
        <Text>{t("preferences.messages.restartLogout")}</Text>
        <TextInput
          label={t("preferences.labels.confirmUsername")}
          description={profile?.username}
          placeholder={profile?.username}
          onInput={(evt) => {
            const value = evt.currentTarget.value;
            setHasConfirmedUsername(value === profile?.username);
          }}
        />
        <Button
          variant={"default"}
          disabled={!hasConfirmedUsername}
          loading={restartMutation.isPending}
          onClick={() => restartMutation.mutate()}
        >
          {t("actions.confirm")}
        </Button>
      </Stack>
    </Modal>
  );
};

export { PreferencesRestartAccountModal };
