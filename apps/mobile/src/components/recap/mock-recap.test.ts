import { describe, expect, it } from "vitest";
import { buildMockRecap } from "../../../../../packages/ui/src/components/recap/hooks/mockRecap";

describe("buildMockRecap", () => {
  it("builds the 2026 Recap shape used by the page", () => {
    const recap = buildMockRecap("mock", 2026);

    expect(recap.year).toBe(2026);
    expect(recap.dailyPlaytimeSeconds).toHaveLength(365);
    expect(recap.calendar).not.toBeNull();
    expect(recap.calendar?.monthlyPlaytimeSeconds).toHaveLength(12);
    expect(recap.topGames.length).toBeGreaterThan(0);
    expect(recap.topGames[0]!.totalPlaytimeSeconds).toBeGreaterThanOrEqual(
      recap.topGames[1]?.totalPlaytimeSeconds ?? 0,
    );
    expect(recap.playtimeByPlatform.length).toBeGreaterThan(0);
    expect(recap.communityHighlights?.minority ?? null).not.toBeUndefined();
    expect(recap.backlogGrowth).toBeGreaterThanOrEqual(0);
    expect(recap.totalFinishedGames).toBeGreaterThanOrEqual(0);
  });

  it("uses 366 daily entries on a leap year", () => {
    expect(buildMockRecap("mock", 2028).dailyPlaytimeSeconds).toHaveLength(366);
  });
});
