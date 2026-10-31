import { describe, expect, it } from "vitest";
import { getAppUrlTarget } from "./getAppUrlTarget";

describe("getAppUrlTarget", () => {
  it("routes a native sign-in error to the auth screen", () => {
    expect(getAppUrlTarget("app.gamenode://m/auth?error=banned")).toBe(
      "/m/auth?error=banned",
    );
  });

  it("ignores URLs that carry the session cookie", () => {
    expect(getAppUrlTarget("app.gamenode://home?cookie=abc")).toBeNull();
  });

  it("ignores scheme URLs without an error", () => {
    expect(getAppUrlTarget("app.gamenode://home")).toBeNull();
  });

  it("leaves https app links unchanged", () => {
    expect(getAppUrlTarget("https://gamenode.app/game/12?x=1#top")).toBe(
      "/game/12?x=1#top",
    );
  });
});
