import { AsyncStorage } from "@tanstack/react-query-persist-client";
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
