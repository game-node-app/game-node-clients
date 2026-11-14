import type { TFunction } from "i18next";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Formats the most recent event of a notification as a short relative time.
 *
 * - under a minute: `now`
 * - under an hour: `2 min`
 * - under a day: `1 h`
 * - up to 7 days: `2 d`
 * - older than 7 days: the localized short date, e.g. `Oct 22, 2026`
 *
 * `language` is only used for the short date; omit it to use the runtime locale.
 */
export function formatNotificationTime(
  lastEventAt: string | Date,
  t: TFunction,
  language?: string,
): string {
  const date =
    lastEventAt instanceof Date ? lastEventAt : new Date(lastEventAt);
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) return "";

  const elapsed = Math.max(Date.now() - timestamp, 0);

  if (elapsed < MINUTE_MS) {
    return t("notifications.time.now");
  }

  const minutes = Math.floor(elapsed / MINUTE_MS);
  if (minutes < 60) {
    return t("notifications.time.minutes", { count: minutes });
  }

  const hours = Math.floor(elapsed / HOUR_MS);
  if (hours < 24) {
    return t("notifications.time.hours", { count: hours });
  }

  const days = Math.floor(elapsed / DAY_MS);
  if (days <= 7) {
    return t("notifications.time.days", { count: days });
  }

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
