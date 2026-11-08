import dayjs from "dayjs";
import type { SupporterBillingInterval } from "../types";

const STATUS_LABEL_KEYS = {
  free: "supporter.status.free",
  active: "supporter.status.active",
  trialing: "supporter.status.trialing",
  past_due: "supporter.status.past_due",
  canceled: "supporter.status.canceled",
  incomplete: "supporter.status.incomplete",
  incomplete_expired: "supporter.status.incomplete_expired",
  unpaid: "supporter.status.unpaid",
  paused: "supporter.status.paused",
  unknown: "supporter.status.unknown",
} as const;

/** Server status string → the label key the settings surfaces render. */
export function getSupporterStatusLabelKey(
  status: string | null,
): (typeof STATUS_LABEL_KEYS)[keyof typeof STATUS_LABEL_KEYS] {
  if (status && status in STATUS_LABEL_KEYS) {
    return STATUS_LABEL_KEYS[status as keyof typeof STATUS_LABEL_KEYS];
  }

  return STATUS_LABEL_KEYS.unknown;
}

/** Billing interval from `/billing/me` → the existing interval label key. */
export function getSupporterIntervalLabelKey(
  interval: SupporterBillingInterval | null,
): "supporter.billing.monthly" | "supporter.billing.yearly" | null {
  if (interval === "year") return "supporter.billing.yearly";
  if (interval === "month") return "supporter.billing.monthly";

  return null;
}

/** Formats a billing date with the localized dayjs pattern used by the app. */
export function formatSupporterDate(
  value: string | null,
  format: string,
): string | null {
  return value ? dayjs(value).format(format) : null;
}
