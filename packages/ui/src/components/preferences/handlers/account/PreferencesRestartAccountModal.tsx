import React, { useState } from "react";
import { BaseModalProps, createErrorNotification, Modal } from "#@/util";
import { Button, List, Stack, Text, TextInput } from "@mantine/core";
import { useUserId, useUserProfile } from "#@/components";
import { useMutation } from "@tanstack/react-query";
import { UserAccountService } from "@repo/wrapper/server";
import Session from "supertokens-auth-react/recipe/session";

const PreferencesRestartAccountModal = ({
  opened,
  onClose,
}: BaseModalProps) => {
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
    <Modal title={"Restart Account"} onClose={onClose} opened={opened}>
      <Stack>
        <Text className={"text-lg font-medium"}>
          Are you sure you want to restart your account?
        </Text>
        <Text>What this will do</Text>
        <List listStyleType={"disc"}>
          <List.Item>Wipe your profile</List.Item>
          <List.Item>Wipe your achievements</List.Item>
          <List.Item>Wipe your connections</List.Item>
          <List.Item>Wipe your activity</List.Item>
          <List.Item>Wipe your preferences</List.Item>
          <List.Item>Wipe your reviews</List.Item>
          <List.Item>
            Wipe your library, including collections and added games
          </List.Item>
          <List.Item>
            Wipe all playtime related information, including manual sessions
          </List.Item>
        </List>
        <Text className={"text-sm text-dimmed"}>
          This won&#39;t remove your email and it&#39;s user id association from
          our databases. Nor will it remove collected analytic data.
        </Text>
        <Text className={"text-sm text-dimmed"}>
          If you want to completely remove this data, please reach out to us
          through Discord or email (
          <a href={"mailto:support@gamenode.app"}>support@gamenode.app</a>).
        </Text>
        <Text>
          This action is{" "}
          <Text span className={"font-bold"}>
            irreversible
          </Text>
          . We won&#39;t be able to restore your account if you restart it.
        </Text>
        <Text>
          After using this service, you will be logged off, and will be able to
          log-in again with a brand new account.
        </Text>
        <TextInput
          label={"Confirm with your username"}
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
          Confirm
        </Button>
      </Stack>
    </Modal>
  );
};

export { PreferencesRestartAccountModal };
