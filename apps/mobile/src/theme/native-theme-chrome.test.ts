// @vitest-environment jsdom
import { Style } from "@capacitor/status-bar";
import { describe, expect, it, vi } from "vitest";
import {
  createNativeThemeChrome,
  statusBarStyleForCatalogStyle,
  type NativeThemeChromeDeps,
} from "./native-theme-chrome";

function createDeps(
  overrides: Partial<NativeThemeChromeDeps> = {},
): NativeThemeChromeDeps {
  return {
    isNativePlatform: vi.fn(() => true),
    getDeviceInfo: vi.fn(async () => ({
      platform: "android",
      osVersion: "14",
    })),
    enableEdgeToEdge: vi.fn(async () => {}),
    disableEdgeToEdge: vi.fn(async () => {}),
    setEdgeToEdgeBackground: vi.fn(async () => {}),
    setStatusBarStyle: vi.fn(async () => {}),
    saveSplashTheme: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("statusBarStyleForCatalogStyle", () => {
  it("maps light icons to Capacitor's dark style", () => {
    expect(statusBarStyleForCatalogStyle("light")).toBe(Style.Dark);
    expect(statusBarStyleForCatalogStyle("dark")).toBe(Style.Light);
  });
});

describe("createNativeThemeChrome", () => {
  it("enables edge-to-edge once and applies colors on start and on change", async () => {
    const deps = createDeps();
    const chrome = createNativeThemeChrome(deps);

    await chrome.apply("gamenode");

    expect(deps.enableEdgeToEdge).toHaveBeenCalledTimes(1);
    expect(deps.setEdgeToEdgeBackground).toHaveBeenLastCalledWith("#111111");
    expect(deps.setStatusBarStyle).toHaveBeenLastCalledWith(Style.Dark);

    await chrome.apply("xbox");

    expect(deps.enableEdgeToEdge).toHaveBeenCalledTimes(1);
    expect(deps.setEdgeToEdgeBackground).toHaveBeenLastCalledWith("#0F0F0F");
    expect(deps.setStatusBarStyle).toHaveBeenLastCalledWith(Style.Dark);
  });

  it("keeps the existing EdgeToEdge.disable branch on Android < 14", async () => {
    const deps = createDeps({
      getDeviceInfo: vi.fn(async () => ({
        platform: "android",
        osVersion: "13",
      })),
    });
    const chrome = createNativeThemeChrome(deps);

    await chrome.apply("xbox");

    expect(deps.disableEdgeToEdge).toHaveBeenCalledTimes(1);
    expect(deps.enableEdgeToEdge).not.toHaveBeenCalled();
    expect(deps.setEdgeToEdgeBackground).not.toHaveBeenCalled();
    expect(deps.setStatusBarStyle).toHaveBeenCalledWith(Style.Dark);
  });

  it("updates only the status bar outside Android", async () => {
    const ios = createDeps({
      getDeviceInfo: vi.fn(async () => ({ platform: "ios", osVersion: "18" })),
    });
    await createNativeThemeChrome(ios).apply("xbox");

    expect(ios.enableEdgeToEdge).not.toHaveBeenCalled();
    expect(ios.disableEdgeToEdge).not.toHaveBeenCalled();
    expect(ios.setEdgeToEdgeBackground).not.toHaveBeenCalled();
    expect(ios.setStatusBarStyle).toHaveBeenCalledWith(Style.Dark);

    const web = createDeps({ isNativePlatform: vi.fn(() => false) });
    await createNativeThemeChrome(web).apply("xbox");

    expect(web.getDeviceInfo).not.toHaveBeenCalled();
    expect(web.setStatusBarStyle).not.toHaveBeenCalled();
  });

  it("does not lose the last selection when plugins resolve out of order", async () => {
    let releaseFirst!: () => void;
    const firstBackground = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const setEdgeToEdgeBackground = vi
      .fn()
      .mockImplementationOnce(() => firstBackground)
      .mockResolvedValue(undefined);
    const deps = createDeps({ setEdgeToEdgeBackground });
    const chrome = createNativeThemeChrome(deps);

    const first = chrome.apply("gamenode");
    const second = chrome.apply("xbox");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(setEdgeToEdgeBackground).toHaveBeenCalledTimes(1);
    expect(setEdgeToEdgeBackground).toHaveBeenNthCalledWith(1, "#111111");

    releaseFirst();
    await Promise.all([first, second]);

    expect(setEdgeToEdgeBackground).toHaveBeenNthCalledWith(2, "#0F0F0F");
    expect(deps.setStatusBarStyle).toHaveBeenLastCalledWith(Style.Dark);
  });

  it("survives plugin rejections and still applies the status bar", async () => {
    const deps = createDeps({
      enableEdgeToEdge: vi.fn(async () => {
        throw new Error("unsupported");
      }),
      setEdgeToEdgeBackground: vi.fn(async () => {
        throw new Error("no window");
      }),
    });
    const chrome = createNativeThemeChrome(deps);

    await expect(chrome.apply("xbox")).resolves.toBeUndefined();
    expect(deps.setStatusBarStyle).toHaveBeenCalledWith(Style.Dark);
  });

  it("saves the rendered theme for the next launch's splash on Android", async () => {
    const deps = createDeps();
    const chrome = createNativeThemeChrome(deps);

    await chrome.apply("xbox");
    await chrome.apply("xbox");
    expect(deps.saveSplashTheme).toHaveBeenCalledTimes(1);
    expect(deps.saveSplashTheme).toHaveBeenLastCalledWith("xbox");

    await chrome.apply("gamenode");
    expect(deps.saveSplashTheme).toHaveBeenLastCalledWith("gamenode");

    const legacy = createDeps({
      getDeviceInfo: vi.fn(async () => ({
        platform: "android",
        osVersion: "12",
      })),
    });
    await createNativeThemeChrome(legacy).apply("xbox");
    expect(legacy.saveSplashTheme).toHaveBeenCalledWith("xbox");
  });

  it("does not save a splash theme outside Android", async () => {
    const ios = createDeps({
      getDeviceInfo: vi.fn(async () => ({ platform: "ios", osVersion: "18" })),
    });
    await createNativeThemeChrome(ios).apply("xbox");
    expect(ios.saveSplashTheme).not.toHaveBeenCalled();

    const web = createDeps({ isNativePlatform: vi.fn(() => false) });
    await createNativeThemeChrome(web).apply("xbox");
    expect(web.saveSplashTheme).not.toHaveBeenCalled();
  });

  it("retries the splash theme after a failed save", async () => {
    const saveSplashTheme = vi
      .fn()
      .mockRejectedValueOnce(new Error("disk full"))
      .mockResolvedValue(undefined);
    const deps = createDeps({ saveSplashTheme });
    const chrome = createNativeThemeChrome(deps);

    await expect(chrome.apply("xbox")).resolves.toBeUndefined();
    await chrome.apply("xbox");

    expect(saveSplashTheme).toHaveBeenCalledTimes(2);
  });

  it("survives an initialization failure", async () => {
    const deps = createDeps({
      getDeviceInfo: vi.fn(async () => {
        throw new Error("bridge unavailable");
      }),
    });
    const chrome = createNativeThemeChrome(deps);

    await expect(chrome.apply("xbox")).resolves.toBeUndefined();
    expect(deps.setEdgeToEdgeBackground).not.toHaveBeenCalled();
    expect(deps.setStatusBarStyle).toHaveBeenCalledWith(Style.Dark);
  });
});
