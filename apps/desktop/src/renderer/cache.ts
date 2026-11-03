export const CACHE_PREFIX = "gamenode-library:";
export function accountStorage(storage: Storage, userId: string) {
  return {
    getItem: (key: string) => storage.getItem(key),
    removeItem: (key: string) => storage.removeItem(key),
    setItem(key: string, value: string) {
      // A throttled persistence write may finish after sign-out has removed the cache.
      try {
        if (
          JSON.parse(storage.getItem("gamenode-identity") || "null")?.userId ===
          userId
        )
          storage.setItem(key, value);
      } catch {
        /* Invalid identity must not permit a cache write. */
      }
    },
  };
}
