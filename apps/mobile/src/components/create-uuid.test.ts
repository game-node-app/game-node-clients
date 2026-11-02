import { afterEach, describe, expect, it, vi } from "vitest";
import { createUuid } from "../../../../packages/ui/src/util/createUuid";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("createUuid", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to getRandomValues outside secure contexts", () => {
    vi.stubGlobal("crypto", {
      getRandomValues: crypto.getRandomValues.bind(crypto),
    });
    const first = createUuid();
    expect(first).toMatch(UUID_V4);
    expect(createUuid()).not.toBe(first);
  });

  it("uses randomUUID when available", () => {
    expect(createUuid()).toMatch(UUID_V4);
  });
});
