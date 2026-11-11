// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { getTabAwareHref } from "./getTabAwareHref";

describe("getTabAwareHref", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("prefixes with the current tab", () => {
    window.history.replaceState(null, "", "/library/game/1");
    expect(getTabAwareHref("/search")).toBe("/library/search");
  });

  it("falls back to the home tab outside a known tab", () => {
    window.history.replaceState(null, "", "/this-does-not-exist");
    expect(getTabAwareHref("/search")).toBe("/home/search");
    expect(getTabAwareHref("/")).toBe("/home/");
  });
});
