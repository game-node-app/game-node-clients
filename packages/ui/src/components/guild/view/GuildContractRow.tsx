import { GuildContractDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, Link } from "#@/util";

import styles from "../guild.module.css";
import expansionStyles from "./GuildContractsExpansion.module.css";
import { getBonusObjectiveCondition } from "./guildContractExpansion";
import { GuildIcon } from "../scene/GuildIcon";
import { PixelButton } from "../scene/PixelButton";
import { formatGuildXp, formatTimeLeft, getQuestCopy } from "../util";

export interface GuildContractRowProps {
  contract: GuildContractDto;
  /** Only `ready_to_claim` rows render "Turn in". */
  onClaim?(contract: GuildContractDto): void;
  /** Only `active` rows render "Abandon". */
  onAbandon?(contract: GuildContractDto): void;
  /** Only `active` rows render "Extend +7 days" when the rules allow it. */
  onExtend?(contract: GuildContractDto): void;
  /** `guild.contracts.chainStage` when the row belongs to the active chain. */
  chainStageLabel?: string | null;
  /** Hourglass/monthly allowance and `extendedCount` already checked by the owner. */
  canExtend?: boolean;
  isClaiming?: boolean;
  isAbandoning?: boolean;
  isExtending?: boolean;
  className?: string;
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  active: "guild.contracts.status.active",
  ready_to_claim: "guild.contracts.status.readyToClaim",
  completed: "guild.contracts.status.completed",
  abandoned: "guild.contracts.status.abandoned",
  expired: "guild.contracts.status.expired",
};

const STATUS_CLASSES: Record<string, string | undefined> = {
  active: styles.contractStatusActive,
  ready_to_claim: styles.contractStatusReady,
  completed: styles.contractStatusCompleted,
  abandoned: styles.contractStatusMuted,
  expired: styles.contractStatusMuted,
};

function formatNumber(value: number, locale: string): string {
  const safe = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat(locale).format(safe);
}

/**
 * "18h of 29h" style caption from `playtimeProgress`; one decimal below ten
 * hours so a short session is not rounded away.
 */
function formatHours(seconds: number, locale: string): string {
  const hours = Math.max(0, seconds) / 3600;

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: hours < 10 ? 1 : 0,
  }).format(hours);
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

/**
 * One contract of the "Accepted" or "Completed" lists (design D6): copy from
 * the quest, target game, progress (playtime percent or counted objective),
 * accepted time, status and the actions of that status.
 */
