import { useState } from "react";
import { Skeleton } from "@mantine/core";
import type { TFunction } from "i18next";
import type {
  ClaimGuildPassportMilestoneResponseDto,
  GuildPassportMilestoneDto,
} from "@repo/wrapper/server";
import { GuildPassportMilestoneDto as PassportMilestone } from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import economyStyles from "./GuildEconomy.module.css";
import { useClaimGuildPassportMilestone } from "../hooks/useClaimGuildPassportMilestone";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { useGuildPassport } from "../hooks/useGuildPassport";
import {
  getChestAsset,
  getConsumableAsset,
  getStampStyleClass,
} from "../scene/cosmeticAssets";
import { GuildIcon } from "../scene/GuildIcon";
import { PixelButton } from "../scene/PixelButton";
import { formatGuildXp, formatTimeLeft } from "../util";
import { GuildChestResult } from "./GuildChestResult";
import { GuildQueryError } from "./GuildQueryError";

export interface GuildPassportCardProps {
  className?: string;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Dynamic keys (chest tier, consumable, milestone copy) bypass the typed union. */
function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
): string {
  return (t as unknown as Translate)(key, options);
}

/** One slot per contract of the month (design D8). */
const STAMP_SLOTS = 6;

type MilestoneTarget = 2 | 4 | 6;

function toMilestoneTarget(value: number): MilestoneTarget | null {
  return value === 2 || value === 4 || value === 6 ? value : null;
}

/** `chests.<kind>` with the generic chest label for unknown tiers. */
function getChestLabel(kind: string, t: TFunction): string {
  const key = `guild.chests.${kind}`;
  const translated = translate(t, key);

  if (translated !== key) return translated;

  return translate(t, "guild.rewards.generic.chest");
}

function getConsumableLabel(key: string, t: TFunction): string {
  const consumableKey = `guild.consumables.${key}.name`;
  const consumable = translate(t, consumableKey);
  if (consumable !== consumableKey) return consumable;

  const rewardKey = `guild.rewards.${key}`;
  const reward = translate(t, rewardKey);
  if (reward !== rewardKey) return reward;

  return translate(t, "guild.rewards.generic.consumable");
}

/**
 * The Monthly Guild Passport (design D8, spec guild-progression): six stamp
 * slots for the month's claimed contracts, the reset countdown and the 2/4/6
 * milestones with their chest tier, Seals and consumable rewards. A claimable
 * milestone sends `POST /v1/guild/passport/claim/{milestone}` and opens a small
 * receipt with the chest result, the Seals, the consumable and the XP.
 */
