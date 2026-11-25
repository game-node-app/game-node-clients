import type {
  AsyncStorage,
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import { Preferences } from "@capacitor/preferences";
import { QueryCacheStorage } from "@/plugins/queryCacheStorage";
import { whenSplashDone } from "@/components/general/splash/appReady";

const toName = (key: string) => `${encodeURIComponent(key)}.json`;

/**
 * Persister storage for the React Query cache, kept in a file by a native plugin.
 *
 * It used to live in `@capacitor/preferences`, i.e. an Android SharedPreferences XML file. Android
 * parses that whole file before the app's first frame and rewrites all of it on every save, and
 * the cache grows to megabytes: a 2.4 MB cache held each launch for ~800 ms. A value left there by
 * an older version is moved over on its first read. `@capacitor/filesystem` is not used either: it
 * encodes its replies on the UI thread, which froze the entry splash while the cache loaded.
 */
export function createCapacitorAsyncStorage(): AsyncStorage<string> {
  const setItem = async (key: string, value: string) => {
    await QueryCacheStorage.set({ name: toName(key), value });
  };

  return {
    async getItem(key: string) {
      const { value: stored } = await QueryCacheStorage.get({
        name: toName(key),
      });
      if (stored !== null) return stored;

      const { value } = await Preferences.get({ key });
      if (value !== null) {
        await setItem(key, value);
        await Preferences.remove({ key });
      }
      return value;
    },

    async removeItem(key: string) {
      await QueryCacheStorage.remove({ name: toName(key) });
    },

    setItem,
  };
}

/**
 * Delays writes until the entry splash is gone. The first save (the cache refreshed at launch, often
 * megabytes) would otherwise land during the splash's reveal: Capacitor decodes plugin calls on the
 * UI thread, which froze the animation for a few hundred milliseconds.
 */
export function holdWritesUntilSplashDone(
  storage: AsyncStorage<string>,
): AsyncStorage<string> {
  return {
    ...storage,
    async setItem(key, value) {
      await whenSplashDone();
      await storage.setItem(key, value);
    },
  };
}

interface DeferredPersisterOptions {
  /** Storage key of the cache. */
  key?: string;
  /** Write once the cache has been quiet this long. */
  quietMs?: number;
  /** Never hold a snapshot longer than this while the cache keeps changing. */
  maxWaitMs?: number;
}

/**
 * React Query persister that serializes and writes only the latest snapshot, once the cache
 * settles or the app goes to the background, instead of on every throttle tick.
 *
 * Every navigation updates a handful of queries. With `createAsyncStoragePersister`'s 1 s throttle
 * the whole cache (often megabytes) was `JSON.stringify`'d on the JS thread and handed to a native
 * plugin, which decodes it on the UI thread, while the page transition was still running.
 *
 * React Query never mutates query data in place, so a snapshot can be serialized later. If the app
 * is killed before a write, only the last few seconds of cache are lost.
 */
export function createDeferredPersister(
  storage: AsyncStorage<string>,
  {
    key = "REACT_QUERY_OFFLINE_CACHE",
    quietMs = 4000,
    maxWaitMs = 30000,
  }: DeferredPersisterOptions = {},
): Persister & { flush: () => Promise<void> } {
  let pending: PersistedClient | undefined;
  let quietTimer: ReturnType<typeof setTimeout> | undefined;
  let maxWaitTimer: ReturnType<typeof setTimeout> | undefined;
  let writing: Promise<void> = Promise.resolve();

  const clearTimers = () => {
    clearTimeout(quietTimer);
    clearTimeout(maxWaitTimer);
    quietTimer = undefined;
    maxWaitTimer = undefined;
  };

  const flush = () => {
    clearTimers();
    const snapshot = pending;
    pending = undefined;
    if (snapshot) {
      writing = writing
        .then(() => storage.setItem(key, JSON.stringify(snapshot)))
        .then(
          () => undefined,
          (error) => console.error(error),
        );
    }
    return writing;
  };

  const flushWhenIdle = () => {
    clearTimers();
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => void flush(), { timeout: 2000 });
    } else {
      void flush();
    }
  };

  if (typeof document !== "undefined") {
    // Android pauses the WebView in the background and may kill it afterwards.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") void flush();
    });
  }

  return {
    persistClient(client) {
      pending = client;
      clearTimeout(quietTimer);
      quietTimer = setTimeout(flushWhenIdle, quietMs);
      maxWaitTimer ??= setTimeout(flushWhenIdle, maxWaitMs);
    },
    async restoreClient() {
      await writing;
      const stored = await storage.getItem(key);
      return stored ? (JSON.parse(stored) as PersistedClient) : undefined;
    },
    async removeClient() {
      clearTimers();
      pending = undefined;
      await writing;
      await storage.removeItem(key);
    },
    flush,
  };
}
