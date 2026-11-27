import type { TFunction } from "i18next";
import type { GuildLicenseDto } from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import progressionStyles from "./GuildProgression.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { formatTimeLeft } from "../util/formatTimeLeft";
import { formatGuildXp, getRankProgress } from "../util/getRankProgress";
import { getGuildTitleLabel } from "./GuildHallTitles";

export type GuildHeaderVariant = "desktop" | "mobile";

export interface GuildHeaderProps {
  license: GuildLicenseDto;
  /** ISO date of the next board refresh (`nextRefreshAt`). */
  nextRefreshAt: string;
  variant?: GuildHeaderVariant;
  className?: string;
}

interface PrestigeProgress {
  level: number;
  percent: number;
  label: string;
  valueLabel: string;
}

/**
 * Rank S with at least one Prestige star shows the star progress instead of the
 * (always full) rank bar: `prestigeXpIntoCurrent / (prestigeXpIntoCurrent +
 * xpToNextPrestige)` with the `Prestige N` label (design D8, spec guild-progression).
 */
function getPrestigeProgress(
  license: GuildLicenseDto,
  language: string,
  t: TFunction,
): PrestigeProgress | null {
  const level = license.prestigeLevel ?? 0;
  if (license.rank !== "S" || level <= 0) return null;

  const intoCurrent = Math.max(0, license.prestigeXpIntoCurrent ?? 0);
  const toNext = Math.max(0, license.xpToNextPrestige ?? 0);
  const total = intoCurrent + toNext;
  const percent = total > 0 ? Math.min(100, (intoCurrent / total) * 100) : 0;

  return {
    level,
    percent,
    label: t("guild.rank.prestige", { count: level }),
    valueLabel: `${formatGuildXp(intoCurrent, language)} / ${formatGuildXp(
      total,
      language,
    )} XP`,
  };
}

/**
 * Hall header (design D6 + D8): crest and title, Monday refresh subtitle, the
 * Seals pill, rank badge, Prestige stars and the rank (or Prestige) XP bar. The
 * mobile variant stacks the badge and puts the bar on its own full-width row.
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
  const numberFormat = new Intl.NumberFormat(language);
  const sealsBalance = license.sealsBalance ?? 0;
  const prestige = getPrestigeProgress(license, language, t);

  const sealsPill = (
    <span
      className={progressionStyles.headerSealsPill}
      data-seals-balance={sealsBalance}
      role="group"
      aria-label={t("guild.seals.amount", { count: sealsBalance })}
    >
      <GuildIcon name="seal" size={16} />
      <span className={progressionStyles.headerSealsValue}>
        {numberFormat.format(sealsBalance)}
      </span>
    </span>
  );

  const prestigeStars = prestige ? (
    <span
      className={progressionStyles.prestigeStars}
      data-prestige-level={prestige.level}
      aria-hidden
    >
      {Array.from({ length: prestige.level }, (_, index) => (
        <GuildIcon key={index} name="prestige-star" size={12} />
      ))}
    </span>
  ) : null;

  const xpTitle = prestige ? prestige.label : playerTitle;
  const xpValue = prestige ? prestige.valueLabel : progress.xpLabel;
  const xpPercent = prestige ? prestige.percent : progress.percent;

  const xpBar = (
    <div
      role="progressbar"
      aria-label={xpTitle}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(xpPercent)}
      className={styles.xpBar}
      data-prestige-bar={prestige ? "true" : undefined}
    >
      <span className={styles.xpBarFill} style={{ width: `${xpPercent}%` }} />
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
          <div className={progressionStyles.headerBadges}>
            {sealsPill}
            <span
              className={cn(
                styles.stamp,
                styles.rankBadge,
                styles.rankBadgeMobile,
              )}
            >
              {rankBadge}
            </span>
            {prestigeStars}
          </div>
        </div>
        <div className={cn(styles.xpBlock, styles.xpBlockMobile)}>
          <div className={styles.xpRow}>
            <span className={cn(styles.captionMedium, styles.xpTitle)}>
              {xpTitle}
            </span>
            <span className={cn(styles.captionMedium, styles.xpValue)}>
              {xpValue}
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
        {sealsPill}
        <span className={cn(styles.stamp, styles.rankBadge)}>{rankBadge}</span>
        {prestigeStars}
        <div className={styles.xpBlock}>
          <div className={styles.xpRow}>
            <span className={cn(styles.captionMedium, styles.xpTitle)}>
              {xpTitle}
            </span>
            <span className={cn(styles.captionMedium, styles.xpValue)}>
              {xpValue}
            </span>
          </div>
          {xpBar}
        </div>
      </div>
    </header>
  );
}
