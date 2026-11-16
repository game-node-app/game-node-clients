import {
  buildRecapEditionRequest,
  recapEditionFormSchema,
} from "./schemas";

describe("recapEditionFormSchema", () => {
  it("accepts an opening inside the edition year", () => {
    expect(
      recapEditionFormSchema.safeParse({
        year: 2026,
        opensAt: new Date("2026-11-15T00:00:00.000Z"),
      }).success,
    ).toBe(true);
  });

  it("rejects an opening outside the edition year", () => {
    const result = recapEditionFormSchema.safeParse({
      year: 2026,
      opensAt: new Date("2025-11-15T00:00:00.000Z"),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Opening date must fall inside the edition year (UTC).",
      );
    }
  });

  it("rejects a missing opening", () => {
    const result = recapEditionFormSchema.safeParse({
      year: 2026,
      opensAt: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Opening date is required.",
      );
    }
  });
});

describe("buildRecapEditionRequest", () => {
  it("builds the PUT body with an ISO opening", () => {
    expect(
      buildRecapEditionRequest({
        year: 2026,
        opensAt: new Date("2026-11-15T00:00:00.000Z"),
      }),
    ).toEqual({
      year: 2026,
      body: { opensAt: "2026-11-15T00:00:00.000Z" },
    });
  });

  it("refuses to build a request without an opening", () => {
    expect(() =>
      buildRecapEditionRequest({ year: 2026, opensAt: null }),
    ).toThrow("Opening date is required.");
  });
});
