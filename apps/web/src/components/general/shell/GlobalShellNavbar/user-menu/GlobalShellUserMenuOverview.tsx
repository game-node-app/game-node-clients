import React from "react";
import { Group, Stack, Text } from "@mantine/core";
import { UserAvatar, useUserLevel, useUserProfile } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import Link from "next/link";

interface Props {
  userId: string;
}

const GlobalShellUserMenuOverview = ({ userId }: Props) => {
  const { t } = useTranslation();
  const { data: profile } = useUserProfile(userId);
  const { data: level } = useUserLevel(userId);

  return (
    <Link href={`/profile/${userId}`} className={"mb-2 px-2"}>
      <Group className={"gap-2 flex-nowrap"}>
        <UserAvatar userId={userId} size={"lg"} />
        <Stack className={"gap-1"}>
          <Text className={"text-white"}>{profile?.username}</Text>
          <Text className={"text-sm text-dimmed"}>
            {t("user.labels.level", { level: level?.currentLevel ?? 0 })}
          </Text>
        </Stack>
      </Group>
    </Link>
  );
};

export { GlobalShellUserMenuOverview };
