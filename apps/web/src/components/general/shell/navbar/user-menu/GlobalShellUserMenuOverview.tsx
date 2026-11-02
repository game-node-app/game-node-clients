import React from "react";
import { Group, Stack, Text } from "@mantine/core";
import { UserAvatar, useUserLevel, useUserProfile } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import Link from "next/link";

interface Props {
  userId: string;
  /** false when the overview is itself a menu target (console header) */
  withLink?: boolean;
}

const GlobalShellUserMenuOverview = ({ userId, withLink = true }: Props) => {
  const { t } = useTranslation();
  const { data: profile } = useUserProfile(userId);
  const { data: level } = useUserLevel(userId);

  const overview = (
      <Group className={"gap-2 flex-nowrap"}>
        <UserAvatar userId={userId} size={"lg"} />
        <Stack className={"gap-1"}>
          <Text className={"text-white"}>{profile?.username}</Text>
          <Text className={"text-sm text-dimmed"}>
            {t("user.labels.level", { level: level?.currentLevel ?? 0 })}
          </Text>
        </Stack>
      </Group>
  );

  if (!withLink) return overview;

  return (
    <Link href={`/profile/${userId}`} className={"mb-2 px-2"}>
      {overview}
    </Link>
  );
};

export { GlobalShellUserMenuOverview };