export function GuildPassportCard({ className }: GuildPassportCardProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const passport = useGuildPassport();
  const overview = useGuildOverview();
  const claim = useClaimGuildPassportMilestone();
  const [claimResult, setClaimResult] =
    useState<ClaimGuildPassportMilestoneResponseDto | null>(null);

  const stampStyleKey = overview.data?.license?.equippedStampStyleKey ?? null;
  const stampStyleClass = getStampStyleClass(stampStyleKey);
  const data = passport.data;
  const completed = data?.completedContractsCount ?? 0;
  const filledStamps = Math.min(completed, STAMP_SLOTS);

  const claimMilestone = (milestone: MilestoneTarget) => {
    claim.mutate(
      { milestone },
      { onSuccess: (result) => setClaimResult(result) },
    );
  };

  const renderMilestone = (milestone: GuildPassportMilestoneDto) => {
    const target = toMilestoneTarget(milestone.milestone);
    const status = milestone.status;
    const isClaimable = status === PassportMilestone.status.CLAIMABLE;
    const isClaimed = status === PassportMilestone.status.CLAIMED;
    const isLocked = status === PassportMilestone.status.LOCKED;
    const missing = Math.max(milestone.milestone - completed, 0);
    const neededCopy = translate(t, "guild.passport.contractsNeeded", {
      count: missing,
    });
    const consumableName =
      milestone.consumableKey && milestone.consumableQuantity > 0
        ? getConsumableLabel(milestone.consumableKey, t)
        : null;

    return (
      <li
        key={milestone.milestone}
        className={cn(
          economyStyles.milestone,
          isLocked && economyStyles.milestoneLocked,
        )}
        data-milestone={milestone.milestone}
        data-status={status}
      >
        <GuildIcon
          name={getChestAsset(String(milestone.chestKind))}
          size={28}
          className={economyStyles.milestoneArt}
        />

        <div className={economyStyles.milestoneBody}>
          <div className={economyStyles.milestoneHeadings}>
            <span className={economyStyles.milestoneTitle}>
              {t("guild.passport.milestone")} {milestone.milestone}
            </span>
            <span className={economyStyles.milestoneChest}>
              {getChestLabel(String(milestone.chestKind), t)}
            </span>
          </div>

          <div className={economyStyles.milestoneRewards}>
            <span
              className={economyStyles.milestoneReward}
              data-milestone-seals={milestone.sealsReward}
            >
              <GuildIcon name="seal" size={14} />
              {t("guild.seals.amount", { count: milestone.sealsReward })}
            </span>
            {consumableName && milestone.consumableKey ? (
              <span
                className={economyStyles.milestoneReward}
                data-milestone-consumable={milestone.consumableKey}
              >
                <GuildIcon
                  name={getConsumableAsset(milestone.consumableKey)}
                  size={16}
                />
                <span>
                  {consumableName}{" "}
                  <span className={economyStyles.milestoneQuantity}>
                    × {milestone.consumableQuantity}
                  </span>
                </span>
              </span>
            ) : null}
          </div>
        </div>

        <div className={economyStyles.milestoneAside}>
          {isClaimed ? (
            <span
              className={cn(
                economyStyles.milestoneStatus,
                economyStyles.milestoneClaimed,
              )}
              data-milestone-claimed
            >
              <GuildIcon name="stamp" size={12} />
              {t("guild.passport.claimed")}
            </span>
          ) : isClaimable && target !== null ? (
            <PixelButton
              size="sm"
              className={economyStyles.milestoneClaim}
              aria-label={`${t("guild.passport.claim")}: ${t(
                "guild.passport.milestone",
              )} ${milestone.milestone}`}
              disabled={
                claim.isPending && claim.variables?.milestone === target
              }
              onClick={() => claimMilestone(target)}
            >
              {t("guild.passport.claim")}
            </PixelButton>
          ) : isLocked ? (
            <p
              className={economyStyles.milestoneNeeded}
              data-contracts-needed={missing}
            >
              {neededCopy}
            </p>
          ) : null}
        </div>
      </li>
    );
  };

  if (passport.isPending) {
    return (
      <section className={cn(economyStyles.passportCard, className)}>
        <Skeleton height={132} radius={8} />
      </section>
    );
  }

  if (!data) {
    return (
      <section className={cn(economyStyles.passportCard, className)}>
        <GuildQueryError
          error={passport.error}
          onRetry={() => {
            void passport.refetch();
          }}
          isRetrying={passport.isFetching}
        />
      </section>
    );
  }

  return (
    <article
      className={cn(economyStyles.passportCard, className)}
      data-passport-month={data.monthKey}
      data-passport-completed={completed}
    >
      <header className={economyStyles.passportHeader}>
        <span className={cn(styles.pixelOverline, economyStyles.passportTitle)}>
          {t("guild.passport.title")}
        </span>
        <span className={economyStyles.passportLine} aria-hidden />
      </header>

      <div
        className={economyStyles.stampRow}
        data-passport-stamps={filledStamps}
        aria-hidden
      >
        {Array.from({ length: STAMP_SLOTS }, (_, index) => {
          const filled = index < filledStamps;

          return (
            <span
              key={index}
              className={cn(
                economyStyles.stampSlot,
                filled && economyStyles.stampSlotFilled,
                filled && stampStyleClass,
              )}
              data-stamp-filled={String(filled)}
            >
              {filled ? <GuildIcon name="stamp" size={14} /> : null}
            </span>
          );
        })}
      </div>

      <div className={economyStyles.passportMeta}>
        <p className={cn(styles.captionText, economyStyles.passportStamps)}>
          {t("guild.passport.stamps", { count: completed })}
        </p>
        <p className={economyStyles.passportReset}>
          {t("guild.passport.resetsIn", {
            time: formatTimeLeft(data.resetsAt),
          })}
        </p>
      </div>

      <ul className={economyStyles.milestones}>
        {data.milestones.map(renderMilestone)}
      </ul>

      <Modal
        opened={claimResult !== null}
        onClose={() => setClaimResult(null)}
        title={t("guild.passport.title")}
        centered
      >
        {claimResult ? (
          <div
            className={economyStyles.claimResult}
            data-passport-claim-result={claimResult.milestone}
          >
            <GuildChestResult result={claimResult.chestResult} />

            <div className={economyStyles.claimLines}>
              <span
                className={economyStyles.claimLine}
                data-claim-seals={claimResult.sealsAwarded}
              >
                <GuildIcon name="seal" size={16} />
                {t("guild.claim.seals", {
                  seals: formatGuildXp(claimResult.sealsAwarded, language),
                })}
              </span>

              {claimResult.xpAwarded > 0 ? (
                <span className={economyStyles.claimLine} data-claim-xp>
                  <GuildIcon name="coin" size={14} />
                  {t("guild.claim.xp", {
                    xp: formatGuildXp(claimResult.xpAwarded, language),
                  })}
                </span>
              ) : null}

              {claimResult.consumableKey &&
              claimResult.consumableQuantity > 0 ? (
                <span
                  className={economyStyles.claimLine}
                  data-claim-consumable={claimResult.consumableKey}
                >
                  <GuildIcon
                    name={getConsumableAsset(claimResult.consumableKey)}
                    size={16}
                  />
                  <span>{t("guild.claim.consumableDrop")}</span>
                  <strong>
                    {getConsumableLabel(claimResult.consumableKey, t)}
                  </strong>
                  <span>× {claimResult.consumableQuantity}</span>
                </span>
              ) : null}
            </div>

            <div className={economyStyles.claimActions}>
              <PixelButton size="sm" onClick={() => setClaimResult(null)}>
                {t("guild.claim.close")}
              </PixelButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </article>
  );
}
