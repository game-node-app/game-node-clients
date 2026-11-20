// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("web theme before hydration", () => {
  const root = document.documentElement;

  beforeEach(() => {
    clearStorage();
    root.dataset.theme = "gamenode";
    root.dataset.themeSsr = "gamenode";
  });

  afterEach(() => {
    vi.useRealTimers();
    delete root.dataset.theme;
    delete root.dataset.themeSsr;
    delete root.dataset.experiencePending;
    document.querySelector('meta[name="theme-color"]')?.remove();
  });

  it("updates the existing tint and removes the startup gate at its deadline", () => {
    vi.useFakeTimers();
    webThemeStorage.set("xbox");
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#111111";
    document.head.append(meta);

    new Function(getThemeInitScript())();

    expect(root.dataset.theme).toBe("xbox");
    expect(root.dataset.themeSsr).toBe("gamenode");
    expect(meta.content).toBe("#0F0F0F");
    expect(document.querySelectorAll('meta[name="theme-color"]')).toHaveLength(
      1,
    );
    expect(root.dataset.experiencePending).toBe("");

    root.dataset.theme = "gamenode";
    vi.advanceTimersByTime(300);
    expect(root.dataset.experiencePending).toBeUndefined();
  });
});
