/**
 * Ranking numbers come from the server already rounded to one decimal place;
 * these only localize them, never re-round.
 */
export const formatDailyPoints = (value: number, language: string) =>
  new Intl.NumberFormat(language || "en", {
    maximumFractionDigits: 1,
  }).format(value);

/** Counts (players, positions, wins): same formatting, kept separate for intent. */
export const formatDailyCount = formatDailyPoints;

export type DailyPositionChange =
  | { kind: "up" | "down"; amount: number }
  | { kind: "same" | "new" | "none"; amount?: undefined };

/** Narrows the server's `number | "new" | null` change. */
export function toPositionChange(
  value: number | string | null | undefined,
): DailyPositionChange {
  if (value === "new") return { kind: "new" };
  if (typeof value !== "number") return { kind: "none" };
  if (value > 0) return { kind: "up", amount: value };
  if (value < 0) return { kind: "down", amount: -value };
  return { kind: "same" };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "3d 14h", "14h 32m" or "32m" until `endsAt`; minute precision, never negative. */
export function formatDailyRemaining(endsAt: string, now: number) {
  const remaining = Math.max(Date.parse(endsAt) - now, 0);
  const days = Math.floor(remaining / DAY);
  const hours = Math.floor((remaining % DAY) / HOUR);
  const minutes = Math.floor((remaining % HOUR) / MINUTE);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
