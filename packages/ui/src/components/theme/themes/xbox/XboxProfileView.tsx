import { Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { ProfileEditForm } from "#@/components/profile/edit/ProfileEditForm";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileAvatarSectionButtons } from "#@/components/profile/view/ProfileAvatarSectionButtons";
import { ProfileFeaturedAchievements } from "#@/components/profile/view/ProfileFeaturedAchievements";
import { ProfileFollowInfo } from "#@/components/profile/view/ProfileFollowInfo";
import type { ProfileUserInfoWithBannerProps } from "#@/components/profile/view/ProfileUserInfoWithBanner";
import { ProfileUserInfoConnections } from "#@/components/profile/view/ProfileUserInfoConnections";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { Modal } from "#@/util";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";

/**
 * Xbox gamercard profile: the banner behind a hero with the gamerpic, gamertag, level/XP, follow counts and actions,
 * then the profile tabs (children) full width. Styled in xbox/theme.css.
 */
const XboxProfileView = ({ userId, children }: ProfileUserInfoWithBannerProps) => {
  const { t, i18n } = useTranslation();
  const onMobile = useOnMobile();
  const profileQuery = useUserProfile(userId);
  const level = useUserLevel(userId).data;
  const [editModalOpened, editModalUtils] = useDisclosure();
  const profile = profileQuery.data;

  if (!profile) {
    return profileQuery.isLoading ? <CenteredLoading /> : null;
  }

  const banner = profile.banner
    ? getS3StoredUpload(`${profile.banner.filename}.${profile.banner.extension}`)
    : undefined;
  const xp = level ? Math.round((level.currentLevelExp / level.levelUpExpCost) * 100) : 0;
  const memberSince = new Intl.DateTimeFormat(i18n.resolvedLanguage || i18n.language, {
    dateStyle: "medium",
  }).format(new Date(profile.createdAt));

  return (
    <div className={"gn-profile-view"}>
      <Modal
        opened={editModalOpened}
        onClose={editModalUtils.close}
        title={t("mobile.preferences.editProfile")}
        fullScreen={onMobile}
      >
        <ProfileEditForm userId={userId} />
      </Modal>

      <section className={"gn-profile-hero"}>
        <div
          className={"gn-profile-hero-art"}
          style={banner ? { backgroundImage: `url(${banner})` } : undefined}
          aria-hidden
        />
        <UserAvatar userId={userId} className={"gn-profile-gamerpic"} />
        <div className={"gn-profile-hero-info"}>
          <Title order={1} className={"gn-profile-gamertag"}>
            {profile.username}
          </Title>
          <div className={"gn-profile-level"}>
            <Text className={"gn-profile-level-value"}>
              {t("user.labels.level", { level: level?.currentLevel ?? 1 })}
            </Text>
            <div
              className={"gn-profile-xp"}
              role={"progressbar"}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={xp}
              aria-label={`${level?.currentLevelExp ?? 0} / ${level?.levelUpExpCost ?? 0} XP`}
            >
              <span style={{ width: `${xp}%` }} />
            </div>
            <Text className={"gn-profile-xp-label"}>
              {level?.currentLevelExp ?? 0} / {level?.levelUpExpCost ?? 0} XP
            </Text>
          </div>
          <div className={"gn-profile-hero-meta"}>
            <ProfileFollowInfo
              targetUserId={userId}
              criteria={FollowInfoRequestDto.criteria.FOLLOWERS}
            />
            <ProfileFollowInfo
              targetUserId={userId}
              criteria={FollowInfoRequestDto.criteria.FOLLOWING}
            />
            <Text className={"gn-profile-since"}>
              {t("profile.memberSince", { date: memberSince })}
            </Text>
          </div>
          {profile.bio && <Text className={"gn-profile-bio"}>{profile.bio}</Text>}
          <div className={"gn-profile-hero-actions"}>
            <ProfileAvatarSectionButtons userId={userId} onEditClick={editModalUtils.open} />
            <ProfileUserInfoConnections
              userId={userId}
              className={"gn-profile-connections"}
              imageProps={{ w: 28, h: 28, fit: "contain" }}
            />
          </div>
        </div>
        <div className={"gn-profile-featured"}>
          <ProfileFeaturedAchievements targetUserId={userId} />
        </div>
      </section>

      <div className={"gn-profile-content"}>{children}</div>
    </div>
  );
};

export { XboxProfileView };
