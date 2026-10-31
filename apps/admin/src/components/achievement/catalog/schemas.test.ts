import { tiersSchema, tierSchema } from "./schemas";

const tiers = (...thresholds: number[]) =>
  thresholds.map((threshold) => ({ threshold, expReward: 100 }));

describe("tiersSchema", () => {
  it("accepts increasing thresholds", () => {
    expect(tiersSchema.safeParse(tiers(1, 5, 25)).success).toBe(true);
  });

  it.each([
    ["equal thresholds", tiers(5, 5)],
    ["decreasing thresholds", tiers(10, 3)],
    ["no tiers", []],
    ["11 tiers", tiers(...Array.from({ length: 11 }, (_, i) => i + 1))],
  ])("rejects %s", (_, value) => {
    expect(tiersSchema.safeParse(value).success).toBe(false);
  });

  it("accepts 10 tiers and rejects XP above 5000", () => {
    expect(
      tiersSchema.safeParse(
        tiers(...Array.from({ length: 10 }, (_, i) => i + 1)),
      ).success,
    ).toBe(true);
    expect(
      tierSchema.safeParse({ threshold: 1, expReward: 5001 }).success,
    ).toBe(false);
    expect(
      tierSchema.safeParse({ threshold: 1, expReward: 5000 }).success,
    ).toBe(true);
  });
});
