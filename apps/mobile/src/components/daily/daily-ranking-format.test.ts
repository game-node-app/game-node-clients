import { describe, expect, it } from "vitest";
import {
  formatDailyCount,
  formatDailyPoints,
  formatDailyRemaining,
  toPositionChange,
} from "../../../../../packages/ui/src/components/daily/ranking/rankingFormat";

describe("formatDailyPoints", () => {
  it.each([
    ["en", 4, "4"],
    ["en", 2.4, "2.4"],
    ["en", 3812, "3,812"],
    ["pt-BR", 4, "4"],
    ["pt-BR", 2.4, "2,4"],
    ["pt-BR", 3812, "3.812"],
  ])("formats %s %s as %s", (language, value, expected) => {
    expect(formatDailyPoints(value, language)).toBe(expected);
    expect(formatDailyCount(value, language)).toBe(expected);
  });
});

describe("toPositionChange", () => {
  it("narrows every kind", () => {
    expect(toPositionChange(3)).toEqual({ kind: "up", amount: 3 });
    expect(toPositionChange(-2)).toEqual({ kind: "down", amount: 2 });
    expect(toPositionChange(0)).toEqual({ kind: "same" });
    expect(toPositionChange("new")).toEqual({ kind: "new" });
    expect(toPositionChange(null)).toEqual({ kind: "none" });
    expect(toPositionChange(undefined)).toEqual({ kind: "none" });
  });
});

describe("formatDailyRemaining", () => {
  const now = Date.parse("2026-11-17T12:00:00Z");
  const at = (ms: number) => new Date(now + ms).toISOString();
  const MIN = 60_000;

  it("shows days and hours", () => {
    expect(
      formatDailyRemaining(at((3 * 24 + 14) * 60 * MIN + 5 * MIN), now),
    ).toBe("3d 14h");
  });

  it("shows hours and minutes", () => {
    expect(formatDailyRemaining(at((14 * 60 + 32) * MIN + 10_000), now)).toBe(
      "14h 32m",
    );
  });

  it("shows minutes, never negative", () => {
    expect(formatDailyRemaining(at(32 * MIN), now)).toBe("32m");
    expect(formatDailyRemaining(at(-5 * MIN), now)).toBe("0m");
  });
});
