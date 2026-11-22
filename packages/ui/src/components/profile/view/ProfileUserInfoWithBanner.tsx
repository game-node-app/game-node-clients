import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useSettingsModalState } from "#@/components/settings/hooks/useSettingsModalState";
import { ProfileBanner } from "#@/components/profile/view/ProfileBanner";
import { ProfileUserInfo } from "#@/components/profile/view/ProfileUserInfo";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { getActiveSupporterPerks } from "#@/components/supporter/perks/supporterPerks";
import { Button, Group, Paper, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCrown, IconPhoto } from "@tabler/icons-react";
import type { CSSProperties, PropsWithChildren, ReactNode } from "react";

export interface ProfileUserInfoWithBannerProps extends PropsWithChildren {
  userId: string;
  navigation?: ReactNode;
}

const ProfileUserInfoWithBanner = ({
  userId,
  navigation,
  children,
}: ProfileUserInfoWithBannerProps) => {
  const { t } = useTranslation();
  const settings = useSettingsModalState();
  const isOwner = useUserId() === userId;
  const profileQuery = useUserProfile(userId);
  const profile = profileQuery.data;
  const perks = getActiveSupporterPerks(profile);

  if (profileQuery.isLoading) return <CenteredLoading />;
  if (!profile) {
    return <CenteredErrorMessage message={t("profile.messages.fetchFailed")} />;
  }

  const accentVars: CSSProperties | undefined = perks?.theme
    ? ({
        "--profile-accent": perks.accent,
        "--profile-accent-text": perks.accentInk,
        "--profile-accent-soft": perks.accentSoft,
      } as CSSProperties)
    : undefined;

  return (
    <Stack
      id="profile-user-info-banner"
      className="w-full min-w-0 gap-6"
      style={accentVars}
    >
      <Paper component="header" radius="lg" withBorder className="bg-body">
        <ProfileBanner userId={userId} layout="cover">
          {isOwner && !profile.banner && !profile.bannerVideo && (
            <Button
              variant="default"
              radius="md"
              size="compact-sm"
              className="absolute end-4 top-4"
              leftSection={<IconPhoto size={14} aria-hidden />}
              onClick={() => settings.open("profile", "images")}
            >
              {t("profile.overview.addBanner")}
            </Button>
          )}
          {perks?.theme && (
            <Group
              data-testid="supporter-theme-strip"
              gap={6}
              justify="flex-end"
              className="absolute inset-x-0 bottom-0 h-6 px-4 text-sm font-semibold sm:h-7"
              style={{ backgroundColor: perks.accent, color: perks.onAccent }}
            >
              <IconCrown size={16} aria-hidden />
              {t("supporter.badge.label")}
            </Group>
          )}
        </ProfileBanner>
        <Stack className="px-4 pb-4 sm:px-8" gap="md">
          <ProfileUserInfo profile={profile} perks={perks} />
          {navigation}
        </Stack>
      </Paper>
      {children}
    </Stack>
  );
};

export { ProfileUserInfoWithBanner };
