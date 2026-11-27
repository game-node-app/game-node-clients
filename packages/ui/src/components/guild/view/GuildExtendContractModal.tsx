import { useState } from "react";
import type {
  ExtendGuildContractResponseDto,
  GuildContractDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "./GuildContractsExpansion.module.css";
import { useExtendGuildContract } from "../hooks/useExtendGuildContract";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { useGuildRewards } from "../hooks/useGuildRewards";
import { PixelButton } from "../scene/PixelButton";
import { formatTimeLeft, getQuestCopy } from "../util";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface GuildExtendContractModalProps {
  /** Target active contract; `null` keeps the modal closed. */
  contract: GuildContractDto | null;
  onClose(): void;
  /** Whether a free monthly Hourglass is available (falls back to overview). */
  freeHourglassAvailable?: boolean;
  /** Owned inventory Hourglass count (falls back to rewards). */
  ownedHourglasses?: number;
}

function formatDeadlineDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/**
 * Confirmation for "Extend +7 days" (design D6). Displays the contract,
 * target game, current and projected +7 day deadlines, and the Hourglass
 * source (free monthly perk or inventory balance) before confirmation.
 */
export function GuildExtendContractModal({
  contract,
  onClose,
  freeHourglassAvailable,
  ownedHourglasses,
}: GuildExtendContractModalProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const extend = useExtendGuildContract();
  const overviewQuery = useGuildOverview();
  const rewardsQuery = useGuildRewards();
  const [result, setResult] = useState<ExtendGuildContractResponseDto | null>(
    null,
  );

  const resolvedFreeHourglassAvailable =
    freeHourglassAvailable ??
    (overviewQuery.data?.license?.perks?.monthlyFreeHourglass ?? 0) > 0;
  const resolvedOwnedHourglasses =
    ownedHourglasses ?? rewardsQuery.data?.consumables?.hourglass ?? 0;

  const contractTitle = contract
    ? getQuestCopy(contract, t, language).title
    : "";
  const targetGameName = contract?.targetGame?.name ?? null;

  const deadlineDates = (() => {
    if (!contract?.expiresAt) return null;
    const expiresMs = new Date(contract.expiresAt).getTime();
    if (Number.isNaN(expiresMs)) return null;

    return {
      current: formatDeadlineDate(new Date(expiresMs), language),
      projected: formatDeadlineDate(
        new Date(expiresMs + SEVEN_DAYS_MS),
        language,
      ),
    };
  })();

  const handleConfirm = () => {
    if (!contract) return;

    extend.mutate(
      { contractId: contract.id },
      { onSuccess: (response) => setResult(response) },
    );
  };

  const newDeadline = result?.contract?.expiresAt
    ? formatTimeLeft(result.contract.expiresAt)
    : null;

  return (
    <Modal
      opened={contract !== null}
      onClose={onClose}
      title={t("guild.contracts.extend.confirmTitle")}
      centered
    >
      <div className={styles.extendBody}>
        {result ? (
          <>
            <p
              className={cn(styles.extendText, styles.extendDone)}
              data-extend-done
            >
              {t("guild.contracts.extend.done")}
            </p>
            <p className={styles.extendText} data-extend-hourglass>
              {result.usedFreeMonthlyHourglass
                ? t("guild.contracts.extend.free")
                : t("guild.contracts.extend.consumable")}
            </p>
            {newDeadline ? (
              <p className={styles.extendDeadline} data-extend-deadline>
                {t("guild.contracts.deadline", { time: newDeadline })}
              </p>
            ) : null}
            <div className={styles.extendActions}>
              <PixelButton size="sm" onClick={onClose}>
                {t("actions.close")}
              </PixelButton>
            </div>
          </>
        ) : (
          <>
            {contractTitle ? (
              <div className={styles.extendSummary} data-extend-summary>
                <p className={styles.extendContractTitle} data-extend-title>
                  {contractTitle}
                </p>
                {targetGameName ? (
                  <p className={styles.extendGameName} data-extend-game>
                    {targetGameName}
                  </p>
                ) : null}
              </div>
            ) : null}
            <p className={styles.extendText}>
              {t("guild.contracts.extend.confirmBody")}
            </p>
            {deadlineDates ? (
              <div className={styles.extendDetails}>
                <p
                  className={styles.extendDeadline}
                  data-extend-current-deadline
                >
                  {t("guild.contracts.extend.currentDeadline", {
                    date: deadlineDates.current,
                  })}
                </p>
                <p
                  className={styles.extendNewDeadline}
                  data-extend-new-deadline
                >
                  {t("guild.contracts.extend.newDeadline", {
                    date: deadlineDates.projected,
                  })}
                </p>
              </div>
            ) : null}
            <p className={styles.extendCost} data-extend-cost>
              {resolvedFreeHourglassAvailable
                ? t("guild.contracts.extend.costFree")
                : t("guild.contracts.extend.costConsumable", {
                    count: resolvedOwnedHourglasses,
                  })}
            </p>
            <div className={styles.extendActions}>
              <PixelButton
                size="sm"
                variant="ghost-dark"
                onClick={onClose}
                disabled={extend.isPending}
              >
                {t("actions.cancel")}
              </PixelButton>
              <PixelButton
                size="sm"
                onClick={handleConfirm}
                disabled={extend.isPending}
              >
                {t("guild.contracts.extend.action")}
              </PixelButton>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
