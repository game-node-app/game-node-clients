import type { GuildLicenseDto } from "@repo/wrapper/server";

const DEFAULT_LOCALE = "en";

export type GuildRankProgressLicense = Pick<
  GuildLicenseDto,
  | "rank"
  | "xp"
  | "currentRankMinXp"
  | "nextRank"
  | "nextRankXp"
  | "xpToNextRank"
>;

export interface GuildRankProgress {
  rank: GuildLicenseDto["rank"];
  nextRank: GuildLicenseDto["nextRank"] | null;
  xp: number;
  currentRankMinXp: number;
  nextRankXp: number | null;
  xpToNextRank: number;
  /** 0..100; 100 at rank S. */
  percent: number;
  isMaxRank: boolean;
  /** `1.240 / 2.000 XP` in pt-BR, `1,240 / 2,000 XP` in en. */
  xpLabel: string;
  xpToNextRankLabel: string;
}

export function formatGuildXp(value: number, locale?: string): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;

  return new Intl.NumberFormat(locale || DEFAULT_LOCALE).format(safeValue);
}

/**
 * Computes the header/License XP bar from the server values. Rank S has no next
 * rank, so its bar is always full (spec: guild-hall, maximum rank).
 */
export function getRankProgress(
  license: GuildRankProgressLicense,
  locale?: string,
): GuildRankProgress {
  const isMaxRank = license.nextRank === null || license.nextRankXp === null;
  const span =
    license.nextRankXp === null
      ? 0
      : license.nextRankXp - license.currentRankMinXp;
  const earned = license.xp - license.currentRankMinXp;
  const percent =
    isMaxRank || span <= 0
      ? 100
      : Math.min(100, Math.max(0, (earned / span) * 100));

  const xpLabel = isMaxRank
    ? `${formatGuildXp(license.xp, locale)} XP`
    : `${formatGuildXp(license.xp, locale)} / ${formatGuildXp(
        license.nextRankXp as number,
        locale,
      )} XP`;

  return {
    rank: license.rank,
    nextRank: isMaxRank ? null : license.nextRank,
    xp: license.xp,
    currentRankMinXp: license.currentRankMinXp,
    nextRankXp: license.nextRankXp,
    xpToNextRank: license.xpToNextRank,
    percent,
    isMaxRank,
    xpLabel,
    xpToNextRankLabel: `${formatGuildXp(license.xpToNextRank, locale)} XP`,
  };
}
