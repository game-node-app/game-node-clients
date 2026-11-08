// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAppUrlTarget } from "./getAppUrlTarget";
import { getEquivalentDeepLink } from "./getEquivalentDeepLink";

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

describe("supporter settings links", () => {
  it.each([
    "https://gamenode.app/home?settings=premium",
    "https://gamenode.app/en/home?settings=premium",
    "https://gamenode.app/pt-BR/home?settings=premium",
  ])("maps %s to the real Preferences Supporter route", (url) => {
    expect(getAppUrlTarget(url)).toBe("/home/preferences/supporter");
  });

  it("keeps checkout/interval and drops settings/section", () => {
    expect(
      getAppUrlTarget(
        "https://gamenode.app/pt-BR/home?settings=premium&section=billing&checkout=success&interval=yearly&from=stripe",
      ),
    ).toBe(
      "/home/preferences/supporter?checkout=success&interval=yearly&from=stripe",
    );
  });

  it.each([
    "https://gamenode.app/home",
    "https://gamenode.app/home?checkout=success",
    "https://gamenode.app/home?settings=privacy",
  ])("leaves %s without settings=premium unchanged", (url) => {
    const { pathname, search } = new URL(url);

    expect(getAppUrlTarget(url)).toBe(`${pathname}${search}`);
  });

  it("strips the website locale from an unrelated path", () => {
    expect(
      getAppUrlTarget(
        "https://gamenode.app/pt-BR/library/collection/8?page=2#top",
      ),
    ).toBe("/library/collection/8?page=2#top");
  });

  it("keeps an unprefixed unrelated path unchanged", () => {
    expect(
      getAppUrlTarget("https://gamenode.app/library/collection/8?page=2#top"),
    ).toBe("/library/collection/8?page=2#top");
  });
});

describe("supporter settings navigation", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/profile");
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it.each([
    [
      "https://gamenode.app/home?settings=premium&checkout=success",
      "/home/preferences/supporter?checkout=success",
      "/profile/preferences/supporter?checkout=success",
    ],
    [
      "https://gamenode.app/en/home?settings=premium&interval=yearly",
      "/home/preferences/supporter?interval=yearly",
      "/profile/preferences/supporter?interval=yearly",
    ],
    [
      "https://gamenode.app/pt-BR/home?settings=premium&checkout=cancel",
      "/home/preferences/supporter?checkout=cancel",
      "/profile/preferences/supporter?checkout=cancel",
    ],
  ])(
    "maps %s to a tab-prefixed route and opens it in the current tab",
    (url, target, currentTabTarget) => {
      const slug = getAppUrlTarget(url);

      expect(slug).toBe(target);
      expect(getEquivalentDeepLink(slug!)).toBe(currentTabTarget);
    },
  );

  it("leaves a tab-relative deep link nested under the current tab", () => {
    expect(getEquivalentDeepLink("/connections/callback/xbox?code=1")).toBe(
      "/profile/connections/callback/xbox?code=1",
    );
  });
});

describe("OAuth app links", () => {
  it.each([
    "https://gamenode.app/auth?client_id=client&sig=signed&resource=a&resource=b&ba_param=resource&ba_param=state",
    "https://gamenode.app/oauth/consent?sig=signed",
    "https://gamenode.app/pt-BR/oauth/consent?sig=signed",
  ])("never maps canonical authorization into a tab: %s", (url) => {
    expect(getAppUrlTarget(url)).toBeNull();
  });
  it("keeps ordinary sign-in routing", () => {
    expect(getAppUrlTarget("https://gamenode.app/auth")).toBe("/auth");
  });
});
