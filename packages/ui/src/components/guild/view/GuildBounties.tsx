import { useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";
import type {
  ClaimGuildBountyResponseDto,
  GuildBountyDto,
  GuildBountyMilestoneStateDto,
} from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import guildStyles from "../guild.module.css";
import styles from "./GuildArcsBounties.module.css";
import { useClaimGuildBounty } from "../hooks/useClaimGuildBounty";
import { useGuildBounties } from "../hooks/useGuildBounties";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildRewardArt } from "../scene/GuildRewardArt";
import { PixelButton } from "../scene/PixelButton";
import { getChestAsset } from "../scene/cosmeticAssets";
import { formatGuildXp, formatTimeLeft, getRewardLabel } from "../util";
import { GuildChestResult } from "./GuildChestResult";
import { GuildQueryError } from "./GuildQueryError";

type Translate = (key: string, options?: Record<string, unknown>) => string;

function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
): string {
  return (t as unknown as Translate)(key, options);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bounties stay claimable for 14 days after they end (hand-off 3.11). */
const CLAIM_WINDOW_DAYS = 14;

/** Progress scale: the bar caps at 150 %, the overkill milestone. */
const PROGRESS_MAX = 150;
const PROGRESS_MARKERS = [25, 50, 100, 150] as const;

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(
    Number.isFinite(value) ? value : 0,
  );
}

