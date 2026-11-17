import { describe, expect, it } from "vitest";
import { formatUtcDateRange } from "../../../../../packages/ui/src/components/events/util/format";

describe("formatUtcDateRange", () => {
  it("collapses a range inside one month", () => {
    expect(
      formatUtcDateRange(
        "2026-11-03T00:00:00.000Z",
        "2026-11-16T23:59:59.000Z",
        "en",
      ),
    ).toBe("Nov 3–16");
    expect(
      formatUtcDateRange(
        "2026-11-03T00:00:00.000Z",
        "2026-11-16T23:59:59.000Z",
        "pt-BR",
      ),
    ).toBe("3–16 de nov.");
  });

  it("writes both ends across months", () => {
    expect(
      formatUtcDateRange(
        "2026-11-28T00:00:00.000Z",
        "2026-12-05T23:59:59.000Z",
        "en",
      ),
    ).toBe("Nov 28 – Dec 5");
  });

  it("falls back to the single date or null", () => {
    expect(formatUtcDateRange(null, "2026-12-27T00:00:00.000Z", "en")).toBe(
      "Dec 27",
    );
    expect(formatUtcDateRange(null, null, "en")).toBeNull();
  });
});
