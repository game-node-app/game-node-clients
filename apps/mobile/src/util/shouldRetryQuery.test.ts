import { describe, expect, it } from "vitest";
import { shouldRetryQuery } from "./shouldRetryQuery";

describe("shouldRetryQuery", () => {
  it("never retries auth errors", () => {
    expect(shouldRetryQuery(0, { status: 401 })).toBe(false);
    expect(shouldRetryQuery(0, { status: 403 })).toBe(false);
  });

  it("retries other errors up to three times", () => {
    expect(shouldRetryQuery(0, { status: 500 })).toBe(true);
    expect(shouldRetryQuery(2, new Error("network"))).toBe(true);
    expect(shouldRetryQuery(3, { status: 500 })).toBe(false);
    expect(shouldRetryQuery(0, null)).toBe(true);
  });
});
