import { Progress } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  Link,
  useUserLevel,
  useUserProfile,
  UserAvatar,
  UserAvatarWithLevelInfoProps,
} from "@repo/ui";

/**
 * Mobile version of `UserAvatarWithLevelInfo`: one rounded card with avatar, username, level, XP
 * bar and join date. Shared by the achievements and stats screens.
 */
export const MobileUserLevelHeader = ({
  userId,
  showJoinDate = true,
  enableLink = true,
  avatarProps,
}: UserAvatarWithLevelInfoProps) => {
  const { t, i18n } = useTranslation();
  const profileQuery = useUserProfile(userId);
  const userLevel = useUserLevel(userId).data;

  const progress = userLevel
    ? (userLevel.currentLevelExp / Math.max(userLevel.levelUpExpCost, 1)) * 100
    : 0;
  const locale = i18n.resolvedLanguage || i18n.language;

  return (
    <Link
      href={`/profile/${userId}`}
      className="flex items-center gap-4 rounded-2xl border border-line bg-paper-8 p-4 text-foreground no-underline"
      onClick={(evt) => {
        if (!enableLink) evt.preventDefault();
      }}
    >
      <UserAvatar userId={userId} size="lg" {...avatarProps} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-bold">
            {profileQuery.data?.username}
          </span>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-brand">
            {t("user.labels.level", { level: userLevel?.currentLevel ?? 1 })}
          </span>
        </div>
        <Progress value={progress} size="sm" radius="xl" />
        <div className="flex flex-col gap-0.5 text-xs text-dimmed-1">
          <span className="whitespace-nowrap">
            {t("user.labels.xp", {
              exp: userLevel?.currentLevelExp ?? 0,
              cost: userLevel?.levelUpExpCost ?? 0,
            })}
          </span>
          {showJoinDate && profileQuery.data && (
            <span>
              {t("profile.memberSince", {
                date: new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                }).format(new Date(profileQuery.data.createdAt)),
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
