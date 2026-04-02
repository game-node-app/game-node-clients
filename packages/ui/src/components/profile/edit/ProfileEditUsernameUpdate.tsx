import React, {
  FormEvent,
  FormEventHandler,
  useCallback,
  useMemo,
} from "react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import {
  Button,
  Flex,
  Group,
  List,
  rem,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import {
  CancelablePromise,
  ProfileService,
} from "../../../../../wrapper/src/server";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { notifications } from "@mantine/notifications";
import { IconCircle } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

interface Props extends BaseModalChildrenProps {
  withSkipButton?: boolean;
  onSkip?: () => void;
}

const ProfileEditUsernameUpdate = ({
  onClose,
  onSkip,
  withSkipButton = false,
}: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const profile = useUserProfile(userId);
  const profileMutation = useMutation({
    mutationFn: async (username: string) => {
      return ProfileService.profileControllerUpdateV1({
        username,
      });
    },
    onSuccess: () => {
      profile.invalidate();
      notifications.show({
        color: "green",
        message: t("profile.messages.usernameUpdated"),
      });
      if (onClose) onClose();
    },
  });

  const canUpdate: boolean = useMemo(() => {
    if (profile.data == undefined) return false;
    if (profile.data.usernameLastUpdatedAt == undefined) return true;
    const usernameUpdateDate = new Date(profile.data.usernameLastUpdatedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(-30);
    return usernameUpdateDate.getTime() < thirtyDaysAgo.getTime();
  }, [profile.data]);

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);
    const username = formData.get("username");
    if (!username) return;
    profileMutation.mutate(username as string);
  };

  return (
    <form className={"w-full h-full"} onSubmit={handleSubmit}>
      {(!canUpdate || profileMutation.isError) && (
        <Text c={"red"} className={"text-center mb-6"}>
          {t("profile.messages.usernameUpdateCooldown")}
        </Text>
      )}

      <Flex className={"w-full justify-center flex-wrap"}>
        <Stack className={"w-full lg:w-9/12"}>
          <TextInput
            label={t("profile.labels.newUsername")}
            name={"username"}
            id={"username"}
            required
            minLength={5}
            defaultValue={profile.data?.username}
          />
          <List
            icon={<ThemeIcon size={8} radius={"xl"}></ThemeIcon>}
            type={"unordered"}
          >
            <List.Item>{t("profile.usernameRules.unique")}</List.Item>
            <List.Item>{t("profile.usernameRules.minLength")}</List.Item>
            <List.Item>{t("profile.usernameRules.cooldown")}</List.Item>
          </List>
        </Stack>
        <Stack className={"w-full lg:w-11/12 items-end mt-8"}>
          <Group>
            {withSkipButton && (
              <Button
                color={"teal"}
                className={"w-28"}
                type={"button"}
                onClick={onSkip}
              >
                {t("actions.skip")}
              </Button>
            )}
            <Button
              className={"w-28"}
              loading={profileMutation.isPending}
              type={"submit"}
              disabled={!canUpdate || profileMutation.isPending}
            >
              {t("actions.submit")}
            </Button>
          </Group>
        </Stack>
      </Flex>
    </form>
  );
};

export { ProfileEditUsernameUpdate };
