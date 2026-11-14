import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import enTranslations from "../../../../../packages/locales/src/translations/json/en.json";
import ptTranslations from "../../../../../packages/locales/src/translations/json/pt-BR.json";
import { formatNotificationTime } from "../../../../../packages/ui/src/components/notifications/util/formatNotificationTime";
import {
  getNotificationDateGroupKey,
  groupNotificationsByDate,
} from "../../../../../packages/ui/src/components/notifications/util/groupNotificationsByDate";

type Translate = Parameters<typeof formatNotificationTime>[1];

function lookup(dictionary: unknown, key: string): unknown {
  let value: unknown = dictionary;
  for (const part of key.split(".")) {
    value =
      typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)[part]
        : undefined;
  }
  return value;
}

function createTranslator(language: "en" | "pt-BR"): Translate {
  const dictionary = language === "pt-BR" ? ptTranslations : enTranslations;

  const translate = (key: string, options?: Record<string, unknown>) => {
    let value = lookup(dictionary, key);

    if (typeof value !== "string") {
      const count = Number(options?.count ?? 0);
      const pluralKey = `${key}_${count === 1 ? "one" : "other"}`;
      value = lookup(dictionary, pluralKey);
    }

    if (typeof value !== "string") return key;

    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
      String(options?.[name] ?? ""),
    );
  };

  return translate as unknown as Translate;
}

const en = createTranslator("en");
const ptBR = createTranslator("pt-BR");

describe("formatNotificationTime", () => {
  const now = new Date("2026-11-11T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const secondsAgo = (seconds: number) =>
    new Date(now.getTime() - seconds * 1000);

  it.each([
    [30, "now"],
    [59, "now"],
    [60, "1 min"],
    [2 * 60, "2 min"],
    [59 * 60, "59 min"],
    [60 * 60, "1 h"],
    [5 * 60 * 60, "5 h"],
    [23 * 60 * 60, "23 h"],
    [24 * 60 * 60, "1 d"],
    [2 * 24 * 60 * 60, "2 d"],
    [7 * 24 * 60 * 60, "7 d"],
  ])("formats %i seconds ago as %s", (seconds, expected) => {
    expect(formatNotificationTime(secondsAgo(seconds), en)).toBe(expected);
  });

  it("uses the short localized date after 7 days", () => {
    const date = secondsAgo(20 * 24 * 60 * 60);

    expect(formatNotificationTime(date, en, "en")).toBe(
      new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date),
    );

    const ptResult = formatNotificationTime(date, ptBR, "pt-BR");
    expect(ptResult).toContain("2026");
    expect(ptResult).toContain("out");
  });

  it("translates relative units to pt-BR", () => {
    expect(formatNotificationTime(secondsAgo(2 * 60), ptBR)).toBe("2 min");
    expect(formatNotificationTime(secondsAgo(2 * 60 * 60), ptBR)).toBe("2 h");
    expect(formatNotificationTime(secondsAgo(2 * 24 * 60 * 60), ptBR)).toBe(
      "2 d",
    );
    expect(formatNotificationTime(secondsAgo(30), ptBR)).toBe("agora");
  });

  it("treats future events as now and invalid dates as empty", () => {
    expect(formatNotificationTime(new Date(now.getTime() + 60_000), en)).toBe(
      "now",
    );
    expect(formatNotificationTime("not-a-date", en)).toBe("");
  });
});

describe("groupNotificationsByDate", () => {
  // Noon in local time so calendar-day boundaries do not depend on the run timezone.
  const now = new Date(2026, 10, 11, 12, 0, 0);

  const at = (year: number, month: number, day: number, hour = 0) =>
    new Date(year, month, day, hour, 0, 0);

  it("classifies today, the last 7 days and older items", () => {
    expect(getNotificationDateGroupKey(at(2026, 10, 11, 9), now)).toBe("today");
    expect(getNotificationDateGroupKey(at(2026, 10, 10, 23), now)).toBe("week");
    expect(getNotificationDateGroupKey(at(2026, 10, 4, 0), now)).toBe("week");
    expect(getNotificationDateGroupKey(at(2026, 10, 3, 23), now)).toBe("older");
  });

  it("keeps received order and omits empty groups", () => {
    const items = [
      { id: "today-1", lastEventAt: at(2026, 10, 11, 9) },
      { id: "older-1", lastEventAt: at(2026, 9, 1) },
      { id: "week-1", lastEventAt: at(2026, 10, 9) },
      { id: "today-2", lastEventAt: at(2026, 10, 11, 8) },
    ];

    const groups = groupNotificationsByDate(items, now);

    expect(groups.map((group) => group.key)).toEqual([
      "today",
      "week",
      "older",
    ]);
    expect(groups[0].items.map((item) => item.id)).toEqual([
      "today-1",
      "today-2",
    ]);
    expect(groups[1].items.map((item) => item.id)).toEqual(["week-1"]);
    expect(groups[2].items.map((item) => item.id)).toEqual(["older-1"]);
  });

  it("returns only the non-empty groups", () => {
    const groups = groupNotificationsByDate(
      [{ id: "week-1", lastEventAt: at(2026, 10, 9) }],
      now,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("week");
  });

  it("returns no groups for an empty list", () => {
    expect(groupNotificationsByDate([], now)).toEqual([]);
  });
});
