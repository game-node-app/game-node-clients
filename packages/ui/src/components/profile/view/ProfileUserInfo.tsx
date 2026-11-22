import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { ProfileAvatarSectionButtons } from "#@/components/profile/view/ProfileAvatarSectionButtons";
import { ProfileFollowInfo } from "#@/components/profile/view/ProfileFollowInfo";
import { SupporterAvatarFrame } from "#@/components/supporter/perks/SupporterAvatarFrame";
import { SupporterBadge } from "#@/components/supporter/perks/SupporterBadge";
import { SupporterPresenceChip } from "#@/components/supporter/perks/SupporterPresenceChip";
import { SupporterTitle } from "#@/components/supporter/perks/SupporterTitle";
import type { ActiveSupporterPerks } from "#@/components/supporter/perks/supporterPerks";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { Box, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  FollowInfoRequestDto,
  type ProfileResponseDto,
} from "@repo/wrapper/server";

interface Props {
  profile: ProfileResponseDto;
  perks: ActiveSupporterPerks | null;
}

const ProfileUserInfo = ({ profile, perks }: Props) => {
  const { t } = useTranslation();
  const { userId, username, bio } = profile;
  const { data: level } = useUserLevel(userId);
  const avatar = (
    <UserAvatar
      userId={userId}
      profile={profile}
      alt={username}
      className="[--avatar-size:96px] sm:[--avatar-size:150px]"
    />
  );

  return (
    <Box className="relative min-w-0 pt-[54px] sm:min-h-28 sm:ps-[192px] sm:pt-4">
      <Box className="absolute start-0 top-0 z-10 w-fit -translate-y-[60%]">
        {perks?.border ? (
          <SupporterAvatarFrame
            accent={perks.accent}
            className="!p-[3px] sm:!p-[6px]"
          >
            {avatar}
          </SupporterAvatarFrame>
        ) : (
          <Box
            data-testid="profile-avatar-frame"
            className="rounded-full border-[3px] border-solid border-line bg-body p-0.5 sm:p-1.5"
          >
            {avatar}
          </Box>
        )}
        {level && (
          <Text
            component="span"
            size="xs"
            fw={600}
            className="absolute -bottom-1.5 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-solid bg-body px-3 py-0.5 text-foreground"
            style={{
              borderColor:
                "var(--profile-accent, var(--mantine-color-brand-filled))",
            }}
          >
            {t("profile.overview.level", { level: level.currentLevel })}
          </Text>
        )}
      </Box>

      <Group align="flex-start" gap="md" justify="space-between">
        <Stack gap={6} className="min-w-0 flex-1 basis-full sm:basis-52">
          <Group gap={10}>
            <Title
              order={1}
              className="[overflow-wrap:anywhere] text-[32px] font-medium leading-none tracking-tight text-foreground"
            >
              {username}
            </Title>
            {perks?.badge && <SupporterBadge variant="full" perks={perks} />}
            {perks?.liveProfile && (
              <SupporterPresenceChip userId={userId} perks={perks} />
            )}
          </Group>
          <Text
            size="sm"
            c="dimmed"
            className="whitespace-pre-wrap break-words"
          >
            @{username}
            {bio && " · "}
            {bio}
          </Text>
          <Group gap="md">
            <ProfileFollowInfo
              targetUserId={userId}
              criteria={FollowInfoRequestDto.criteria.FOLLOWERS}
            />
            <ProfileFollowInfo
              targetUserId={userId}
              criteria={FollowInfoRequestDto.criteria.FOLLOWING}
            />
          </Group>
          {perks?.titleKey && (
            <SupporterTitle
              variant="chip"
              titleKey={perks.titleKey}
              perks={perks}
            />
          )}
        </Stack>
        <ProfileAvatarSectionButtons userId={userId} />
      </Group>
    </Box>
  );
};

export { ProfileUserInfo };
