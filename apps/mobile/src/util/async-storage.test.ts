import { beforeEach, describe, expect, it, vi } from "vitest";

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

const { createCapacitorAsyncStorage, holdWritesUntilSplashDone } = await import(
  "./asyncStorage"
);
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
