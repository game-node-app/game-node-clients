// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getThemeInitScript } from "../../../../apps/web/src/components/theme/themeInitScript";
import {
  GN_THEME_COOKIE,
  GN_THEME_STORAGE_KEY,
  parseCookieHeader,
  readRequestThemeId,
  readStoredThemeId,
  webThemeStorage,
} from "../../../../apps/web/src/components/theme/themeStorage";

function clearStorage() {
  document.cookie = `${GN_THEME_COOKIE}=; Max-Age=0; Path=/`;
  window.localStorage.removeItem(GN_THEME_STORAGE_KEY);
}

describe("web theme persistence", () => {
  beforeEach(clearStorage);

  it("parses cookie headers including encoded values", () => {
    expect(parseCookieHeader("a=1; gn-theme=xbox; b=hello%20world")).toEqual({
      a: "1",
      "gn-theme": "xbox",
      b: "hello world",
    });
    expect(parseCookieHeader(undefined)).toEqual({});
  });

  it("reads the request theme, falling back to gamenode", () => {
    expect(readRequestThemeId({ cookies: { [GN_THEME_COOKIE]: "xbox" } })).toBe(
      "xbox",
    );
    expect(
      readRequestThemeId({
        headers: { cookie: `${GN_THEME_COOKIE}=xbox` },
      }),
    ).toBe("xbox");
    expect(
      readRequestThemeId({ headers: { cookie: `${GN_THEME_COOKIE}=steam` } }),
    ).toBe("gamenode");
    expect(readRequestThemeId(undefined)).toBe("gamenode");
  });

  it("prefers the cookie, then the localStorage mirror", () => {
    window.localStorage.setItem(GN_THEME_STORAGE_KEY, "xbox");
    expect(readStoredThemeId()).toBe("xbox");
    expect(webThemeStorage.get()).toBe("xbox");

    document.cookie = `${GN_THEME_COOKIE}=gamenode; Path=/`;
    expect(readStoredThemeId()).toBe("gamenode");
    expect(webThemeStorage.get()).toBe("gamenode");
  });

  it("ignores invalid values instead of throwing", () => {
    document.cookie = `${GN_THEME_COOKIE}=playstation; Path=/`;
    window.localStorage.setItem(GN_THEME_STORAGE_KEY, "nintendo");
    expect(readStoredThemeId()).toBeNull();
    expect(webThemeStorage.get()).toBeNull();
  });

  it("writes the cookie and mirrors the resolved id", () => {
    webThemeStorage.set("xbox");

    expect(document.cookie).toContain(`${GN_THEME_COOKIE}=xbox`);
    expect(window.localStorage.getItem(GN_THEME_STORAGE_KEY)).toBe("xbox");
    expect(readStoredThemeId()).toBe("xbox");
  });
});

describe("web startup with a saved theme", () => {
  const root = document.documentElement;

  beforeEach(() => {
    clearStorage();
    root.dataset.theme = "gamenode";
    root.dataset.themeSsr = "gamenode";
  });

  afterEach(() => {
    delete root.dataset.theme;
    delete root.dataset.themeSsr;
    document.querySelector('meta[name="theme-color"]')?.remove();
  });

  it("applies the saved palette and browser tint before hydration", () => {
    const tint = document.createElement("meta");
    tint.name = "theme-color";
    document.head.append(tint);
    window.localStorage.setItem(GN_THEME_STORAGE_KEY, "xbox");

    new Function(getThemeInitScript())();

    expect(root.dataset.theme).toBe("xbox");
    expect(root.dataset.themeSsr).toBe("gamenode");
    expect(tint.content.toLowerCase()).toBe("#0f0f0f");
    expect(root.hasAttribute("data-theme-checking")).toBe(false);
    expect(root.hasAttribute("data-experience-pending")).toBe(false);
  });
});
