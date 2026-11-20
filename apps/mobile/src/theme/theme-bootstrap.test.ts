// @vitest-environment jsdom
import { Preferences } from "@capacitor/preferences";
import { afterEach, describe, expect, it, vi } from "vitest";
import { restoreThemeForBoot } from "./theme-bootstrap";
import { THEME_STORAGE_KEY } from "./theme-storage";

vi.mock("@capacitor/preferences", () => ({
  Preferences: { get: vi.fn(), set: vi.fn() },
}));

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  localStorage.clear();
});

describe("restoreThemeForBoot", () => {
  it("skips pack preload for the default theme", async () => {
    const preload = vi.fn(async () => {});

    await expect(
      restoreThemeForBoot({ restore: async () => "gamenode", preload }),
    ).resolves.toBe("gamenode");
    expect(preload).not.toHaveBeenCalled();
  });

  it("preloads the stored theme before returning it", async () => {
    const preload = vi.fn(async () => {});

    await expect(
      restoreThemeForBoot({ restore: async () => "xbox", preload }),
    ).resolves.toBe("xbox");
    expect(preload).toHaveBeenCalledWith("xbox");
  });

  it("preloads the mirrored theme when Preferences stalls", async () => {
    vi.useFakeTimers();
    vi.mocked(Preferences.get).mockReturnValue(new Promise(() => {}));
    localStorage.setItem(THEME_STORAGE_KEY, "xbox");
    const preload = vi.fn(async () => {});

    const boot = restoreThemeForBoot({ restoreTimeoutMs: 20, preload });
    await vi.advanceTimersByTimeAsync(20);

    await expect(boot).resolves.toBe("xbox");
    expect(preload).toHaveBeenCalledWith("xbox");
  });

  it("keeps the restored theme when pack preload stalls", async () => {
    vi.useFakeTimers();
    const boot = restoreThemeForBoot({
      restore: async () => "xbox",
      preload: () => new Promise<void>(() => {}),
      preloadTimeoutMs: 20,
    });

    await vi.advanceTimersByTimeAsync(20);
    await expect(boot).resolves.toBe("xbox");
  });

  it("keeps the restored theme when the import rejects", async () => {
    await expect(
      restoreThemeForBoot({
        restore: async () => "xbox",
        preload: async () => {
          throw new Error("offline");
        },
      }),
    ).resolves.toBe("xbox");
  });

  it("falls back to gamenode for invalid or failing restores", async () => {
    await expect(
      restoreThemeForBoot({ restore: async () => "removed-theme" }),
    ).resolves.toBe("gamenode");
    await expect(
      restoreThemeForBoot({
        restore: async () => {
          throw new Error("no plugin");
        },
      }),
    ).resolves.toBe("gamenode");
  });

  it("bounds a hanging restore", async () => {
    vi.useFakeTimers();
    const boot = restoreThemeForBoot({
      restore: () => new Promise<string>(() => {}),
      restoreTimeoutMs: 20,
    });

    await vi.advanceTimersByTimeAsync(20);
    await expect(boot).resolves.toBe("gamenode");
  });
});
