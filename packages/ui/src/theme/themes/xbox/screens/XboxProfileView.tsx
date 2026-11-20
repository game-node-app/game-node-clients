import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useIsLibraryHidden } from "#@/components/library/hooks/useIsLibraryHidden";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileAvatarSectionButtons } from "#@/components/profile/view/ProfileAvatarSectionButtons";
import { ProfileFeaturedAchievements } from "#@/components/profile/view/ProfileFeaturedAchievements";
import { ProfileFollowInfo } from "#@/components/profile/view/ProfileFollowInfo";
import { ProfileUserInfoConnections } from "#@/components/profile/view/ProfileUserInfoConnections";
import type { ProfileUserInfoWithBannerProps } from "#@/components/profile/view/ProfileUserInfoWithBanner";
import { ProfileVideo } from "#@/components/profile/view/ProfileVideo";
import { useSettingsModalState } from "#@/components/settings/hooks/useSettingsModalState";
import { SupporterAvatarFrame } from "#@/components/supporter/perks/SupporterAvatarFrame";
import { SupporterBadge } from "#@/components/supporter/perks/SupporterBadge";
import { SupporterPresenceChip } from "#@/components/supporter/perks/SupporterPresenceChip";
import { SupporterTitle } from "#@/components/supporter/perks/SupporterTitle";
import { getActiveSupporterPerks } from "#@/components/supporter/perks/supporterPerks";
import { useUserLevel } from "#@/components/user-level/hooks/useUserLevel";
import { useRouter } from "#@/util/link";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import { Button, Text, Title } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { FollowInfoRequestDto } from "@repo/wrapper/server";
import { IconPhoto } from "@tabler/icons-react";
import { XboxProfileStats } from "./XboxProfileStats";
import classes from "./XboxProfileView.module.css";

/**
 * Xbox gamercard: the banner behind a hero with the gamerpic, gamertag,
 * level/XP, follow counts, member since, connections, featured achievements and
 * the same profile actions as the default header (edit for the owner, follow
 * and report for everyone else).
 *
 * The default `ProfileStatsSimpleOverview` has no caller, so the headline strip
 * is rendered here, after the gamercard and before the tabs, hidden whenever
 * `useIsLibraryHidden` says the viewer cannot see the library.
 */
const XboxProfileView = ({
  userId,
  navigation,
  children,
}: ProfileUserInfoWithBannerProps) => {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const settings = useSettingsModalState();
  const router = useRouter();
  const isOwner = useUserId() === userId;
  const profileQuery = useUserProfile(userId);
  const levelQuery = useUserLevel(userId);
  const profile = profileQuery.data;
  const { isHidden } = useIsLibraryHidden(userId, profile);

  if (profileQuery.isLoading && !profile) {
    return <CenteredLoading />;
  }

  if (!profile) {
    return <CenteredErrorMessage message={t("profile.messages.fetchFailed")} />;
  }

  const perks = getActiveSupporterPerks(profile);
  const level = levelQuery.data;
  const currentLevelExp = level?.currentLevelExp ?? 0;
  const levelUpExpCost = level?.levelUpExpCost ?? 0;
  const xp =
    levelUpExpCost > 0
      ? Math.round((currentLevelExp / levelUpExpCost) * 100)
      : 0;
  const bannerSrc = profile.banner
    ? getS3StoredUpload(
        `${profile.banner.filename}.${profile.banner.extension}`,
      )
    : undefined;
  const joined = profile.createdAt ? new Date(profile.createdAt) : null;
  const memberSince =
    joined && Number.isFinite(joined.getTime())
      ? new Intl.DateTimeFormat(language, {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(joined)
      : null;
  const avatar = (
    <UserAvatar
      userId={userId}
      profile={profile}
      alt={profile.username}
      className={classes.gamerpic}
    />
  );
  // The default profile shows the overview only on its main page, not inside a
  // tab panel; keep that placement (the stats tab has its own headline strip).
  const activeTab = router.query.get("tab");
  const showSummary = !isHidden && (activeTab == null || activeTab === "main");

  return (
    <div className={classes.profileView}>
      <section className={classes.hero} data-testid={"xbox-profile-gamercard"}>
        <div
          className={classes.heroArt}
          style={
            !profile.bannerVideo && bannerSrc
              ? { backgroundImage: `url(${bannerSrc})` }
              : undefined
          }
          aria-hidden
        >
          {profile.bannerVideo && (
            <ProfileVideo
              video={profile.bannerVideo}
              poster={bannerSrc}
              className={classes.heroVideo}
            />
          )}
        </div>

        {isOwner && !profile.banner && !profile.bannerVideo && (
          <Button
            variant={"default"}
            radius={"md"}
            size={"compact-sm"}
            className={classes.addBanner}
            leftSection={<IconPhoto size={14} aria-hidden />}
            onClick={() => settings.open("profile", "images")}
          >
            {t("profile.overview.addBanner")}
          </Button>
        )}

        <div className={classes.avatar}>
          {perks?.border ? (
            <SupporterAvatarFrame accent={perks.accent}>
              {avatar}
            </SupporterAvatarFrame>
          ) : (
            avatar
          )}
          {level && (
            <Text component={"span"} className={classes.levelChip}>
              {t("profile.overview.level", { level: level.currentLevel })}
            </Text>
          )}
        </div>

        <div className={classes.info}>
          <div className={classes.nameRow}>
            <Title order={1} className={classes.gamertag}>
              {profile.username}
            </Title>
            {perks?.badge && <SupporterBadge variant={"full"} perks={perks} />}
            {perks?.liveProfile && (
              <SupporterPresenceChip userId={userId} perks={perks} />
            )}
          </div>

          <div className={classes.level}>
            <Text className={classes.levelValue}>
              {t("user.labels.level", { level: level?.currentLevel ?? 1 })}
            </Text>
            <div
              className={classes.xp}
              role={"progressbar"}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={xp}
              aria-label={t("user.labels.xp", {
                exp: currentLevelExp,
                cost: levelUpExpCost,
              })}
            >
              <span className={classes.xpFill} style={{ width: `${xp}%` }} />
            </div>
            <Text className={classes.xpLabel}>
              {t("user.labels.xp", {
                exp: currentLevelExp,
                cost: levelUpExpCost,
              })}
            </Text>
          </div>

          <div className={classes.meta}>
            <div className={classes.metaItem}>
              <ProfileFollowInfo
                targetUserId={userId}
                criteria={FollowInfoRequestDto.criteria.FOLLOWERS}
              />
            </div>
            <div className={classes.metaItem}>
              <ProfileFollowInfo
                targetUserId={userId}
                criteria={FollowInfoRequestDto.criteria.FOLLOWING}
              />
            </div>
            {memberSince && (
              <div className={classes.metaItem}>
                <Text className={classes.since}>
                  {t("profile.memberSince", { date: memberSince })}
                </Text>
              </div>
            )}
          </div>

          {profile.bio && <Text className={classes.bio}>{profile.bio}</Text>}

          {perks?.titleKey && (
            <SupporterTitle
              variant={"chip"}
              titleKey={perks.titleKey}
              perks={perks}
            />
          )}

          <div className={classes.actions}>
            <ProfileAvatarSectionButtons userId={userId} />
            <div className={classes.connections}>
              <ProfileUserInfoConnections userId={userId} />
            </div>
          </div>
        </div>

        <div className={classes.featured}>
          <ProfileFeaturedAchievements targetUserId={userId} />
        </div>
      </section>

      {showSummary && <XboxProfileStats userId={userId} />}

      {navigation}

      <div className={classes.content}>{children}</div>
    </div>
  );
};

export { XboxProfileView };