export function GuildContractRow({
  contract,
  onClaim,
  onAbandon,
  onExtend,
  chainStageLabel,
  canExtend = false,
  isClaiming = false,
  isAbandoning = false,
  isExtending = false,
  className,
}: GuildContractRowProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const copy = getQuestCopy(contract, t, locale);
  const status = contract.status as string;
  const isReady = contract.status === GuildContractDto.status.READY_TO_CLAIM;
  const isActive = contract.status === GuildContractDto.status.ACTIVE;
  const playtime = contract.playtimeProgress;
  const hasPlaytimePercent = playtime?.estimatedPercent != null;

  const ratioPercent =
    contract.progressTarget > 0
      ? (contract.progressCurrent / contract.progressTarget) * 100
      : 0;
  const percent = hasPlaytimePercent
    ? (playtime?.estimatedPercent as number)
    : ratioPercent;
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const progressValue = hasPlaytimePercent
    ? `${formatNumber(Math.round(clampedPercent), locale)}%`
    : `${formatNumber(contract.progressCurrent, locale)} / ${formatNumber(
        contract.progressTarget,
        locale,
      )}`;

  const progressCaption =
    playtime && playtime.estimatedTotalSeconds != null
      ? t("guild.activeContracts.playtime", {
          played: formatHours(playtime.playedSeconds, locale),
          estimated: formatHours(playtime.estimatedTotalSeconds, locale),
        })
      : copy.description;

  const acceptedAt = formatElapsed(contract.acceptedAt, locale);
  const statusLabel = (t as unknown as (key: string) => string)(
    STATUS_LABEL_KEYS[status] ?? "guild.contracts.status.active",
  );
  const hasBonusObjective =
    contract.bonusObjective !== null && contract.bonusObjective !== undefined;
  const bonusCondition = hasBonusObjective
    ? getBonusObjectiveCondition(contract.bonusObjective, t)
    : null;
  const sealsReward = contract.sealsReward ?? 0;

  // The contract's own deadline (`acceptedAt` + duration / event end), not the
  // board refresh. A `ready_to_claim` contract stays claimable after it passes,
  // so only `active` rows show a countdown (design D10, spec guild-hall).
  const deadline =
    isActive && contract.expiresAt ? formatTimeLeft(contract.expiresAt) : null;

  // Imported or re-finished games never move a `finish_game` bar (hand-off
  // 7.6), so an untouched active contract explains why it is still at zero.
  const showFinishHint =
    isActive &&
    contract.objectiveType === "finish_game" &&
    contract.progressCurrent === 0;

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
          className={cn(
            styles.contractTargetCover,
            expansionStyles.contractTargetCover,
          )}
          style={{
            width: 20,
            height: 27,
            imageRendering: "auto",
            objectFit: "cover",
          }}
        />
      ) : (
        <span
          className={cn(
            styles.contractTargetCoverFallback,
            expansionStyles.contractTargetCover,
          )}
          style={{ width: 20, height: 27 }}
          aria-hidden
        />
      )}
      <span className={styles.contractTargetName}>
        {contract.targetGame.name}
      </span>
    </>
  ) : null;

  return (
    <article
      className={cn(
        styles.contractListItem,
        isReady && styles.contractListItemReady,
        className,
      )}
      data-contract-id={contract.id}
      data-status={status}
    >
      <header className={styles.contractListItemHeader}>
        <h3 className={cn(styles.contractListItemTitle, styles.pixelLabel)}>
          {copy.title}
        </h3>
        <span
          className={cn(styles.contractStatus, STATUS_CLASSES[status])}
          data-status={status}
        >
          {statusLabel}
        </span>
      </header>

      <div className={expansionStyles.contractRewards}>
        <span className={expansionStyles.contractReward} data-contract-xp>
          <GuildIcon name="coin" size={14} />
          {t("guild.board.xpReward", {
            xp: formatGuildXp(contract.xpReward, locale),
          })}
        </span>
        {sealsReward > 0 ? (
          <span className={expansionStyles.contractReward} data-contract-seals>
            <GuildIcon name="seal" size={14} />
            {t("guild.seals.reward", {
              seals: formatGuildXp(sealsReward, locale),
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

      {contract.targetGame ? (
        contract.targetGameId != null ? (
          <Link
            href={`/game/${contract.targetGameId}`}
            className={cn(
              styles.contractTarget,
              expansionStyles.contractTargetLink,
            )}
          >
            {targetGameContent}
          </Link>
        ) : (
          <span className={styles.contractTarget}>{targetGameContent}</span>
        )
      ) : null}

      <div className={styles.contractProgress}>
        <div className={styles.contractProgressHead}>
          <span className={styles.contractProgressCaption}>
            {progressCaption}
          </span>
          <span className={styles.contractProgressValue}>{progressValue}</span>
        </div>
        <div
          className={styles.contractProgressBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clampedPercent)}
        >
          <span
            className={styles.contractProgressFill}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
      </div>

      {showFinishHint ? (
        <p className={cn(styles.captionText, styles.subtleText, "m-0")}>
          {t("guild.board.rules.finish")}
        </p>
      ) : null}

      <footer className={styles.contractListItemFooter}>
        <span className={styles.contractListItemTime}>
          {acceptedAt
            ? t("guild.activeContracts.acceptedAgo", { time: acceptedAt })
            : null}
          {deadline ? (
            <>
              {acceptedAt ? " · " : null}
              <span data-contract-deadline>
                {t("guild.contracts.deadline", { time: deadline })}
              </span>
            </>
          ) : null}
        </span>
        <div className={styles.contractListItemActions}>
          {/* A ready contract stays claimable after `expiresAt` (spec). */}
          {isReady ? (
            <PixelButton
              size="sm"
              onClick={() => onClaim?.(contract)}
              disabled={isClaiming}
            >
              {t("guild.actions.turnIn")}
            </PixelButton>
          ) : null}
          {isActive && canExtend ? (
            <PixelButton
              size="sm"
              variant="ghost-dark"
              onClick={() => onExtend?.(contract)}
              disabled={isExtending}
            >
              {t("guild.contracts.extend.action")}
            </PixelButton>
          ) : null}
          {isActive ? (
            <PixelButton
              size="sm"
              variant="ghost-dark"
              onClick={() => onAbandon?.(contract)}
              disabled={isAbandoning}
            >
              {t("guild.actions.abandon")}
            </PixelButton>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
