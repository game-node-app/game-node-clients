// @vitest-environment jsdom
import type { PersistedClient } from "@tanstack/react-query-persist-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const files = new Map<string, string>();
const prefs = new Map<string, string>();

vi.mock("@/plugins/queryCacheStorage", () => ({
  QueryCacheStorage: {
    get: vi.fn(async ({ name }: { name: string }) => ({
      value: files.get(name) ?? null,
    })),
    set: vi.fn(async ({ name, value }: { name: string; value: string }) => {
      files.set(name, value);
    }),
    remove: vi.fn(async ({ name }: { name: string }) => {
      files.delete(name);
    }),
  },
}));

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: vi.fn(async ({ key }: { key: string }) => ({
      value: prefs.get(key) ?? null,
    })),
    remove: vi.fn(async ({ key }: { key: string }) => {
      prefs.delete(key);
    }),
  },
}));

const {
  createCapacitorAsyncStorage,
  createDeferredPersister,
  holdWritesUntilSplashDone,
} = await import("./asyncStorage");
const { markSplashDone } = await import("@/components/general/splash/appReady");

describe("createCapacitorAsyncStorage", () => {
  beforeEach(() => {
    files.clear();
    prefs.clear();
  });

  it("stores the cache in a file, not in Preferences", async () => {
    const storage = createCapacitorAsyncStorage();
    await storage.setItem("CACHE", "value");

    expect(await storage.getItem("CACHE")).toBe("value");
    expect([...files.keys()]).toEqual(["CACHE.json"]);
    expect(prefs.size).toBe(0);

    await storage.removeItem("CACHE");
    expect(await storage.getItem("CACHE")).toBeNull();
  });

  it("moves a cache left in Preferences by an older version into the file", async () => {
    prefs.set("CACHE", "legacy");
    const storage = createCapacitorAsyncStorage();

    expect(await storage.getItem("CACHE")).toBe("legacy");
    expect(prefs.has("CACHE")).toBe(false);
    expect(files.get("CACHE.json")).toBe("legacy");
  });

  it("returns null when nothing was stored", async () => {
    const storage = createCapacitorAsyncStorage();
    expect(await storage.getItem("CACHE")).toBeNull();
    await expect(storage.removeItem("CACHE")).resolves.toBeUndefined();
  });

  it("holds writes until the entry splash is done", async () => {
    const storage = holdWritesUntilSplashDone(createCapacitorAsyncStorage());
    const write = storage.setItem("CACHE", "value");

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(files.size).toBe(0);

    markSplashDone();
    await write;
    expect(files.get("CACHE.json")).toBe("value");
  });
});

describe("createDeferredPersister", () => {
  const snapshot = (timestamp: number): PersistedClient => ({
    buster: "",
    timestamp,
    clientState: { queries: [], mutations: [] },
  });

  beforeEach(() => {
    files.clear();
    prefs.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes only the latest snapshot once the cache is quiet", async () => {
    const storage = createCapacitorAsyncStorage();
    const setItem = vi.spyOn(storage, "setItem");
    const persister = createDeferredPersister(storage, {
      key: "CACHE",
      quietMs: 1000,
    });

    persister.persistClient(snapshot(1));
    await vi.advanceTimersByTimeAsync(500);
    persister.persistClient(snapshot(2));
    await vi.advanceTimersByTimeAsync(500);
    expect(setItem).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(600);
    await persister.flush();

    expect(setItem).toHaveBeenCalledTimes(1);
    expect(await persister.restoreClient()).toEqual(snapshot(2));
  });

  it("writes a busy cache after the max wait", async () => {
    const storage = createCapacitorAsyncStorage();
    const setItem = vi.spyOn(storage, "setItem");
    const persister = createDeferredPersister(storage, {
      key: "CACHE",
      quietMs: 1000,
      maxWaitMs: 3000,
    });

    for (let i = 0; i < 8; i++) {
      persister.persistClient(snapshot(i));
      await vi.advanceTimersByTimeAsync(500);
    }

    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it("flushes when the app goes to the background", async () => {
    const storage = createCapacitorAsyncStorage();
    const persister = createDeferredPersister(storage, { key: "CACHE" });

    persister.persistClient(snapshot(7));
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    await vi.advanceTimersByTimeAsync(0);

    expect(JSON.parse(files.get("CACHE.json")!)).toEqual(snapshot(7));
  });

  it("drops a pending snapshot when the cache is removed", async () => {
    const storage = createCapacitorAsyncStorage();
    const persister = createDeferredPersister(storage, { key: "CACHE" });

    persister.persistClient(snapshot(1));
    await persister.removeClient();
    await vi.runAllTimersAsync();

    expect(files.has("CACHE.json")).toBe(false);
  });
});
