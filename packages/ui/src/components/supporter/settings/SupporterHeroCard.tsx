import {
  Box,
  Group,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCrown } from "@tabler/icons-react";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsPill } from "#@/components/settings/common/SettingsPill";
import { cn } from "#@/util";
import type {
  SupporterErrorKind,
  SupporterInterval,
  SupporterOffers,
  SupporterStatus,
} from "../types";
import {
  formatSupporterDate,
  getSupporterIntervalLabelKey,
} from "../util/supporterStatus";
import { SupporterStatusPill } from "./SupporterStatusPill";

export interface SupporterHeroCardProps {
  /** Server-authoritative subscription status, `undefined` while unknown. */
  status?: SupporterStatus;
  isStatusLoading?: boolean;
  /** Billing failure kind; `unavailable` (503) disables checkout. */
  statusErrorKind?: SupporterErrorKind | null;
  onRetryStatus?: () => void;
  offers?: SupporterOffers;
  isOffersLoading?: boolean;
  isOffersError?: boolean;
  onRetryOffers?: () => void;
  selectedInterval: SupporterInterval;
  onIntervalChange: (interval: SupporterInterval) => void;
  onSubscribe: (interval: SupporterInterval) => void;
  isSubscribePending?: boolean;
  className?: string;
}

const INTERVALS: SupporterInterval[] = ["monthly", "yearly"];

const INTERVAL_LABEL_KEYS = {
  monthly: "supporter.plans.monthly",
  yearly: "supporter.plans.yearly",
} as const;

const SUBSCRIBE_LABEL_KEYS = {
  monthly: "supporter.plans.monthlyCta",
  yearly: "supporter.plans.yearlyCta",
} as const;

interface PlanOptionProps {
  interval: SupporterInterval;
  isSelected: boolean;
  offerDisplayAmount?: string;
  isOffersLoading: boolean;
  disabled: boolean;
  onSelect: (interval: SupporterInterval) => void;
}

