import { useState } from "react";
import { GuildContractDto } from "@repo/wrapper/server";
import type {
  ClaimGuildContractResponseDto,
  GuildYearGoalDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import { useClaimGuildContract } from "../hooks/useClaimGuildContract";
import { PixelButton } from "../scene/PixelButton";
import { getQuestCopy } from "../util/getQuestCopy";
import { GuildClaimCelebration } from "./GuildClaimCelebration";

export interface GuildActiveContractsProps {
  contracts: GuildContractDto[];
  yearGoal: GuildYearGoalDto | null;
  className?: string;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Compact elapsed time for "accepted X ago" captions: `5d 3h`, `18h 20m`. */
function formatElapsed(iso: string): string {
  const acceptedAt = new Date(iso).getTime();
  if (Number.isNaN(acceptedAt)) return "";

  const elapsed = Math.max(Date.now() - acceptedAt, 0);
  const days = Math.floor(elapsed / DAY_MS);
  const hours = Math.floor((elapsed % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((elapsed % HOUR_MS) / 60_000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getContractPercent(contract: GuildContractDto): number {
  if (contract.status === GuildContractDto.status.READY_TO_CLAIM) return 100;

  const estimatedPercent = contract.playtimeProgress?.estimatedPercent;
  if (estimatedPercent !== null && estimatedPercent !== undefined) {
    return Math.min(100, Math.max(0, estimatedPercent));
  }

  if (contract.progressTarget <= 0) return 0;
  return Math.min(
    100,
    (contract.progressCurrent / contract.progressTarget) * 100,
  );
}

function getProgressLabel(contract: GuildContractDto): string {
  const estimatedPercent = contract.playtimeProgress?.estimatedPercent;
  if (estimatedPercent !== null && estimatedPercent !== undefined) {
    return `${Math.round(estimatedPercent)}%`;
  }

  return `${contract.progressCurrent} / ${contract.progressTarget}`;
}

/**
 * Sidebar list of the player's active contracts plus the yearly goal (design
 * D6). `ready_to_claim` rows are turned in from here and open the celebration
 * with the claim payload.
 */
export function GuildActiveContracts({
  contracts,
  yearGoal,
  className,
}: GuildActiveContractsProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const claim = useClaimGuildContract();
  const numberFormat = new Intl.NumberFormat(language);
  const [claimResult, setClaimResult] =
    useState<ClaimGuildContractResponseDto | null>(null);

  const goalPercent =
    yearGoal && yearGoal.target > 0
      ? Math.min(100, (yearGoal.finished / yearGoal.target) * 100)
      : 0;
  const goalLeft = yearGoal
    ? Math.max(0, yearGoal.target - yearGoal.finished)
    : 0;

  const handleClaim = (contractId: string) => {
    claim.mutate(contractId, {
      onSuccess: (result) => setClaimResult(result),
    });
  };

  return (
    <section
      className={cn(styles.contractsSection, className)}
      aria-label={t("guild.activeContracts.title")}
    >
      <div className={styles.contractsTitleRow}>
        <span className={cn(styles.captionMedium, styles.contractsTitle)}>
          {t("guild.activeContracts.title")}
        </span>
        <span className={styles.contractsRule} aria-hidden />
      </div>

      {contracts.length === 0 ? (
        <p className={cn(styles.captionText, styles.contractsEmpty)}>
          {t("guild.activeContracts.empty")}
        </p>
      ) : null}

      {contracts.map((contract) => {
        const copy = getQuestCopy(contract, t, language);
        const name = contract.targetGame?.name
          ? `${copy.title} · ${contract.targetGame.name}`
          : copy.title;
        const isReady =
          contract.status === GuildContractDto.status.READY_TO_CLAIM;
        const playtime = contract.playtimeProgress;
        const acceptedAgo = t("guild.activeContracts.acceptedAgo", {
          time: formatElapsed(contract.acceptedAt),
        });
        const caption =
          playtime?.estimatedTotalSeconds !== null &&
          playtime?.estimatedTotalSeconds !== undefined
            ? `${acceptedAgo} · ${t("guild.activeContracts.playtime", {
                played: Math.round(playtime.playedSeconds / 3_600),
                estimated: Math.round(playtime.estimatedTotalSeconds / 3_600),
              })}`
            : copy.description || acceptedAgo;
        const percent = getContractPercent(contract);

        return (
          <div
            key={contract.id}
            className={cn(
              styles.contractRow,
              isReady && styles.contractRowReady,
            )}
            data-contract-id={contract.id}
            data-status={contract.status}
          >
            <div className={styles.contractRowTop}>
              <span className={cn(styles.bodyMedium, styles.contractName)}>
                {name}
              </span>
              <span className={cn(styles.captionMedium, styles.contractValue)}>
                {getProgressLabel(contract)}
              </span>
            </div>
            <div className={styles.contractBar} aria-hidden>
              <span
                className={styles.contractBarFill}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={cn(styles.captionText, styles.contractCaption)}>
              {caption}
            </span>
            {isReady ? (
              <PixelButton
                size="sm"
                className={styles.contractClaim}
                disabled={claim.isPending}
                onClick={() => handleClaim(contract.id)}
              >
                {t("guild.actions.turnIn")}
              </PixelButton>
            ) : null}
          </div>
        );
      })}

      {yearGoal ? (
        <div className={styles.contractRow} data-year-goal={yearGoal.year}>
          <div className={styles.contractRowTop}>
            <span className={cn(styles.bodyMedium, styles.contractName)}>
              {t("guild.activeContracts.yearGoal", {
                year: yearGoal.year,
                target: numberFormat.format(yearGoal.target),
              })}
            </span>
            <span className={cn(styles.captionMedium, styles.contractValue)}>
              {numberFormat.format(yearGoal.finished)} /{" "}
              {numberFormat.format(yearGoal.target)}
            </span>
          </div>
          <div className={styles.contractBar} aria-hidden>
            <span
              className={cn(styles.contractBarFill, styles.contractBarFillGoal)}
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <span className={cn(styles.captionText, styles.contractCaption)}>
            {t("guild.activeContracts.yearGoalLeft", { count: goalLeft })}
          </span>
        </div>
      ) : null}

      <GuildClaimCelebration
        opened={claimResult !== null}
        onClose={() => setClaimResult(null)}
        result={claimResult}
      />
    </section>
  );
}
