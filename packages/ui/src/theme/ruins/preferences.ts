import { useCallback, useSyncExternalStore } from "react";

export type RuinsBootAnimation = "always" | "daily" | "never";

export type RuinsPreferencesValue = {
  bootAnimation: RuinsBootAnimation;
  paperTexture: boolean;
  scanline: boolean;
};

export const RUINS_PREFERENCES_STORAGE_KEY = "gn-ruins-prefs";
export const RUINS_BOOT_LAST_STORAGE_KEY = "gn-ruins-boot-last";

export const DEFAULT_RUINS_PREFERENCES: RuinsPreferencesValue = Object.freeze({
  bootAnimation: "daily",
  paperTexture: true,
  scanline: false,
});

const BOOT_ANIMATIONS: readonly RuinsBootAnimation[] = [
  "always",
  "daily",
  "never",
];

function getStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Merges untrusted JSON over the defaults, keeping only valid fields. */
function parsePreferences(raw: string | null): RuinsPreferencesValue {
  if (!raw) return DEFAULT_RUINS_PREFERENCES;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_RUINS_PREFERENCES;

    const value = parsed as Partial<
      Record<keyof RuinsPreferencesValue, unknown>
    >;
    return {
      bootAnimation: BOOT_ANIMATIONS.includes(
        value.bootAnimation as RuinsBootAnimation,
      )
        ? (value.bootAnimation as RuinsBootAnimation)
        : DEFAULT_RUINS_PREFERENCES.bootAnimation,
      paperTexture:
        typeof value.paperTexture === "boolean"
          ? value.paperTexture
          : DEFAULT_RUINS_PREFERENCES.paperTexture,
      scanline:
        typeof value.scanline === "boolean"
          ? value.scanline
          : DEFAULT_RUINS_PREFERENCES.scanline,
    };
  } catch {
    return DEFAULT_RUINS_PREFERENCES;
  }
}

function sameValue(a: RuinsPreferencesValue, b: RuinsPreferencesValue) {
  return (
    a.bootAnimation === b.bootAnimation &&
    a.paperTexture === b.paperTexture &&
    a.scanline === b.scanline
  );
}

/** Current preferences straight from storage (defaults when unavailable). */
export function readRuinsPreferences(): RuinsPreferencesValue {
  try {
    return parsePreferences(
      getStorage()?.getItem(RUINS_PREFERENCES_STORAGE_KEY) ?? null,
    );
  } catch {
    return DEFAULT_RUINS_PREFERENCES;
  }
}

/** Local calendar day as `YYYY-MM-DD`. */
export function getLocalDateString(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Local date (`YYYY-MM-DD`) of the last boot sequence, if any. */
export function readLastBootDate(): string | null {
  try {
    const value = getStorage()?.getItem(RUINS_BOOT_LAST_STORAGE_KEY);
    return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeLastBootDate(date: string = getLocalDateString()): void {
  try {
    getStorage()?.setItem(RUINS_BOOT_LAST_STORAGE_KEY, date);
  } catch {
    // Best effort: the sequence may simply run again.
  }
}

/*
 * In-memory store. `useSyncExternalStore` needs a stable snapshot, so the value
 * is cached and only replaced when it actually changes. It is refreshed from
 * storage on first use, on `storage` events (other tabs) and on every write.
 */
let current: RuinsPreferencesValue | null = null;
const listeners = new Set<() => void>();
let storageListenerAttached = false;

function emit() {
  for (const listener of [...listeners]) listener();
}

function refreshFromStorage() {
  const next = readRuinsPreferences();
  if (current && sameValue(current, next)) return;
  current = next;
  emit();
}

function handleStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== RUINS_PREFERENCES_STORAGE_KEY) return;
  refreshFromStorage();
}

function getSnapshot(): RuinsPreferencesValue {
  if (current === null) current = readRuinsPreferences();
  return current;
}

function getServerSnapshot(): RuinsPreferencesValue {
  return DEFAULT_RUINS_PREFERENCES;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!storageListenerAttached && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageEvent);
    storageListenerAttached = true;
  }
  // Pick up writes that happened while nothing was subscribed.
  refreshFromStorage();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && storageListenerAttached) {
      window.removeEventListener("storage", handleStorageEvent);
      storageListenerAttached = false;
    }
  };
}

function updatePreferences(patch: Partial<RuinsPreferencesValue>) {
  const next = { ...getSnapshot(), ...patch };
  if (sameValue(getSnapshot(), next)) return;

  current = next;
  try {
    getStorage()?.setItem(RUINS_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The choice still applies for this session.
  }
  emit();
}

export type RuinsPreferences = RuinsPreferencesValue & {
  setBootAnimation: (value: RuinsBootAnimation) => void;
  setPaperTexture: (value: boolean) => void;
  setScanline: (value: boolean) => void;
};

/**
 * Per-device Ruins options (`gn-ruins-prefs` in localStorage). Components update
 * live through a `useSyncExternalStore` subscription; the server snapshot is
 * always the defaults so SSR output is stable.
 */
export function useRuinsPreferences(): RuinsPreferences {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setBootAnimation = useCallback(
    (bootAnimation: RuinsBootAnimation) => updatePreferences({ bootAnimation }),
    [],
  );
  const setPaperTexture = useCallback(
    (paperTexture: boolean) => updatePreferences({ paperTexture }),
    [],
  );
  const setScanline = useCallback(
    (scanline: boolean) => updatePreferences({ scanline }),
    [],
  );

  return { ...value, setBootAnimation, setPaperTexture, setScanline };
}
