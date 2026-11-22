import type { GuildLicenseDto } from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { formatTimeLeft } from "../util/formatTimeLeft";
import { getRankProgress } from "../util/getRankProgress";
import { getGuildTitleLabel } from "./GuildHallTitles";

export type GuildHeaderVariant = "desktop" | "mobile";

export interface GuildHeaderProps {
  license: GuildLicenseDto;
  /** ISO date of the next board refresh (`nextRefreshAt`). */
  nextRefreshAt: string;
  variant?: GuildHeaderVariant;
  className?: string;
}

/**
 * Hall header (design D6): crest and title, Monday refresh subtitle, rank badge
 * and the rank XP bar. The mobile variant stacks the badge and puts the bar on
 * its own full-width row.
 */
export function GuildHeader({
  license,
  nextRefreshAt,
  variant = "desktop",
  className,
}: GuildHeaderProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const progress = getRankProgress(license, language);
  const playerTitle = getGuildTitleLabel(license, t);
  const rankBadge = t("guild.header.rankBadge", { rank: license.rank });
  const subtitle = t("guild.header.subtitle", {
    timeLeft: formatTimeLeft(nextRefreshAt),
  });

  const xpBar = (
    <div
      role="progressbar"
      aria-label={progress.xpLabel}
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
  );

  if (variant === "mobile") {
    return (
      <header className={cn(styles.header, styles.headerMobile, className)}>
        <div className={styles.headerMobileTop}>
          <div className={styles.headerBrand}>
            <span className={cn(styles.headerCrest, styles.headerCrestMobile)}>
              <GuildIcon name="shield" size={18} />
            </span>
            <h1
              className={cn(
                styles.pixelTitle,
                styles.headerTitle,
                styles.headerTitleMobile,
              )}
            >
              {t("guild.header.title")}
            </h1>
          </div>
          <span
            className={cn(
              styles.stamp,
              styles.rankBadge,
              styles.rankBadgeMobile,
            )}
          >
            {rankBadge}
          </span>
        </div>
        <div className={cn(styles.xpBlock, styles.xpBlockMobile)}>
          <div className={styles.xpRow}>
            <span className={cn(styles.captionMedium, styles.xpTitle)}>
              {playerTitle}
            </span>
            <span className={cn(styles.captionMedium, styles.xpValue)}>
              {progress.xpLabel}
            </span>
          </div>
          {xpBar}
        </div>
      </header>
    );
  }

  return (
    <header className={cn(styles.header, className)}>
      <div className={styles.headerBrand}>
        <span className={styles.headerCrest}>
          <GuildIcon name="shield" size={22} />
        </span>
        <div className={styles.headerTitleBlock}>
          <h1 className={cn(styles.pixelTitle, styles.headerTitle)}>
            {t("guild.header.title")}
          </h1>
          <p className={cn(styles.captionText, styles.headerSubtitle)}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className={styles.headerRight}>
        <span className={cn(styles.stamp, styles.rankBadge)}>{rankBadge}</span>
        <div className={styles.xpBlock}>
          <div className={styles.xpRow}>
            <span className={cn(styles.captionMedium, styles.xpTitle)}>
              {playerTitle}
            </span>
            <span className={cn(styles.captionMedium, styles.xpValue)}>
              {progress.xpLabel}
            </span>
          </div>
          {xpBar}
        </div>
      </div>
    </header>
  );
}
