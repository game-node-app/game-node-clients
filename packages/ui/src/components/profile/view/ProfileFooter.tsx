import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useSettingsModalState } from "#@/components/settings/hooks/useSettingsModalState";
import { ProfileUserInfoConnections } from "#@/components/profile/view/ProfileUserInfoConnections";
import { useShareText } from "#@/context";
import { Button, Divider, Group, Paper, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useI18nContext, useTranslation } from "@repo/locales";
import type { ProfileResponseDto } from "@repo/wrapper/server";
import { IconLink, IconPlus, IconShare } from "@tabler/icons-react";

export function ProfileFooter({ profile }: { profile: ProfileResponseDto }) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const isOwner = useUserId() === profile.userId;
  const settings = useSettingsModalState();
  const share = useShareText();
  const url = `https://gamenode.app/profile/${encodeURIComponent(profile.userId)}`;
  const joined = profile.createdAt ? new Date(profile.createdAt) : null;
  const memberSince =
    joined && Number.isFinite(joined.getTime())
      ? new Intl.DateTimeFormat(language, {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(joined)
      : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      notifications.show({ message: t("profile.overview.linkCopied") });
    } catch {
      notifications.show({
        color: "red",
        message: t("profile.overview.copyFailed"),
      });
    }
  };

  const shareProfile = async () => {
    try {
      await share(url);
    } catch {
      await copyLink();
    }
  };

  return (
    <Paper
      component="footer"
      radius="lg"
      p={{ base: "md", sm: "xl" }}
      withBorder
      className="bg-body"
    >
      <Stack gap="md">
        <Stack gap="xs">
          <Text size="sm" fw={600} c="dimmed">
            {t("profile.overview.connections")}
          </Text>
          <Group gap="xs">
            <ProfileUserInfoConnections userId={profile.userId} />
            {isOwner && (
              <Button
                variant="default"
                size="compact-sm"
                radius="md"
                className="border-dashed"
                leftSection={<IconPlus size={15} aria-hidden />}
                onClick={() => settings.open("connections", "platforms")}
              >
                {t("profile.overview.linkAccount")}
              </Button>
            )}
          </Group>
        </Stack>
        <Divider />
        <Group justify="space-between" gap="sm">
          <Group gap="sm">
            {memberSince && (
              <Text size="sm" c="dimmed">
                {t("profile.memberSince", { date: memberSince })}
              </Text>
            )}
            {profile.isSupporter &&
              profile.supporterPreferences?.showOnSupportersWall && (
                <Text size="sm" c="var(--profile-accent-text, #c7a6ff)">
                  {t("profile.overview.onSupportersWall")}
                </Text>
              )}
          </Group>
          <Group gap="xs">
            <Button
              variant="default"
              size="compact-md"
              radius="md"
              leftSection={<IconLink size={16} aria-hidden />}
              onClick={() => void copyLink()}
            >
              {t("profile.overview.copyLink")}
            </Button>
            <Button
              variant="default"
              size="compact-md"
              radius="md"
              leftSection={<IconShare size={16} aria-hidden />}
              onClick={() => void shareProfile()}
            >
              {t("profile.overview.shareProfile")}
            </Button>
            {isOwner && (
              <Button
                variant="subtle"
                size="compact-md"
                onClick={() => settings.open("connections", "platforms")}
              >
                {t("profile.overview.editAccounts")}
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
