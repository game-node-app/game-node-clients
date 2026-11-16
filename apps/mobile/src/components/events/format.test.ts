import { describe, expect, it } from "vitest";
import {
  formatNumber,
  formatPercentage,
  formatPlaytimeHours,
  formatRating,
  formatRatingCompact,
  formatUtcDate,
  toDisplayRating,
  toPlaytimeHours,
} from "../../../../../packages/ui/src/components/events/util/format";

describe("formatPlaytimeHours", () => {
  it("rounds seconds to the nearest hour", () => {
    expect(toPlaytimeHours(309_600)).toBe(86);
    expect(toPlaytimeHours(3_599)).toBe(1);
    expect(toPlaytimeHours(3_540)).toBe(1);
    expect(toPlaytimeHours(3_539)).toBe(1);
    expect(toPlaytimeHours(1_800)).toBe(1);
    expect(toPlaytimeHours(1_799)).toBe(0);
  });

  it("formats hours with the locale grouping", () => {
    expect(formatPlaytimeHours(309_600, "pt-BR")).toBe("86");
    expect(formatPlaytimeHours(4_812 * 3_600, "pt-BR")).toBe("4.812");
    expect(formatPlaytimeHours(4_812 * 3_600, "en")).toBe("4,812");
  });

  it("returns null when there is no playtime value", () => {
    expect(toPlaytimeHours(null)).toBeNull();
    expect(toPlaytimeHours(undefined)).toBeNull();
    expect(formatPlaytimeHours(null, "pt-BR")).toBeNull();
  });
});

describe("formatRating", () => {
  it("converts the 0–5 scale to 0–10 with one decimal", () => {
    expect(formatRating(4.5, "pt-BR")).toBe("9,0");
    expect(formatRating(4.5, "en")).toBe("9.0");
    expect(formatRating(3.2, "pt-BR")).toBe("6,4");
    expect(formatRating(4.75, "pt-BR")).toBe("9,5");
    expect(toDisplayRating(4.5)).toBe(9);
  });

  it("drops the decimal on the ballot", () => {
    expect(formatRatingCompact(4.5, "pt-BR")).toBe("9");
    expect(formatRatingCompact(4.5, "en")).toBe("9");
    expect(formatRatingCompact(3.2, "pt-BR")).toBe("6");
  });

  it("keeps a zero rating and omits a missing one", () => {
    expect(formatRating(0, "pt-BR")).toBe("0,0");
    expect(formatRating(null, "pt-BR")).toBeNull();
    expect(formatRating(undefined, "en")).toBeNull();
    expect(formatRatingCompact(null, "pt-BR")).toBeNull();
  });
});

describe("formatNumber", () => {
  it("groups digits by locale", () => {
    expect(formatNumber(4_812, "pt-BR")).toBe("4.812");
    expect(formatNumber(4_812, "en")).toBe("4,812");
    expect(formatNumber(0, "pt-BR")).toBe("0");
  });

  it("returns null without a value", () => {
    expect(formatNumber(null, "pt-BR")).toBeNull();
    expect(formatNumber(undefined, "pt-BR")).toBeNull();
    expect(formatNumber(Number.NaN, "pt-BR")).toBeNull();
  });
});

describe("formatPercentage", () => {
  it("formats 0–1 fractions as percentages", () => {
    expect(formatPercentage(0.31, "pt-BR")).toBe("31%");
    expect(formatPercentage(0.21, "en")).toBe("21%");
    expect(formatPercentage(0.255, "pt-BR")).toBe("26%");
    expect(formatPercentage(0, "pt-BR")).toBe("0%");
  });

  it("returns null without a value", () => {
    expect(formatPercentage(null, "pt-BR")).toBeNull();
    expect(formatPercentage(undefined, "en")).toBeNull();
  });
});

describe("formatUtcDate", () => {
  it("keeps the UTC day of an instant that ends late in the day", () => {
    expect(
      formatUtcDate("2026-12-27T23:59:59Z", "pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    ).toBe("27/12/2026");
  });

  it("keeps the UTC day of an instant that starts at midnight", () => {
    // In UTC-3 this instant is still 2 Nov locally; the formatter must use UTC.
    expect(
      formatUtcDate("2026-11-03T00:00:00Z", "en", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    ).toBe("11/03/2026");
  });

  it("returns null without a valid date", () => {
    expect(formatUtcDate(null, "pt-BR")).toBeNull();
    expect(formatUtcDate(undefined, "pt-BR")).toBeNull();
    expect(formatUtcDate("not-a-date", "pt-BR")).toBeNull();
  });
});
