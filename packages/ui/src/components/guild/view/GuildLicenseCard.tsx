import type { GuildLicenseDto } from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { RankStamp } from "../scene/RankStamp";
import { formatLicenseNumber } from "../util/formatLicenseNumber";
import { formatGuildXp, getRankProgress } from "../util/getRankProgress";
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
  return styles.licenseFrameGeneric;
}

/**
 * Guild License card: number, equipped title (or rank title), member-since
 * year, rank stamp, the three collection stats and the next-rank progress.
 */
export function GuildLicenseCard({
  license,
  className,
}: GuildLicenseCardProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const progress = getRankProgress(license, language);
  const numberFormat = new Intl.NumberFormat(language);
  const title = getGuildTitleLabel(license, t);

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
    <article className={cn(styles.licenseCard, className)}>
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
          <GuildIcon name="silhouette" size={30} />
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
        <RankStamp rank={license.rank} size={52} />
      </div>

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

      <div>
        <div className={styles.licenseNextRow}>
          <span className={cn(styles.captionMedium, styles.licenseNext)}>
            {progress.isMaxRank
              ? t("guild.license.maxRank")
              : t("guild.license.nextRank", { rank: progress.nextRank })}
          </span>
          {!progress.isMaxRank ? (
            <span className={cn(styles.captionMedium, styles.licenseXpLeft)}>
              {t("guild.license.xpLeft", {
                xp: formatGuildXp(progress.xpToNextRank, language),
              })}
            </span>
          ) : null}
        </div>
        <div
          role="progressbar"
          aria-label={
            progress.isMaxRank
              ? t("guild.license.maxRank")
              : t("guild.license.nextRank", { rank: progress.nextRank })
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.percent)}
          className={styles.xpBar}
        >
          <span
            className={styles.xpBarFill}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>
    </article>
  );
}