function SupporterPlanOption({
  interval,
  isSelected,
  offerDisplayAmount,
  isOffersLoading,
  disabled,
  onSelect,
}: PlanOptionProps) {
  const { t } = useTranslation();

  return (
    <UnstyledButton
      type={"button"}
      aria-pressed={isSelected}
      disabled={disabled}
      onClick={() => onSelect(interval)}
      data-testid={`supporter-plan-option-${interval}`}
      className={cn(
        "rounded-xl border border-solid px-4 py-3 text-left transition-colors",
        isSelected
          ? "border-[#f15025] bg-[rgba(241,80,37,0.1)]"
          : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <Group justify={"space-between"} gap={8} wrap={"nowrap"}>
        <Text fz={14} fw={isSelected ? 700 : 500} c={"white"} lh={"normal"}>
          {t(INTERVAL_LABEL_KEYS[interval])}
        </Text>
        {interval === "yearly" && (
          <SettingsPill tone={"accent"}>
            {t("supporter.plans.yearlySavings")}
          </SettingsPill>
        )}
      </Group>
      <Box mt={8}>
        {isOffersLoading ? (
          <Skeleton
            height={20}
            width={84}
            radius={"sm"}
            data-testid={`supporter-plan-price-loading-${interval}`}
          />
        ) : (
          offerDisplayAmount && (
            <Text fz={18} fw={700} c={"white"} lh={"normal"}>
              {offerDisplayAmount}
            </Text>
          )
        )}
      </Box>
    </UnstyledButton>
  );
}

/**
 * Supporter summary card. Prices always come from the server-provided
 * `displayAmount`; entitlement and dates always come from `/billing/me`.
 */
export function SupporterHeroCard({
  status,
  isStatusLoading = false,
  statusErrorKind = null,
  onRetryStatus,
  offers,
  isOffersLoading = false,
  isOffersError = false,
  onRetryOffers,
  selectedInterval,
  onIntervalChange,
  onSubscribe,
  isSubscribePending = false,
  className,
}: SupporterHeroCardProps) {
  const { t } = useTranslation();

  const isSupporter = status?.isSupporter === true;
  const isUnavailable = statusErrorKind === "unavailable";
  const isStatusError = statusErrorKind !== null;
  const selectedOffer = offers?.offers.find(
    (offer) => offer.interval === selectedInterval,
  );
  const isPriceUnavailable =
    !isOffersLoading && (!selectedOffer || isOffersError);
  const canSubscribe =
    !!selectedOffer && !isUnavailable && !isStatusError && !isSubscribePending;

  const intervalLabel = getSupporterIntervalLabelKey(
    status?.billingInterval ?? null,
  );
  const periodEndLabel = status?.periodEnd
    ? formatSupporterDate(status.periodEnd, t("supporter.billing.dateFormat"))
    : null;
  const summaryPieces = [
    status?.plan ? t("supporter.planName") : null,
    intervalLabel ? t(intervalLabel) : null,
    periodEndLabel
      ? t(
          status?.cancelAtPeriodEnd
            ? "supporter.billing.endsOn"
            : "supporter.billing.renewsOn",
          { date: periodEndLabel },
        )
      : null,
  ].filter((piece): piece is string => !!piece);

  const statusErrorMessage = isUnavailable
    ? t("supporter.errors.billingUnavailable")
    : statusErrorKind === "network"
      ? t("supporter.errors.network")
      : t("supporter.errors.statusUnavailable");

  return (
    <SettingsCard
      withDividers={false}
      data-testid={"supporter-hero-card"}
      className={cn("@container border-[rgba(151,71,255,0.4)]", className)}
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(151,71,255,0.12), rgba(26,26,26,0) 60%)",
      }}
    >
      <Stack gap={20} className={"p-6"}>
        <Group
          gap={20}
          wrap={"nowrap"}
          align={"flex-start"}
          className={"flex-col @[520px]:flex-row"}
        >
          <Group
            gap={20}
            wrap={"nowrap"}
            align={"flex-start"}
            className={"w-full min-w-0 flex-1"}
          >
            <Box
              aria-hidden
              className={
                "flex size-[52px] shrink-0 items-center justify-center rounded-[14px] border border-solid border-[rgba(151,71,255,0.4)] bg-[rgba(151,71,255,0.16)] text-[#c7a6ff]"
              }
            >
              <IconCrown size={24} />
            </Box>
            <Stack gap={6} className={"min-w-0 flex-1"}>
              <Text fz={18} fw={600} c={"white"} lh={"normal"}>
                {t("settings.premium.hero.title")}
              </Text>
              <Text fz={13} lh={"19px"} className={"text-[#adadad]"}>
                {t("settings.premium.hero.description")}
              </Text>
            </Stack>
          </Group>
          {status && <SupporterStatusPill status={status} />}
        </Group>

        {isStatusLoading && !status ? (
          <Stack gap={10} data-testid={"supporter-hero-loading"}>
            <Skeleton height={84} radius={"md"} />
            <Skeleton height={36} width={180} radius={"sm"} />
          </Stack>
        ) : isStatusError ? (
          <Stack gap={10}>
            <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
              {statusErrorMessage}
            </Text>
            {onRetryStatus && (
              <Box>
                <SettingsButton variant={"secondary"} onClick={onRetryStatus}>
                  {t("supporter.actions.retry")}
                </SettingsButton>
              </Box>
            )}
          </Stack>
        ) : isSupporter ? (
          <Text fz={13} lh={"19px"} className={"text-[#b98aff]"}>
            {t("supporter.subscription.thankYou")} {summaryPieces.join(" · ")}
          </Text>
        ) : (
          <Stack gap={16}>
            <Box
              role={"group"}
              aria-label={t("supporter.plans.title")}
              className={"grid grid-cols-1 gap-3 @[420px]:grid-cols-2"}
            >
              {INTERVALS.map((interval) => (
                <SupporterPlanOption
                  key={interval}
                  interval={interval}
                  isSelected={interval === selectedInterval}
                  offerDisplayAmount={
                    offers?.offers.find((offer) => offer.interval === interval)
                      ?.displayAmount
                  }
                  isOffersLoading={isOffersLoading}
                  disabled={isSubscribePending}
                  onSelect={onIntervalChange}
                />
              ))}
            </Box>

            {isPriceUnavailable && (
              <Group gap={8}>
                <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
                  {t("supporter.plans.priceUnavailable")}
                </Text>
                {isOffersError && onRetryOffers && (
                  <SettingsButton variant={"ghost"} onClick={onRetryOffers}>
                    {t("supporter.plans.retry")}
                  </SettingsButton>
                )}
              </Group>
            )}

            <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
              {t("supporter.plans.priceNote")}
            </Text>

            <Box>
              <SettingsButton
                variant={"primary"}
                onClick={() => onSubscribe(selectedInterval)}
                loading={isSubscribePending}
                disabled={!canSubscribe}
              >
                {t(SUBSCRIBE_LABEL_KEYS[selectedInterval])}
              </SettingsButton>
            </Box>
          </Stack>
        )}
      </Stack>
    </SettingsCard>
  );
}
