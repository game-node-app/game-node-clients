import { registerPlugin } from "@capacitor/core";

/**
 * Native file storage for the persisted React Query cache (Android `QueryCacheStoragePlugin`).
 * `name` is a plain file name; all work happens off the UI thread.
 */
export interface QueryCacheStoragePlugin {
  get(options: { name: string }): Promise<{ value: string | null }>;
  set(options: { name: string; value: string }): Promise<void>;
  remove(options: { name: string }): Promise<void>;
}

export const QueryCacheStorage =
  registerPlugin<QueryCacheStoragePlugin>("QueryCacheStorage");
