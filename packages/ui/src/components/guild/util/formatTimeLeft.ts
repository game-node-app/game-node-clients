const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * Short countdown used by the hall subtitle and the tabs refresh hint, e.g.
 * `3d 14h`, `5h 20m`, `12m`. Invalid dates render as an empty string.
 */
export function formatTimeLeft(
  target: string | Date,
  now: Date = new Date(),
): string {
  const targetDate = target instanceof Date ? target : new Date(target);
  const targetMs = targetDate.getTime();
  if (Number.isNaN(targetMs)) return "";

  const remaining = Math.max(targetMs - now.getTime(), 0);
  const days = Math.floor(remaining / DAY_MS);
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
}
