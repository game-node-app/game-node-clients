import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import { getCalendarDays } from "../../../../packages/ui/src";

describe("release calendar grid", () => {
  it("covers the month in whole weeks starting on Sunday", () => {
    // November 2026 starts on a Sunday and ends on a Monday
    const days = getCalendarDays(dayjs("2026-11-01"));
    expect(days.length % 7).toBe(0);
    expect(days[0].format("YYYY-MM-DD")).toBe("2026-11-01");
    expect(days.at(-1)?.format("YYYY-MM-DD")).toBe("2026-12-05");
    expect(days.every((day) => day.day() === days.indexOf(day) % 7)).toBe(true);
  });
});
