import {
  EMPTY_THEME_PACK,
  getThemePackKey,
  normalizeThemePack,
  type ThemePack,
  type ThemePackKind,
  type ThemePackLoader,
} from "./types";

export type ThemePackLoaders = {
  experience?: Partial<Record<string, ThemePackLoader>>;
  screens?: Partial<Record<string, ThemePackLoader>>;
};

type ThemePackEntry = {
  /** Stable promise so preloads and Suspense gates share one import. */
  promise: Promise<ThemePack>;
  pack?: ThemePack;
  error?: unknown;
};

export interface ThemePackStore {
  /** Starts (or reuses) the import for one pack. Never rejects. */
  load(kind: ThemePackKind, id: string | null | undefined): Promise<ThemePack>;
  /** Resolved pack, or `undefined` while it is still loading. */
  peek(
    kind: ThemePackKind,
    id: string | null | undefined,
  ): ThemePack | undefined;
  isLoaded(kind: ThemePackKind, id: string | null | undefined): boolean;
  /** Import error cached with the fallback pack, or `null`. */
  getError(kind: ThemePackKind, id: string | null | undefined): unknown | null;
  subscribe(listener: () => void): () => void;
  getVersion(): number;
}

const RESOLVED_EMPTY = Promise.resolve(EMPTY_THEME_PACK);

function normalizeId(id: string | null | undefined): string | null {
  const trimmed = id?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Creates an isolated pack store. The app uses one global store so an early
 * `preloadThemePack()` call and the provider share the same import; tests pass
 * a store with fake loaders to exercise packs without registering a theme.
 */
export function createThemePackStore(
  loaders: ThemePackLoaders = {},
): ThemePackStore {
  const entries = new Map<string, ThemePackEntry>();
  const listeners = new Set<() => void>();
  let version = 0;

  const notify = () => {
    version += 1;
    for (const listener of [...listeners]) listener();
  };

  const loaderFor = (
    kind: ThemePackKind,
    id: string,
  ): ThemePackLoader | undefined =>
    kind === "experience" ? loaders.experience?.[id] : loaders.screens?.[id];

  const emptyEntry = (key: string): ThemePackEntry => {
    const existing = entries.get(key);
    if (existing) return existing;

    const entry: ThemePackEntry = {
      promise: RESOLVED_EMPTY,
      pack: EMPTY_THEME_PACK,
    };
    entries.set(key, entry);
    return entry;
  };

  const load = (
    kind: ThemePackKind,
    id: string | null | undefined,
  ): Promise<ThemePack> => {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return RESOLVED_EMPTY;

    const key = getThemePackKey(kind, normalizedId);
    const existing = entries.get(key);
    if (existing) return existing.promise;

    const loader = loaderFor(kind, normalizedId);
    if (!loader) return emptyEntry(key).promise;

    const entry: ThemePackEntry = {
      promise: RESOLVED_EMPTY,
    };

    let loaded: Promise<unknown>;
    try {
      loaded = Promise.resolve(loader());
    } catch (error) {
      loaded = Promise.reject(error);
    }

    entry.promise = loaded
      .then(normalizeThemePack)
      .catch((error: unknown) => {
        entry.error = error;
        return EMPTY_THEME_PACK;
      })
      .then((pack) => {
        entry.pack = pack;
        notify();
        return pack;
      });

    entries.set(key, entry);
    return entry.promise;
  };

  const peek = (kind: ThemePackKind, id: string | null | undefined) => {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return EMPTY_THEME_PACK;

    const key = getThemePackKey(kind, normalizedId);
    const entry = entries.get(key);
    if (entry) return entry.pack;

    // A pack without a registered loader (default experience, a theme without
    // screens, or a typo) resolves to an empty pack synchronously, so callers
    // never suspend waiting for an import that does not exist.
    if (loaderFor(kind, normalizedId)) return undefined;
    return emptyEntry(key).pack;
  };

  const isLoaded = (kind: ThemePackKind, id: string | null | undefined) =>
    peek(kind, id) !== undefined;

  const getError = (kind: ThemePackKind, id: string | null | undefined) => {
    const normalizedId = normalizeId(id);
    if (!normalizedId) return null;
    return entries.get(getThemePackKey(kind, normalizedId))?.error ?? null;
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    load,
    peek,
    isLoaded,
    getError,
    subscribe,
    getVersion: () => version,
  };
}
