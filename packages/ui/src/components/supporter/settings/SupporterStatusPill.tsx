import { useTranslation } from "@repo/locales";
import {
  SettingsPill,
  SettingsPillTone,
} from "#@/components/settings/common/SettingsPill";
import type { SupporterStatus } from "../types";
import {
  formatSupporterDate,
  getSupporterStatusLabelKey,
} from "../util/supporterStatus";

interface Props {
  status: SupporterStatus;
  className?: string;
}

/**
 * Server-driven plan state as a settings pill: free, active, trial, payment
 * issue or the date a pending cancellation ends.
 */
export function SupporterStatusPill({ status, className }: Props) {
  const { t } = useTranslation();

  let tone: SettingsPillTone = "neutral";
  let label = t(getSupporterStatusLabelKey(status.status));

  if (!status.isSupporter) {
    tone = "neutral";
    label = t("supporter.status.free");
  } else if (status.status === "past_due") {
    tone = "danger";
    label = t("supporter.status.past_due");
  } else if (status.cancelAtPeriodEnd && status.periodEnd) {
    tone = "neutral";
    label = t("supporter.subscription.endingOn", {
      date:
        formatSupporterDate(
          status.periodEnd,
          t("supporter.billing.dateFormat"),
        ) ?? "",
    });
  } else if (status.status === "trialing") {
    tone = "success";
    label = t("supporter.status.trialing");
  } else if (status.status === "active") {
    tone = "success";
    label = t("supporter.status.active");
  }

  return (
    <SettingsPill tone={tone} withDot className={className}>
      {label}
    </SettingsPill>
  );
}
