import { useState } from "react";
import { GuildContractDto } from "@repo/wrapper/server";
import type {
  ClaimGuildContractResponseDto,
  GuildYearGoalDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { usePresenter } from "#@/context";
import { cn, Link } from "#@/util";

import styles from "../guild.module.css";
import expansionStyles from "./GuildContractsExpansion.module.css";
import boardExpansionStyles from "./GuildBoardExpansion.module.css";
import { useClaimGuildContract } from "../hooks/useClaimGuildContract";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { useGuildRewards } from "../hooks/useGuildRewards";
import { GuildIcon } from "../scene/GuildIcon";
import { PixelButton } from "../scene/PixelButton";
import { getGuildMaxActiveContracts } from "../util/guildErrors";
import { getQuestCopy } from "../util/getQuestCopy";
import { GuildClaimCelebration } from "./GuildClaimCelebration";
import { GuildExtendContractModal } from "./GuildExtendContractModal";
import {
  canOfferContractExtension,
  getBonusObjectiveCondition,
  getChainStageLabel,
} from "./guildContractExpansion";

export interface GuildActiveContractsProps {
  contracts: GuildContractDto[];
  yearGoal: GuildYearGoalDto | null;
  maxActiveContracts?: number;
  onManageContracts?: () => void;
  className?: string;
}

/**
 * Duration since `acceptedAt` as a localized unit ("5 days", "2 hours") for
 * `guild.activeContracts.acceptedAgo`, which already carries the "ago".
 */
function formatElapsed(acceptedAt: string, locale: string): string {
  const acceptedMs = new Date(acceptedAt).getTime();
  if (Number.isNaN(acceptedMs)) return "";

  const minutes = Math.max(1, Math.round((Date.now() - acceptedMs) / 60_000));

  if (minutes < 60) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "minute",
      unitDisplay: "long",
    }).format(minutes);
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "hour",
      unitDisplay: "long",
    }).format(hours);
  }

  const days = Math.round(hours / 24);
  if (days < 30) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "day",
      unitDisplay: "long",
    }).format(days);
  }

  const months = Math.round(days / 30);
  if (months < 12) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "month",
      unitDisplay: "long",
    }).format(months);
  }

  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "year",
    unitDisplay: "long",
  }).format(Math.round(months / 12));
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
  maxActiveContracts: maxActiveContractsProp,
  onManageContracts,
  className,
}: GuildActiveContractsProps) {
  const { t, i18n } = useTranslation();
  const { language } = useI18nContext();
  const locale = i18n.resolvedLanguage || i18n.language || language || "en";
  const hasLink = Boolean(usePresenter("Link"));
  const claim = useClaimGuildContract();
  const overviewQuery = useGuildOverview();
  const rewardsQuery = useGuildRewards();
  const numberFormat = new Intl.NumberFormat(locale);
  const [claimResult, setClaimResult] =
    useState<ClaimGuildContractResponseDto | null>(null);
  const [extendTarget, setExtendTarget] = useState<GuildContractDto | null>(
    null,
  );

  const maxActiveContracts =
    maxActiveContractsProp ??
    getGuildMaxActiveContracts(overviewQuery.data?.license);
  const readyCount = contracts.filter(
    (contract) => contract.status === GuildContractDto.status.READY_TO_CLAIM,
  ).length;
  const hourglass = rewardsQuery.data?.consumables?.hourglass ?? 0;
  const monthlyFreeHourglass =
    overviewQuery.data?.license?.perks?.monthlyFreeHourglass ?? 0;
  const activeChain = overviewQuery.data?.activeChain ?? null;

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
        <span
          className={cn(styles.captionMedium, expansionStyles.contractsCap)}
          data-contracts-cap
          data-max-active-contracts={maxActiveContracts}
        >
          {maxActiveContractsProp !== undefined
            ? t("guild.activeContracts.summary", {
                active: contracts.length,
                max: maxActiveContracts,
              })
            : t("guild.contracts.cap", {
                active: contracts.length,
                max: maxActiveContracts,
              })}
        </span>
        {readyCount > 0 ? (
          <span
            className={boardExpansionStyles.contractsReadyBadge}
            data-ready-count={readyCount}
          >
            {t("guild.activeContracts.readyCount", { count: readyCount })}
          </span>
        ) : null}
        <span className={styles.contractsRule} aria-hidden />
        {onManageContracts ? (
          <PixelButton
            size="sm"
            variant="ghost-dark"
            className={styles.contractsManage}
            onClick={onManageContracts}
          >
            {t("guild.activeContracts.manage")}
          </PixelButton>
        ) : null}
      </div>

      {contracts.length === 0 ? (
        <p className={cn(styles.captionText, styles.contractsEmpty)}>
          {t("guild.activeContracts.empty")}
        </p>
      ) : null}

      {contracts.map((contract) => {
        const copy = getQuestCopy(contract, t, locale);
        const isReady =
          contract.status === GuildContractDto.status.READY_TO_CLAIM;
        const playtime = contract.playtimeProgress;
        const acceptedAgo = t("guild.activeContracts.acceptedAgo", {
          time: formatElapsed(contract.acceptedAt, locale),
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
        const sealsReward = contract.sealsReward ?? 0;
        const canExtend = canOfferContractExtension(contract, {
          hourglass,
          monthlyFreeHourglass,
        });
        const chainStageLabel = getChainStageLabel(contract, activeChain, t);
        const hasBonusObjective =
          contract.bonusObjective !== null &&
          contract.bonusObjective !== undefined;
        const bonusCondition = hasBonusObjective
          ? getBonusObjectiveCondition(contract.bonusObjective, t)
          : null;

        const targetGameContent = contract.targetGame ? (
          <>
            {contract.targetGame.coverUrl ? (
              <img
                src={contract.targetGame.coverUrl}
                alt=""
                width={20}
                height={27}
                loading="lazy"
                draggable={false}
                className={styles.contractTargetCover}
              />
            ) : (
              <span className={styles.contractTargetCoverFallback} aria-hidden />
            )}
            <span className={styles.contractTargetName}>
              {contract.targetGame.name}
            </span>
          </>
        ) : null;

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
                {copy.title}
              </span>
              <span className={cn(styles.captionMedium, styles.contractValue)}>
                {getProgressLabel(contract)}
              </span>
            </div>

            {contract.targetGame ? (
              hasLink && contract.targetGameId != null ? (
                <Link
                  href={`/game/${contract.targetGameId}`}
                  className={cn(
                    styles.contractTarget,
                    "no-underline hover:underline",
                  )}
                >
                  {targetGameContent}
                </Link>
              ) : (
                <span className={styles.contractTarget}>
                  {targetGameContent}
                </span>
              )
            ) : null}

            <div className={styles.contractBar} aria-hidden>
              <span
                className={styles.contractBarFill}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={cn(styles.captionText, styles.contractCaption)}>
              {caption}
            </span>

            <div className={expansionStyles.contractRewards}>
              <span className={expansionStyles.contractReward} data-contract-xp>
                <GuildIcon name="coin" size={14} />
                {t("guild.board.xpReward", {
                  xp: numberFormat.format(contract.xpReward ?? 0),
                })}
              </span>
              {sealsReward > 0 ? (
                <span
                  className={expansionStyles.contractReward}
                  data-contract-seals
                >
                  <GuildIcon name="seal" size={14} />
                  {t("guild.seals.reward", {
                    seals: numberFormat.format(sealsReward),
                  })}
                </span>
              ) : null}
            </div>

            {chainStageLabel ? (
              <span className={expansionStyles.contractChain} data-chain-stage>
                {chainStageLabel}
              </span>
            ) : null}

            {hasBonusObjective ? (
              <p
                className={cn(
                  styles.captionText,
                  expansionStyles.contractBonus,
                  contract.bonusCompleted && expansionStyles.contractBonusDone,
                )}
                data-bonus-completed={String(Boolean(contract.bonusCompleted))}
              >
                {contract.bonusCompleted ? (
                  <span className={expansionStyles.contractCheck} aria-hidden>
                    ✓
                  </span>
                ) : null}
                {bonusCondition ? (
                  <span data-bonus-condition>{bonusCondition}</span>
                ) : null}
                {bonusCondition ? (
                  <span
                    className={expansionStyles.contractBonusSeparator}
                    aria-hidden
                  >
                    ·
                  </span>
                ) : null}
                <span>
                  {contract.bonusCompleted
                    ? t("guild.contracts.bonus.completed")
                    : t("guild.contracts.bonus.pending")}
                </span>
              </p>
            ) : null}

            {isReady || canExtend ? (
              <div className={expansionStyles.contractRowActions}>
                {canExtend ? (
                  <PixelButton
                    size="sm"
                    variant="ghost-dark"
                    onClick={() => setExtendTarget(contract)}
                  >
                    {t("guild.contracts.extend.action")}
                  </PixelButton>
                ) : null}
                {isReady ? (
                  <PixelButton
                    size="sm"
                    disabled={claim.isPending}
                    onClick={() => handleClaim(contract.id)}
                  >
                    {t("guild.actions.turnIn")}
                  </PixelButton>
                ) : null}
              </div>
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

      <GuildExtendContractModal
        key={extendTarget?.id ?? "none"}
        contract={extendTarget}
        onClose={() => setExtendTarget(null)}
      />

      <GuildClaimCelebration
        opened={claimResult !== null}
        onClose={() => setClaimResult(null)}
        result={claimResult}
      />
    </section>
  );
}
