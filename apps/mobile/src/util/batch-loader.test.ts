import { ApiError } from "@repo/wrapper/server";
import { describe, expect, it, vi } from "vitest";
import { createBatchLoader } from "../../../../packages/ui/src/util/createBatchLoader";
import { retryTransientErrors } from "../../../../packages/ui/src/util/createErrorNotification";

type Item = { id: number; params?: string };

const apiError = (status: number) =>
  new ApiError(
    { method: "GET", url: "/x" },
    { url: "/x", ok: false, status, statusText: "", body: null },
    `status ${status}`,
  );

function setup(fetchMany = vi.fn()) {
  const fetchOne = vi.fn(async (id: number, params: string) => ({
    id,
    params,
  }));
  const load = createBatchLoader<number, Item, string>({
    fetchMany,
    fetchOne,
    getId: (item) => item.id,
    maxBatchSize: 3,
  });
  return { load, fetchMany, fetchOne };
}

describe("createBatchLoader", () => {
  it("merges reads from the same tick per params and keeps a lone read single", async () => {
    const { load, fetchMany, fetchOne } = setup(
      vi.fn(async (ids: number[], params: string) =>
        [...ids].reverse().map((id) => ({ id, params })),
      ),
    );

    const results = await Promise.all([
      load(1, "a"),
      load(2, "a"),
      load(1, "a"),
      load(3, "b"),
    ]);

    expect(results).toEqual([
      { id: 1, params: "a" },
      { id: 2, params: "a" },
      { id: 1, params: "a" },
      { id: 3, params: "b" },
    ]);
    expect(fetchMany).toHaveBeenCalledTimes(1);
    expect(fetchMany).toHaveBeenCalledWith([1, 2], "a");
    expect(fetchOne).toHaveBeenCalledTimes(1);
    expect(fetchOne).toHaveBeenCalledWith(3, "b");
  });

  it("splits large batches", async () => {
    const { load, fetchMany } = setup(
      vi.fn(async (ids: number[]) => ids.map((id) => ({ id }))),
    );
    await Promise.all([1, 2, 3, 4, 5].map((id) => load(id, "a")));
    expect(fetchMany.mock.calls.map(([ids]) => ids)).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it("reads missing items one by one, so they keep the single read's errors", async () => {
    const { load, fetchOne } = setup(vi.fn(async () => [{ id: 1 }]));
    fetchOne.mockRejectedValueOnce(apiError(404));

    const [found, missing] = await Promise.allSettled([
      load(1, "a"),
      load(2, "a"),
    ]);

    expect(found).toEqual({ status: "fulfilled", value: { id: 1 } });
    expect(missing).toMatchObject({
      status: "rejected",
      reason: { status: 404 },
    });
    expect(fetchOne).toHaveBeenCalledWith(2, "a");
  });

  it("resolves ids the batch left out through resolveMissing when given", async () => {
    const fetchOne = vi.fn();
    const load = createBatchLoader<number, Item | null, string>({
      fetchMany: async () => [{ id: 1 }],
      fetchOne,
      resolveMissing: () => null,
      getId: (item) => item!.id,
    });
    await expect(Promise.all([load(1, "a"), load(2, "a")])).resolves.toEqual([
      { id: 1 },
      null,
    ]);
    expect(fetchOne).not.toHaveBeenCalled();
  });

  it("falls back to single reads when the batch answers 400/404, but not on other errors", async () => {
    const notFound = setup(vi.fn().mockRejectedValue(apiError(404)));
    await Promise.all([notFound.load(1, "a"), notFound.load(2, "a")]);
    expect(notFound.fetchOne).toHaveBeenCalledTimes(2);

    // One invalid id fails the whole batch's validation: only it should fail.
    const invalid = setup(vi.fn().mockRejectedValue(apiError(400)));
    invalid.fetchOne.mockRejectedValueOnce(apiError(400));
    const mixed = await Promise.allSettled([
      invalid.load(1, "a"),
      invalid.load(2, "a"),
    ]);
    expect(mixed.map((result) => result.status)).toEqual([
      "rejected",
      "fulfilled",
    ]);

    // Auth errors would fail every single read too: no per-id fan-out.
    const signedOut = setup(vi.fn().mockRejectedValue(apiError(401)));
    const unauthorized = await Promise.allSettled([
      signedOut.load(1, "a"),
      signedOut.load(2, "a"),
    ]);
    expect(unauthorized.map((result) => result.status)).toEqual([
      "rejected",
      "rejected",
    ]);
    expect(signedOut.fetchOne).not.toHaveBeenCalled();

    const failing = setup(vi.fn().mockRejectedValue(apiError(500)));
    const results = await Promise.allSettled([
      failing.load(1, "a"),
      failing.load(2, "a"),
    ]);
    expect(results.map((result) => result.status)).toEqual([
      "rejected",
      "rejected",
    ]);
    expect(failing.fetchOne).not.toHaveBeenCalled();
  });
});

describe("retryTransientErrors", () => {
  const retry = retryTransientErrors(2);

  it("never retries a 4xx answer except timeouts and rate limits", () => {
    for (const status of [400, 401, 403, 404]) {
      expect(retry(0, apiError(status))).toBe(false);
    }
    expect(retry(0, apiError(408))).toBe(true);
    expect(retry(0, apiError(429))).toBe(true);
  });

  it("retries network errors and 5xx up to the budget", () => {
    expect(retry(0, new TypeError("Failed to fetch"))).toBe(true);
    expect(retry(1, apiError(503))).toBe(true);
    expect(retry(2, apiError(503))).toBe(false);
  });
});
