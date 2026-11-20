// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMobileThemeStorage,
  readMirroredTheme,
  restoreThemePreference,
  THEME_RESTORE_TIMEOUT_MS,
  THEME_STORAGE_KEY,
} from "./theme-storage";

const preferences = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock("@capacitor/preferences", () => ({
  Preferences: preferences,
}));

beforeEach(() => {
  localStorage.clear();
  preferences.get.mockReset();
  preferences.set.mockReset();
  preferences.get.mockResolvedValue({ value: null });
  preferences.set.mockResolvedValue(undefined);
});

describe("restoreThemePreference", () => {
  it("restores Preferences before the first render and mirrors it", async () => {
    preferences.get.mockResolvedValue({ value: "xbox" });

    await expect(restoreThemePreference()).resolves.toBe("xbox");

    expect(preferences.get).toHaveBeenCalledWith({ key: THEME_STORAGE_KEY });
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("xbox");
  });

  it("falls back to the localStorage mirror when Preferences rejects", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "xbox");
    preferences.get.mockRejectedValue(new Error("plugin unavailable"));

    await expect(restoreThemePreference()).resolves.toBe("xbox");
  });

  it("uses the mirror when Preferences times out", async () => {
    vi.useFakeTimers();
    localStorage.setItem(THEME_STORAGE_KEY, "xbox");
    preferences.get.mockReturnValue(new Promise(() => {}));

    const restored = restoreThemePreference();

    vi.advanceTimersByTime(THEME_RESTORE_TIMEOUT_MS);

    await expect(restored).resolves.toBe("xbox");
    vi.useRealTimers();
  });

  it("keeps the newest mirror when Preferences is stale", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "xbox");
    preferences.get.mockResolvedValue({ value: "gamenode" });

    await expect(restoreThemePreference()).resolves.toBe("xbox");

    // Catch-up write so the next start reads the same value from Preferences.
    expect(preferences.set).toHaveBeenCalledWith({
      key: THEME_STORAGE_KEY,
      value: "xbox",
    });
  });

  it("falls back to gamenode for an unknown stored id", async () => {
    preferences.get.mockResolvedValue({ value: "playstation" });

    await expect(restoreThemePreference()).resolves.toBe("gamenode");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("gamenode");
  });

  it("ignores an invalid mirror and uses a valid Preferences value", async () => {
    localStorage.setItem(THEME_STORAGE_KEY, "steam");
    preferences.get.mockResolvedValue({ value: "xbox" });

    await expect(restoreThemePreference()).resolves.toBe("xbox");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("xbox");
  });

  it("defaults to gamenode with no stored value", async () => {
    await expect(restoreThemePreference()).resolves.toBe("gamenode");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});

describe("createMobileThemeStorage", () => {
  it("mirrors writes synchronously and persists to Preferences", async () => {
    const storage = createMobileThemeStorage();

    await storage.set("xbox");

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("xbox");
    expect(preferences.set).toHaveBeenCalledWith({
      key: THEME_STORAGE_KEY,
      value: "xbox",
    });
  });

  it("normalizes an invalid selection to gamenode", async () => {
    const storage = createMobileThemeStorage();

    await storage.set("playstation");

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("gamenode");
    expect(preferences.set).toHaveBeenCalledWith({
      key: THEME_STORAGE_KEY,
      value: "gamenode",
    });
  });

  it("serializes Preferences writes during a rapid switch", async () => {
    let active = 0;
    let maxActive = 0;
    const written: string[] = [];

    preferences.set.mockImplementation(async ({ value }: { value: string }) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      written.push(value);
      active -= 1;
    });

    const storage = createMobileThemeStorage();

    void storage.set("xbox");
    void storage.set("gamenode");
    await storage.flush();

    expect(maxActive).toBe(1);
    expect(written).toEqual(["xbox", "gamenode"]);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("gamenode");
  });

  it("never rejects when the plugin write fails", async () => {
    preferences.set.mockRejectedValue(new Error("unavailable"));
    const storage = createMobileThemeStorage();

    await expect(storage.set("xbox")).resolves.toBeUndefined();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("xbox");
  });

  it("reads the mirror synchronously", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "xbox");
    expect(readMirroredTheme()).toBe("xbox");

    localStorage.setItem(THEME_STORAGE_KEY, "removed-theme");
    expect(readMirroredTheme()).toBeNull();
  });
});
