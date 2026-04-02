import React from "react";
import { CopyButton, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import classes from "./RecapYearTitle.module.css";
import { UserAvatarGroup, useUserId } from "#@/components";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
  targetYear: number;
  withShareButton?: boolean;
  withUserAvatar?: boolean;
}

const RecapYearTitle = ({
  userId,
  targetYear,
  withShareButton = false,
  withUserAvatar = false,
}: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const isOwnRecap = ownUserId === userId;
  const { copy } = useClipboard();

  return (
    <Stack className={"gap-3"}>
      <Group
        className={`gap-0 ${classes.recapYearTitle} w-full justify-center lg:w-fit`}
      >
        <Text span className={`text-4xl sm:text-6xl text-brand`}>
          {targetYear}
        </Text>
        <Text span className={"text-4xl sm:text-6xl"}>
          {t("recap.title")}
        </Text>
      </Group>
      <Group className={"justify-between"}>
        {withUserAvatar && <UserAvatarGroup userId={userId} />}
        {withShareButton && (
          <UnstyledButton
            onClick={() => {
              const url = `${window.location.origin}/users/${userId}/recap/${targetYear}`;
              copy(url);
              notifications.show({
                color: "green",
                title: t("recap.share.linkCopied"),
                message: t("recap.share.sharePrompt"),
                autoClose: 5000,
              });
            }}
          >
            <Text>{t("actions.share")}</Text>
          </UnstyledButton>
        )}
      </Group>
    </Stack>
  );
};

export { RecapYearTitle };
