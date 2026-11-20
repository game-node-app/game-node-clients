import { Preferences } from "@capacitor/preferences";
import {
  DEFAULT_THEME_ID,
  isThemeId,
  resolveThemeId,
  type ThemeId,
  type ThemeStorage,
} from "@repo/ui";

/** Same key as the web cookie, so the value has one name across the apps. */
export const THEME_STORAGE_KEY = "gn-theme";

/**
 * Preferences is a native plugin call; a cold start must not wait forever for
 * it. The localStorage mirror is read synchronously, so this only bounds how
 * long we give the authoritative native value before falling back.
 */
export const THEME_RESTORE_TIMEOUT_MS = 500;

type PreferencesLike = {
  get(options: { key: string }): Promise<{ value: string | null }>;
  set(options: { key: string; value: string }): Promise<void>;
};

type MirrorStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type MobileThemeStorage = ThemeStorage & {
  /** Waits for the queued Preferences writes (tests/troubleshooting). */
  flush(): Promise<void>;
};

/**
 * Every Preferences write in this module shares one queue: a restore catch-up
 * and a user switch can never land out of order on the native side.
 */
let preferenceWrites: Promise<void> = Promise.resolve();

function queuePreferenceWrite(
  preferences: PreferencesLike,
  themeId: string,
): Promise<void> {
  preferenceWrites = preferenceWrites
    .then(
      () => preferences.set({ key: THEME_STORAGE_KEY, value: themeId }),
      () => preferences.set({ key: THEME_STORAGE_KEY, value: themeId }),
    )
    .then(
      () => undefined,
      () => undefined,
    );

  return preferenceWrites;
}

function getDefaultStorage(): MirrorStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Storage can be disabled (private mode, embedded web views).
    return null;
  }
}

/**
 * Synchronous read of the localStorage mirror. Every selection is mirrored
 * before the Preferences write, so this is also what a failed/pending plugin
 * write leaves behind.
 */
export function readMirroredTheme(
  storage: MirrorStorage | null = getDefaultStorage(),
): ThemeId | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return isThemeId(value) ? value : null;
  } catch {
    return null;
  }
}

function writeMirroredTheme(
  storage: MirrorStorage | null,
  themeId: ThemeId,
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // Best effort, same as the Capacitor write below.
  }
}

/** Never rejects. Resolves `undefined` after `timeoutMs` or on rejection. */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(undefined);
      },
    );
  });
}

export type RestoreThemeOptions = {
  preferences?: PreferencesLike;
  storage?: MirrorStorage | null;
  timeoutMs?: number;
};

/**
 * Restores the theme before the first render, bounded by
 * {@link THEME_RESTORE_TIMEOUT_MS}.
 *
 * localStorage is written synchronously before every Preferences write, so if
 * both exist and disagree the mirror holds the newest selection (the native
 * write is stalled or failed). Preferences remains the source for a fresh
 * install or a cleared WebView storage.
 */
export async function restoreThemePreference({
  preferences = Preferences,
  storage = getDefaultStorage(),
  timeoutMs = THEME_RESTORE_TIMEOUT_MS,
}: RestoreThemeOptions = {}): Promise<ThemeId> {
  const mirrored = readMirroredTheme(storage);

  let stored: string | null = null;
  let preferenceResolved = false;
  try {
    const result = await withTimeout(
      preferences.get({ key: THEME_STORAGE_KEY }),
      timeoutMs,
    );
    if (result !== undefined) {
      stored = result.value;
      preferenceResolved = true;
    }
  } catch {
    // Missing plugin/permission: the mirror below still restores the theme.
  }

  if (mirrored) {
    if (preferenceResolved && stored !== mirrored) {
      // Catch-up for a write that did not reach Preferences last session. It
      // goes through the same queue as later user switches.
      void queuePreferenceWrite(preferences, mirrored);
    }
    return mirrored;
  }

  if (isThemeId(stored)) {
    writeMirroredTheme(storage, stored);
    return stored;
  }

  if (stored != null) {
    // A removed/unknown id must never leak into the app: fall back to default.
    writeMirroredTheme(storage, DEFAULT_THEME_ID);
    return DEFAULT_THEME_ID;
  }

  return DEFAULT_THEME_ID;
}

export type CreateMobileThemeStorageOptions = {
  preferences?: PreferencesLike;
  storage?: MirrorStorage | null;
};

/**
 * Storage adapter injected into `AppThemeProvider`. `get` is synchronous (the
 * localStorage mirror); `set` mirrors immediately and serializes the native
 * writes so a rapid Xbox → Dark → Xbox sequence cannot land out of order.
 */
export function createMobileThemeStorage({
  preferences = Preferences,
  storage = getDefaultStorage(),
}: CreateMobileThemeStorageOptions = {}): MobileThemeStorage {
  return {
    get() {
      return readMirroredTheme(storage);
    },

    set(themeId) {
      const resolved = resolveThemeId(themeId);
      writeMirroredTheme(storage, resolved);
      return queuePreferenceWrite(preferences, resolved);
    },

    flush() {
      return preferenceWrites;
    },
  };
}

export const mobileThemeStorage = createMobileThemeStorage();
