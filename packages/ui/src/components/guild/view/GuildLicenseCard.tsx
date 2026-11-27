import { useContext } from "react";
import { QueryClientContext } from "@tanstack/react-query";
import type { GuildLicenseDto, UserGuildRewardDto } from "@repo/wrapper/server";
import { GuildRewardDescriptorDto } from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import progressionStyles from "./GuildProgression.module.css";
import { useGuildRewards } from "../hooks/useGuildRewards";
import { getLicenseThemeClass } from "../scene/cosmeticAssets";
import { GuildIcon } from "../scene/GuildIcon";
import { RankStamp } from "../scene/RankStamp";
import { formatLicenseNumber } from "../util/formatLicenseNumber";
import { getRewardLabel } from "../util/getRewardLabel";
import { getGuildTitleLabel } from "./GuildHallTitles";

export interface GuildLicenseCardProps {
  license: GuildLicenseDto;
  className?: string;
}

/**
 * The avatar frame is a Guild cosmetic: an equipped key draws a 2 px frame
 * around the silhouette tile (design D6). Unknown keys still get the generic
 * brand frame so a new server cosmetic is never invisible.
 */
function getFrameClass(key: string | null): string | undefined {
  if (!key) return undefined;
  if (key === "frame_lantern_glow") return styles.licenseFrameLantern;
  if (key === "frame_parchment_seal") return styles.licenseFrameParchment;
  if (key === "frame_ember_rune") return styles.licenseFrameEmber;
  if (key === "frame_moonlit_ivy") return styles.licenseFrameIvy;
  if (key === "frame_gilded_compass") return styles.licenseFrameGilded;
  return styles.licenseFrameGeneric;
}

function PrestigeStars({ level }: { level: number }) {
  if (level <= 0) return null;

  return (
    <span
      className={progressionStyles.prestigeStars}
      data-prestige-level={level}
      aria-hidden
    >
      {Array.from({ length: level }, (_, index) => (
        <GuildIcon key={index} name="prestige-star" size={12} />
      ))}
    </span>
  );
}

interface TrophyShowcaseProps {
  license: GuildLicenseDto;
  rewards?: UserGuildRewardDto[];
}

/**
 * Trophy Showcase: always three slots; filled slots show the badge label from
 * the rewards inventory matched by `achievementId`, empty slots stay dashed
 * (design D8).
 */
