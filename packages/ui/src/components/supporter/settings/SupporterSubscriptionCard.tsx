import { useState } from "react";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { useTranslation } from "@repo/locales";
import {
  IconAlertTriangle,
  IconCalendarEvent,
  IconCreditCard,
  IconCrown,
  IconExternalLink,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { SupporterCancelDialog } from "../SupporterCancelDialog";
import { useSupporterActions } from "../hooks/useSupporterActions";
import type { SupporterStatus } from "../types";
import {
  formatSupporterDate,
  getSupporterIntervalLabelKey,
} from "../util/supporterStatus";
import { SupporterSettingsBanner } from "./SupporterSettingsBanner";
import { SupporterStatusPill } from "./SupporterStatusPill";

export interface SupporterSubscriptionCardProps {
  status: SupporterStatus;
  className?: string;
}

/**
 * Details and self-service actions for an existing subscription. Rows are
 * driven exclusively by `/billing/me`; the card renders nothing for users
 * without a subscription.
 */
export function SupporterSubscriptionCard({
  status,
  className,
}: SupporterSubscriptionCardProps) {
  const { t } = useTranslation();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const actions = useSupporterActions({
    onCancelSuccess: () => setIsCancelDialogOpen(false),
  });

  if (!status.isSupporter) return null;

  const intervalLabel = getSupporterIntervalLabelKey(status.billingInterval);
  const periodEndLabel = status.periodEnd
    ? formatSupporterDate(status.periodEnd, t("supporter.billing.dateFormat"))
    : null;
  const planDescription = [
    status.plan ? t("supporter.planName") : t("supporter.status.label"),
    intervalLabel ? t(intervalLabel) : null,
  ]
    .filter((piece): piece is string => !!piece)
    .join(" · ");

  const isPastDue = status.status === "past_due";
  const isEnding = status.cancelAtPeriodEnd === true;
  const isCanceled = status.status === "canceled";
  // A canceled-but-paid subscription keeps access until the period end, so the
  // date row reads "Ends on" even though the Stripe status is already canceled.
  const showsEndDate = isEnding || isCanceled;

  return (
    <SettingsSection
      title={t("supporter.subscription.title")}
      className={className}
    >
      <SupporterCancelDialog
        opened={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        periodEnd={status.periodEnd}
        isPending={actions.isCancelPending}
        error={actions.cancelError}
        onConfirm={actions.cancelSubscription}
      />

      <SettingsCard data-testid={"supporter-subscription-card"}>
        <SettingsRow
          Icon={IconCrown}
          title={t("supporter.subscription.plan")}
          description={planDescription}
          rightSection={<SupporterStatusPill status={status} />}
        />

        {periodEndLabel &&
          (showsEndDate ? (
            <SettingsRow
              Icon={IconCalendarEvent}
              title={t("supporter.subscription.ends")}
              description={t("supporter.billing.endsOn", {
                date: periodEndLabel,
              })}
            />
          ) : (
            <SettingsRow
              Icon={IconCalendarEvent}
              title={t("supporter.subscription.renewal")}
              description={t("supporter.billing.renewsOn", {
                date: periodEndLabel,
              })}
            />
          ))}

        <SettingsRow
          Icon={IconCreditCard}
          title={t("supporter.subscription.billing")}
          description={t("supporter.subscription.billingDescription")}
          stackRightSection
          rightSection={
            <SettingsButton
              variant={"secondary"}
              onClick={actions.manageBilling}
              loading={actions.isPortalPending}
              disabled={actions.isAnyPending}
              rightSection={<IconExternalLink size={14} />}
              classNames={{ section: "ms-1.5" }}
            >
              {t("supporter.actions.manageBilling")}
            </SettingsButton>
          }
        />

        {isPastDue ? (
          <SettingsRow
            Icon={IconAlertTriangle}
            title={t("supporter.subscription.paymentIssue")}
            description={t("supporter.pastDue.description")}
            stackRightSection
            rightSection={
              <SettingsButton
                variant={"primary"}
                onClick={actions.manageBilling}
                loading={actions.isPortalPending}
                disabled={actions.isAnyPending}
              >
                {t("supporter.pastDue.action")}
              </SettingsButton>
            }
          />
        ) : isEnding ? (
          <SettingsRow
            Icon={IconRefresh}
            title={t("supporter.pendingCancellation.title")}
            description={t("supporter.pendingCancellation.description", {
              date: periodEndLabel ?? "",
            })}
            stackRightSection
            rightSection={
              <SettingsButton
                variant={"secondary"}
                onClick={actions.restoreSubscription}
                loading={actions.isRestorePending}
                disabled={actions.isAnyPending}
              >
                {t("supporter.actions.keepSubscription")}
              </SettingsButton>
            }
          />
        ) : isCanceled ? null : (
          <SettingsRow
            Icon={IconX}
            title={t("supporter.subscription.cancel")}
            description={t("supporter.subscription.cancelDescription", {
              date: periodEndLabel ?? "",
            })}
            stackRightSection
            rightSection={
              <SettingsButton
                variant={"dangerOutline"}
                onClick={() => {
                  actions.clearCancelError();
                  setIsCancelDialogOpen(true);
                }}
                disabled={actions.isAnyPending}
              >
                {t("supporter.actions.cancelSubscription")}
              </SettingsButton>
            }
          />
        )}
      </SettingsCard>

      {actions.actionError && (
        <SupporterSettingsBanner
          tone={"error"}
          description={actions.actionError}
        />
      )}
    </SettingsSection>
  );
}