function formatDate(value: string | Date, locale: string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/** `chests.<kind>` or the generic chest label for unknown future tiers. */
function getChestLabel(kind: string | null | undefined, t: TFunction): string {
  if (kind) {
    const key = `guild.chests.${kind}`;
    const label = translate(t, key);

    if (label !== key) return label;
  }

  return translate(t, "guild.rewards.generic.chest");
}

function getMilestoneState(
  milestone: GuildBountyMilestoneStateDto,
): "claimed" | "claimable" | "unlocked" | "locked" {
  if (milestone.claimed) return "claimed";
  if (milestone.claimable) return "claimable";
  if (milestone.unlocked) return "unlocked";

  return "locked";
}

function getProgressPercent(bounty: GuildBountyDto): number {
  if (Number.isFinite(bounty.progressPercent)) {
    return Math.max(0, bounty.progressPercent);
  }

  if (bounty.targetTotal > 0) {
    return Math.max(
      0,
      Math.floor((bounty.currentTotal * 100) / bounty.targetTotal),
    );
  }

  return 0;
}

/**
 * Time left while the bounty is open, the 14-day claim window after it ends,
 * or the final "ended" state. Kept outside the component so the render stays
 * pure (the clock read is not a component-level side effect).
 */
function getTimeLabel(
  bounty: GuildBountyDto,
  t: TFunction,
  locale: string,
): string | null {
  const endsAtMs = new Date(bounty.endsAt).getTime();

  if (Number.isNaN(endsAtMs)) return null;

  const now = Date.now();

  if (endsAtMs > now) {
    return t("guild.bounties.endsIn", {
      time: formatTimeLeft(bounty.endsAt),
    });
  }

  const claimWindowEnd = new Date(endsAtMs + CLAIM_WINDOW_DAYS * DAY_MS);

  if (claimWindowEnd.getTime() > now) {
    return t("guild.bounties.claimWindow", {
      date: formatDate(claimWindowEnd, locale),
    });
  }

  return t("guild.bounties.ended");
}

interface MilestoneChipProps {
  milestone: GuildBountyMilestoneStateDto;
  locale: string;
  /** Result chips keep their own surface (theme tokens) instead of parchment. */
  variant?: "card" | "result";
}

function MilestoneChip({
  milestone,
  locale,
  variant = "card",
}: MilestoneChipProps) {
  const { t } = useTranslation();
  const state = getMilestoneState(milestone);
  const result = variant === "result";

  return (
    <li
      className={cn(
        result ? styles.resultMilestone : styles.milestone,
        !result && state === "claimed" && styles.milestoneClaimed,
        !result && state === "claimable" && styles.milestoneClaimable,
        !result && state === "locked" && styles.milestoneLocked,
      )}
      data-milestone={milestone.milestone}
      data-state={state}
    >
      <span
        className={result ? styles.resultMilestoneValue : styles.milestoneValue}
      >
        {milestone.milestone}%
      </span>
      {state === "claimed" && !result ? (
        <span className={styles.milestoneStatus}>
          {t("guild.bounties.claimed")}
        </span>
      ) : null}
      <span
        className={
          result ? styles.resultMilestoneRewards : styles.milestoneRewards
        }
      >
        {milestone.sealsReward > 0 ? (
          <span
            className={
              result ? styles.resultMilestoneReward : styles.milestoneReward
            }
            data-milestone-seals={milestone.sealsReward}
          >
            <GuildIcon name="seal" size={result ? 14 : 12} />
            {t("guild.seals.reward", {
              seals: formatGuildXp(milestone.sealsReward, locale),
            })}
          </span>
        ) : null}
        {milestone.xpReward > 0 ? (
          <span
            className={
              result ? styles.resultMilestoneReward : styles.milestoneReward
            }
            data-milestone-xp={milestone.xpReward}
          >
            <GuildIcon name="coin" size={result ? 14 : 12} />
            {t("guild.board.xpReward", {
              xp: formatGuildXp(milestone.xpReward, locale),
            })}
          </span>
        ) : null}
        {milestone.chestKind ? (
          <span
            className={styles.milestoneChest}
            title={getChestLabel(milestone.chestKind, t)}
            aria-label={getChestLabel(milestone.chestKind, t)}
            data-milestone-chest={milestone.chestKind}
          >
            <GuildIcon name={getChestAsset(milestone.chestKind)} size={18} />
          </span>
        ) : null}
      </span>
    </li>
  );
}

interface BountyCardProps {
  bounty: GuildBountyDto;
  locale: string;
  highlighted: boolean;
  pending: boolean;
  cardRef: (node: HTMLElement | null) => void;
  onClaim: (bounty: GuildBountyDto) => void;
}

function BountyCard({
  bounty,
  locale,
  highlighted,
  pending,
  cardRef,
  onClaim,
}: BountyCardProps) {
  const { t } = useTranslation();
  const progressPercent = getProgressPercent(bounty);
  const visualPercent = Math.min(PROGRESS_MAX, progressPercent);
  const fillPercent = (visualPercent / PROGRESS_MAX) * 100;
  const timeLabel = getTimeLabel(bounty, t, locale);

  return (
    <article
      ref={cardRef}
      className={cn(
        styles.card,
        styles.bountyCard,
        highlighted && styles.highlighted,
      )}
      data-bounty-id={bounty.id}
      data-bounty-slug={bounty.slug}
      data-highlighted={highlighted ? "true" : undefined}
      data-bounty-pending={pending ? "true" : undefined}
    >
      <header className={styles.cardHeader}>
        <div className={styles.headings}>
          <h3 className={cn(guildStyles.pixelCardTitle, styles.cardTitle)}>
            {bounty.title}
          </h3>
          {timeLabel ? (
            <span className={styles.bountyTime} data-bounty-time>
              {timeLabel}
            </span>
          ) : null}
        </div>
      </header>

      {bounty.description ? (
        <p className={styles.description}>{bounty.description}</p>
      ) : null}

      <ul className={styles.bountyMeta}>
        <li
          className={styles.bountyMetaItem}
          data-user-contribution={bounty.userContribution}
        >
          {t("guild.bounties.contribution")}:{" "}
          {formatNumber(bounty.userContribution, locale)}
        </li>
        <li
          className={styles.bountyMetaItem}
          data-min-contribution={bounty.minUserContribution}
        >
          {t("guild.bounties.minContribution")}:{" "}
          {formatNumber(bounty.minUserContribution, locale)}
        </li>
      </ul>

      <div className={styles.progressBlock}>
        <div className={styles.progressHead}>
          <span className={styles.progressLabel}>
            {t("guild.bounties.progress")}
          </span>
          <span className={styles.progressValue} data-bounty-progress-value>
            {formatNumber(bounty.currentTotal, locale)} /{" "}
            {formatNumber(bounty.targetTotal, locale)}
          </span>
        </div>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={PROGRESS_MAX}
          aria-valuenow={visualPercent}
          aria-label={t("guild.bounties.progress")}
        >
          <span
            className={styles.progressFill}
            style={{ width: `${fillPercent}%` }}
          />
          {PROGRESS_MARKERS.map((marker) => (
            <span
              key={marker}
              className={cn(
                styles.progressMarker,
                progressPercent >= marker && styles.progressMarkerReached,
              )}
              style={{ left: `${(marker / PROGRESS_MAX) * 100}%` }}
              data-progress-marker={marker}
              data-reached={progressPercent >= marker ? "true" : "false"}
            />
          ))}
        </div>
        <div className={styles.progressScale} aria-hidden>
          {PROGRESS_MARKERS.map((marker) => (
            <span
              key={marker}
              className={cn(
                styles.progressScaleLabel,
                marker === PROGRESS_MARKERS[0] && styles.progressScaleFirst,
                marker === PROGRESS_MAX && styles.progressScaleLast,
                marker === PROGRESS_MAX &&
                  progressPercent > PROGRESS_MAX &&
                  styles.progressScaleOverkill,
              )}
              style={{ left: `${(marker / PROGRESS_MAX) * 100}%` }}
              data-progress-label={marker}
            >
              {marker === PROGRESS_MAX
                ? t("guild.bounties.overkill")
                : `${marker}%`}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.milestoneBlock}>
        <span className={styles.overline}>{t("guild.bounties.milestone")}</span>
        <ul className={styles.milestones}>
          {bounty.milestones.map((milestone) => (
            <MilestoneChip
              key={milestone.milestone}
              milestone={milestone}
              locale={locale}
            />
          ))}
        </ul>
      </div>

      <footer className={styles.bountyFooter}>
        {bounty.hasClaimableMilestones ? (
          <PixelButton
            size="sm"
            onClick={() => onClaim(bounty)}
            disabled={pending}
            data-bounty-claim
            data-bounty-id={bounty.id}
          >
            {t("guild.bounties.claim")}
          </PixelButton>
        ) : null}
        {!bounty.eligible ? (
          <p className={styles.notEligible} data-bounty-not-eligible>
            {t("guild.bounties.notEligible")}
          </p>
        ) : null}
      </footer>
    </article>
  );
}

interface ClaimResult {
  bounty: GuildBountyDto;
  response: ClaimGuildBountyResponseDto;
}

function BountyClaimModal({
  result,
  onClose,
}: {
  result: ClaimResult | null;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const response = result?.response;
  const newlyClaimed = response?.newlyClaimedMilestones ?? [];
  const milestoneStates = newlyClaimed
    .map((milestone) =>
      result?.bounty.milestones.find(
        (candidate) => candidate.milestone === milestone,
      ),
    )
    .filter((milestone): milestone is GuildBountyMilestoneStateDto =>
      Boolean(milestone),
    );
  // A cosmetic unlocked by a chest is shown inside that chest block, so the
  // plain rewards list skips it instead of listing it twice.
  const chestCosmeticKeys = new Set(
    (response?.chestResults ?? []).flatMap((chest) =>
      chest.unlockedCosmetic ? [chest.unlockedCosmetic.key] : [],
    ),
  );
  const listedRewards = (response?.unlockedRewards ?? []).filter(
    (reward) => !chestCosmeticKeys.has(reward.key),
  );

  return (
    <Modal
      opened={result !== null}
      onClose={onClose}
      title={t("guild.bounties.claimedResult")}
      centered
    >
      {response ? (
        <div className={styles.result}>
          {milestoneStates.length > 0 ? (
            <ul className={styles.resultMilestones}>
              {milestoneStates.map((milestone) => (
                <MilestoneChip
                  key={milestone.milestone}
                  milestone={milestone}
                  locale={locale}
                  variant="result"
                />
              ))}
            </ul>
          ) : null}

          <div className={styles.resultTotals}>
            {response.sealsAwarded > 0 ? (
              <span className={styles.resultTotal} data-result-seals>
                <GuildIcon name="seal" size={18} />
                {t("guild.claim.seals", {
                  seals: formatGuildXp(response.sealsAwarded, locale),
                })}
              </span>
            ) : null}
            {response.xpAwarded > 0 ? (
              <span className={styles.resultTotal} data-result-xp>
                <GuildIcon name="coin" size={18} />
                {t("guild.claim.xp", {
                  xp: formatGuildXp(response.xpAwarded, locale),
                })}
              </span>
            ) : null}
          </div>

          {listedRewards.length > 0 ? (
            <ul className={styles.resultRewards}>
              {listedRewards.map((reward) => (
                <li
                  key={reward.id ?? reward.key}
                  className={styles.resultReward}
                  data-result-reward={reward.key}
                >
                  <GuildRewardArt
                    kind={reward.kind}
                    rewardKey={reward.key}
                    consumableKey={reward.consumableKey}
                    size={14}
                  />
                  {getRewardLabel(reward, t)}
                </li>
              ))}
            </ul>
          ) : null}

          {response.chestResults.length > 0 ? (
            <div className={styles.resultChests}>
              {response.chestResults.map((chest, index) => (
                <GuildChestResult
                  key={`${chest.chestKind}-${index}`}
                  result={chest}
                  compact
                />
              ))}
            </div>
          ) : null}

          <div className={styles.resultActions}>
            <PixelButton size="sm" onClick={onClose}>
              {t("actions.close")}
            </PixelButton>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export interface GuildBountiesProps {
  /** Deep link from `guild.community-bounty-ready`: scroll and highlight the row. */
  initialBountyId?: string | null;
  className?: string;
}

/**
 * Community Bounties (design D9): server-localized copy, shared progress with
 * the 25/50/100/150 markers, user contribution against the minimum, time left
 * or claim window, milestone states and the all-at-once claim with its result.
 */
export function GuildBounties({
  initialBountyId,
  className,
}: GuildBountiesProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const bountiesQuery = useGuildBounties();
  const claim = useClaimGuildBounty();
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const bounties = bountiesQuery.data?.bounties ?? [];

  useEffect(() => {
    if (!initialBountyId) return;

    const node = cardRefs.current.get(initialBountyId);

    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialBountyId, bountiesQuery.data]);

  const setCardRef = (bountyId: string) => (node: HTMLElement | null) => {
    if (node) {
      cardRefs.current.set(bountyId, node);
    } else {
      cardRefs.current.delete(bountyId);
    }
  };

  const handleClaim = (bounty: GuildBountyDto) => {
    claim.mutate(
      { bountyId: bounty.id },
      { onSuccess: (response) => setClaimResult({ bounty, response }) },
    );
  };

  return (
    <section
      className={cn(styles.section, className)}
      aria-busy={bountiesQuery.isPending || undefined}
    >
      <header className={styles.header}>
        <h2 className={cn(guildStyles.pixelTitle, styles.title)}>
          {t("guild.bounties.title")}
        </h2>
      </header>

      {bountiesQuery.isPending && !bountiesQuery.data ? (
        <p className={styles.loading} role="status">
          {t("common.loading")}
        </p>
      ) : bountiesQuery.isError && !bountiesQuery.data ? (
        <GuildQueryError
          error={bountiesQuery.error}
          onRetry={() => {
            void bountiesQuery.refetch();
          }}
          isRetrying={bountiesQuery.isFetching}
        />
      ) : bounties.length === 0 ? (
        <p className={styles.empty}>{t("guild.bounties.empty")}</p>
      ) : (
        <div className={styles.list}>
          {bounties.map((bounty) => (
            <BountyCard
              key={bounty.id}
              bounty={bounty}
              locale={locale}
              highlighted={initialBountyId === bounty.id}
              pending={
                claim.isPending && claim.variables?.bountyId === bounty.id
              }
              cardRef={setCardRef(bounty.id)}
              onClaim={handleClaim}
            />
          ))}
        </div>
      )}

      <BountyClaimModal
        result={claimResult}
        onClose={() => setClaimResult(null)}
      />
    </section>
  );
}