function TrophyShowcase({ license, rewards }: TrophyShowcaseProps) {
  const { t } = useTranslation();
  const badgeIds = license.showcaseBadgeIds ?? [];
  const badgesByAchievementId = new Map(
    (rewards ?? [])
      .filter(
        (item) =>
          item.reward.kind === GuildRewardDescriptorDto.kind.BADGE &&
          item.reward.achievementId,
      )
      .map(
        (item) => [item.reward.achievementId as string, item.reward] as const,
      ),
  );
  const slots = Array.from(
    { length: 3 },
    (_, index) => badgeIds[index] ?? null,
  );

  return (
    <section
      className={progressionStyles.showcase}
      aria-label={t("guild.license.showcase")}
      data-showcase-badges={badgeIds.length}
    >
      <h3 className={cn(styles.captionMedium, progressionStyles.showcaseTitle)}>
        {t("guild.license.showcase")}
      </h3>
      <ul className={progressionStyles.showcaseRow}>
        {slots.map((badgeId, index) => {
          const badge = badgeId
            ? badgesByAchievementId.get(badgeId)
            : undefined;
          const label = badge
            ? getRewardLabel(badge, t)
            : badgeId
              ? t("guild.rewards.generic.badge")
              : null;

          return (
            <li
              key={index}
              className={cn(
                progressionStyles.showcaseSlot,
                !badgeId && progressionStyles.showcaseSlotEmpty,
              )}
              data-badge-id={badgeId ?? undefined}
              aria-label={label ?? undefined}
            >
              {label ? (
                <>
                  <GuildIcon name="trophy" size={18} />
                  <span className={progressionStyles.showcaseLabel}>
                    {label}
                  </span>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
      {badgeIds.length === 0 ? (
        <p className={cn(styles.captionText, progressionStyles.showcaseEmpty)}>
          {t("guild.license.showcaseEmpty")}
        </p>
      ) : null}
    </section>
  );
}

/**
 * The rewards read is optional here so the card can render outside a query
 * provider (storybook-style previews and primitive tests); inside the hall the
 * query is already cached by the rewards panel.
 */
function TrophyShowcaseWithRewards({ license }: { license: GuildLicenseDto }) {
  const rewardsQuery = useGuildRewards();

  return (
    <TrophyShowcase
      license={license}
      rewards={rewardsQuery.data?.unlockedRewards}
    />
  );
}

function PerksDisclosure({ license }: { license: GuildLicenseDto }) {
  const { t } = useTranslation();
  const perks = license.perks;

  const rows: { key: string; label: string }[] = [];

  if (perks) {
    rows.push({
      key: "maxActiveContracts",
      label: t("guild.perks.maxActiveContracts", {
        count: perks.maxActiveContracts,
      }),
    });

    if (perks.weeklyRerolls > 0) {
      rows.push({
        key: "weeklyRerolls",
        label: t("guild.perks.weeklyRerolls", { count: perks.weeklyRerolls }),
      });
    }

    if (perks.monthlyExpedition) {
      rows.push({
        key: "monthlyExpedition",
        label: t("guild.perks.monthlyExpedition"),
      });
    }

    if (perks.monthlyExpeditionRankS) {
      rows.push({
        key: "monthlyExpeditionRankS",
        label: t("guild.perks.monthlyExpeditionRankS"),
      });
    }

    if (perks.monthlyFreeHourglass > 0) {
      rows.push({
        key: "monthlyFreeHourglass",
        label: t("guild.perks.monthlyFreeHourglass", {
          count: perks.monthlyFreeHourglass,
        }),
      });
    }

    if (perks.legendaryContracts) {
      rows.push({
        key: "legendaryContracts",
        label: t("guild.perks.legendaryContracts"),
      });
    }
  }

  if (rows.length === 0) return null;

  return (
    <details className={progressionStyles.perks} data-license-perks>
      <summary className={progressionStyles.perksSummary}>
        {t("guild.license.perks")}
      </summary>
      <ul className={progressionStyles.perksList}>
        {rows.map((row) => (
          <li key={row.key} className={progressionStyles.perkRow}>
            <GuildIcon name="star" size={12} />
            <span>{row.label}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function LicenseAvatarWithProfile() {
  const userId = useUserId();
  const profileQuery = useUserProfile(userId);
  const profile = profileQuery.data;
  const hasAvatar = Boolean(profile?.avatar || profile?.avatarVideo);

  if (!hasAvatar || !profile) {
    return <GuildIcon name="silhouette" size={30} />;
  }

  return (
    <UserAvatar
      userId={userId}
      profile={profile}
      size={56}
      radius={0}
      alt={profile.username}
      className={styles.licenseAvatarImage}
    />
  );
}

/**
 * Guild License card: number, equipped title (or rank title), member-since
 * year, rank stamp with the equipped stamp style, Prestige stars, Trophy
 * Showcase, perks disclosure and the three collection stats. An equipped
 * License theme restyles the card root (design D8).
 */
export function GuildLicenseCard({
  license,
  className,
}: GuildLicenseCardProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const queryClient = useContext(QueryClientContext);
  const numberFormat = new Intl.NumberFormat(language);
  const title = getGuildTitleLabel(license, t);
  const prestigeLevel = license.prestigeLevel ?? 0;

  const memberSince = new Date(license.memberSince);
  const memberSinceYear = Number.isNaN(memberSince.getTime())
    ? null
    : memberSince.getFullYear();

  const stats = [
    {
      key: "finished",
      value: license.stats.finishedGames,
      label: t("guild.license.stats.finished"),
    },
    {
      key: "backlog",
      value: license.stats.backlogGames,
      label: t("guild.license.stats.backlog"),
    },
    {
      key: "reviews",
      value: license.stats.reviewsCount,
      label: t("guild.license.stats.reviews"),
    },
  ];

  return (
    <article
      className={cn(
        styles.licenseCard,
        getLicenseThemeClass(license.equippedLicenseThemeKey),
        className,
      )}
      data-license-theme={license.equippedLicenseThemeKey ?? undefined}
    >
      <div className={styles.licenseTop}>
        <span className={cn(styles.pixelOverline, styles.licenseOverline)}>
          {t("guild.license.overline")}
        </span>
        <span className={cn(styles.captionMedium, styles.licenseNumber)}>
          {formatLicenseNumber(license.licenseNumber)}
        </span>
      </div>

      <div className={styles.licenseIdentity}>
        <div className={styles.licenseAvatar}>
          {queryClient ? (
            <LicenseAvatarWithProfile />
          ) : (
            <GuildIcon name="silhouette" size={30} />
          )}
          {license.equippedFrameKey ? (
            <span
              className={cn(
                styles.licenseFrame,
                getFrameClass(license.equippedFrameKey),
              )}
              data-frame={license.equippedFrameKey}
              aria-hidden
            />
          ) : null}
        </div>
        <div className={styles.licenseNameBlock}>
          <span className={cn(styles.pixelCardTitle, styles.licenseName)}>
            {title}
          </span>
          {memberSinceYear !== null ? (
            <span className={cn(styles.captionText, styles.licenseMember)}>
              {t("guild.license.memberSince", { year: memberSinceYear })}
            </span>
          ) : null}
        </div>
        <span className={progressionStyles.licenseRankBlock}>
          <RankStamp
            rank={license.rank}
            size={52}
            styleKey={license.equippedStampStyleKey}
            className={styles.licenseRankStamp}
          />
          <PrestigeStars level={license.rank === "S" ? prestigeLevel : 0} />
          {license.rank === "S" && prestigeLevel > 0 ? (
            <span className={progressionStyles.prestigeLabel}>
              {t("guild.rank.prestige", { count: prestigeLevel })}
            </span>
          ) : null}
        </span>
      </div>

      {queryClient ? (
        <TrophyShowcaseWithRewards license={license} />
      ) : (
        <TrophyShowcase license={license} />
      )}

      <PerksDisclosure license={license} />

      <div className={styles.licenseStats}>
        {stats.map((stat) => (
          <div key={stat.key} className={styles.licenseStat}>
            <span className={cn(styles.pixelTitle, styles.licenseStatNumber)}>
              {numberFormat.format(stat.value)}
            </span>
            <span className={cn(styles.captionText, styles.licenseStatLabel)}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
