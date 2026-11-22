// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_RUINS_PREFERENCES,
  getLocalDateString,
  readLastBootDate,
  readRuinsPreferences,
  RUINS_BOOT_LAST_STORAGE_KEY,
  RUINS_PREFERENCES_STORAGE_KEY,
  useRuinsPreferences,
  writeLastBootDate,
} from "../../../../packages/ui/src/theme/ruins/preferences";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("readRuinsPreferences", () => {
  it("returns the defaults when nothing or garbage is stored", () => {
    expect(readRuinsPreferences()).toEqual({
      bootAnimation: "daily",
      paperTexture: true,
      scanline: false,
    });

    localStorage.setItem(RUINS_PREFERENCES_STORAGE_KEY, "{not json");
    expect(readRuinsPreferences()).toEqual(DEFAULT_RUINS_PREFERENCES);

    localStorage.setItem(RUINS_PREFERENCES_STORAGE_KEY, "42");
    expect(readRuinsPreferences()).toEqual(DEFAULT_RUINS_PREFERENCES);
  });

  it("keeps valid fields and defaults the invalid ones", () => {
    localStorage.setItem(
      RUINS_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        bootAnimation: "never",
        paperTexture: "yes",
        scanline: true,
      }),
    );
    expect(readRuinsPreferences()).toEqual({
      bootAnimation: "never",
      paperTexture: true,
      scanline: true,
    });
  });

  it("falls back to the defaults when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(readRuinsPreferences()).toEqual(DEFAULT_RUINS_PREFERENCES);
    expect(readLastBootDate()).toBeNull();
  });
});

describe("useRuinsPreferences", () => {
  it("persists changes and updates live", () => {
    const { result } = renderHook(() => useRuinsPreferences());
    expect(result.current.bootAnimation).toBe("daily");

    act(() => result.current.setBootAnimation("always"));
    act(() => result.current.setPaperTexture(false));
    act(() => result.current.setScanline(true));

    expect(result.current).toMatchObject({
      bootAnimation: "always",
      paperTexture: false,
      scanline: true,
    });
    expect(
      JSON.parse(localStorage.getItem(RUINS_PREFERENCES_STORAGE_KEY)!),
    ).toEqual({ bootAnimation: "always", paperTexture: false, scanline: true });
  });

  it("shares updates between mounted hooks", () => {
    const a = renderHook(() => useRuinsPreferences());
    const b = renderHook(() => useRuinsPreferences());

    act(() => a.result.current.setScanline(true));
    expect(b.result.current.scanline).toBe(true);
  });

  it("follows storage events from other tabs", () => {
    const { result } = renderHook(() => useRuinsPreferences());

    act(() => {
      localStorage.setItem(
        RUINS_PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          bootAnimation: "never",
          paperTexture: true,
          scanline: false,
        }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: RUINS_PREFERENCES_STORAGE_KEY }),
      );
    });
    expect(result.current.bootAnimation).toBe("never");
  });

  it("still applies a change when storage cannot be written", () => {
    const { result } = renderHook(() => useRuinsPreferences());
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    act(() => result.current.setScanline(true));
    expect(result.current.scanline).toBe(true);
  });
});

describe("boot date", () => {
  it("formats the local calendar day", () => {
    expect(getLocalDateString(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("round-trips and rejects malformed values", () => {
    expect(readLastBootDate()).toBeNull();
    writeLastBootDate("2026-11-21");
    expect(readLastBootDate()).toBe("2026-11-21");

    localStorage.setItem(RUINS_BOOT_LAST_STORAGE_KEY, "yesterday");
    expect(readLastBootDate()).toBeNull();

    writeLastBootDate();
    expect(readLastBootDate()).toBe(getLocalDateString());
  });
});
