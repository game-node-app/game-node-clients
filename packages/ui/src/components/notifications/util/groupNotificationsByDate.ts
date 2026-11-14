export type NotificationDateGroupKey = "today" | "week" | "older";

export interface NotificationDateGroup<T> {
  key: NotificationDateGroupKey;
  items: T[];
}

export interface NotificationDatedItem {
  lastEventAt: string | Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const GROUP_ORDER: NotificationDateGroupKey[] = ["today", "week", "older"];

function startOfDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/**
 * Calendar-day bucket for a notification: `today`, the last 7 days (`week`)
 * or anything before that (`older`). Day boundaries follow the local timezone.
 */
export function getNotificationDateGroupKey(
  lastEventAt: string | Date,
  now: Date = new Date(),
): NotificationDateGroupKey {
  const date =
    lastEventAt instanceof Date ? lastEventAt : new Date(lastEventAt);
  if (Number.isNaN(date.getTime())) return "older";

  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (dayDiff <= 0) return "today";
  if (dayDiff <= 7) return "week";
  return "older";
}

/**
 * Groups notifications into `today`, `week` and `older`, in that order.
 *
 * Items keep the order they were received in, groups are never sorted and
 * empty groups are omitted.
 */
export function groupNotificationsByDate<T extends NotificationDatedItem>(
  items: readonly T[],
  now: Date = new Date(),
): NotificationDateGroup<T>[] {
  const groups = new Map<NotificationDateGroupKey, NotificationDateGroup<T>>();

  for (const item of items) {
    const key = getNotificationDateGroupKey(item.lastEventAt, now);
    const group = groups.get(key);
    if (group) {
      group.items.push(item);
    } else {
      groups.set(key, { key, items: [item] });
    }
  }

  return GROUP_ORDER.flatMap((key) => {
    const group = groups.get(key);
    return group ? [group] : [];
  });
}
