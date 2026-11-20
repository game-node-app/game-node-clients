import React, {
  createContext,
  createElement,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { UIProvider, useHooks, usePresenters } from "#@/context/UIProvider";
import type { UIPresenterRegistry } from "#@/context/registry";
import type {
  ThemeExperienceId,
  ThemeId,
  ThemeScreensId,
} from "./generated/catalog";
import {
  DEFAULT_THEME_CATALOG,
  type ThemeCatalog,
  type ThemeStorage,
} from "./runtime";
import { EMPTY_THEME_PACK, type ThemePackShell } from "./packs/types";
import { themePackStore as defaultThemePackStore } from "./packs/defaults";
import type { ThemePackStore } from "./packs/store";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type AppliedPacks = {
  experience: ThemeExperienceId;
  screens: ThemeScreensId | null;
};

type AppliedPacksStore = {
  get(): AppliedPacks;
  getServer(): AppliedPacks;
  set(next: AppliedPacks): void;
  subscribe(listener: () => void): () => void;
};

function createAppliedPacksStore(initial: AppliedPacks): AppliedPacksStore {
  let value = initial;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    getServer: () => value,
    set(next) {
      if (
        value.experience === next.experience &&
        value.screens === next.screens
      ) {
        return;
      }
      value = next;
      for (const listener of [...listeners]) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

type PackGateComponent = React.LazyExoticComponent<
  React.ComponentType<{ children?: React.ReactNode }>
>;

/**
 * `React.lazy` is the supported way to suspend a client component on a module
 * import. The gate resolves after the pack store has the pack and renders its
 * children; failures resolve to the empty fallback (never reject).
 *
 * Gates are cached per store so a Suspense retry keeps the same lazy component
 * (and its resolved module) instead of creating a new one.
 */
const lazyPackGates = new WeakMap<
  ThemePackStore,
  Map<string, PackGateComponent>
>();

function getLazyPackGate(
  store: ThemePackStore,
  kind: "experience" | "screens",
  id: string,
): PackGateComponent {
  let gates = lazyPackGates.get(store);
  if (!gates) {
    gates = new Map();
    lazyPackGates.set(store, gates);
  }

  const key = `${kind}:${id}`;
  const existing = gates.get(key);
  if (existing) return existing;

  const gate = React.lazy(async () => {
    await store.load(kind, id);
    const Ready = ({ children }: { children?: React.ReactNode }) => (
      <>{children}</>
    );
    return { default: Ready };
  });
  gates.set(key, gate);
  return gate;
}

type PackGates = {
  experience?: PackGateComponent;
  screens?: PackGateComponent;
};

function createInitialPackGates(
  store: ThemePackStore,
  experience: ThemeExperienceId,
  screens: ThemeScreensId | null,
): PackGates {
  return {
    experience: store.isLoaded("experience", experience)
      ? undefined
      : getLazyPackGate(store, "experience", experience),
    screens:
      screens && !store.isLoaded("screens", screens)
        ? getLazyPackGate(store, "screens", screens)
        : undefined,
  };
}

export type AppThemeContextValue = {
  themeId: ThemeId;
  setTheme: (theme: ThemeId) => void;
  /** Experience currently rendered. Stays on the current one while a pack loads. */
  experience: ThemeExperienceId;
  /** Theme screens currently rendered (null while the target has none). */
  screens: ThemeScreensId | null;
  /** True while the selected theme's experience/screens are still loading. */
  isExperiencePending: boolean;
  /** Shell slots from the currently rendered packs, if an experience provides them. */
  shell?: ThemePackShell;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export type AppThemeProviderProps = {
  children: React.ReactNode;
  /**
   * Theme the server rendered with. The first client render uses it so
   * hydration matches; the stored theme is applied in a layout effect after.
   * When omitted, `data-theme-ssr` on `<html>` is used on the client.
   */
  initialTheme?: string | null;
  /** Ignores storage and makes `setTheme` a no-op (admin stays on the default). */
  pinned?: boolean;
  /** Overrides the app hook. `null` disables persistence. */
  themeStorage?: ThemeStorage | null;
  /** App-specific defaults that experience and screen packs can replace. */
  fallbackPresenters?: Partial<UIPresenterRegistry>;
  /** Catalog override for tests/experiments; defaults to the generated catalog. */
  catalog?: ThemeCatalog;
  /** Isolated pack store for tests; defaults to the app-wide store. */
  packStore?: ThemePackStore;
  /** Client-only apps can render the default layout if preloading times out. */
  suspendOnInitialPack?: boolean;
  /** Rendered while the first pack import is in flight (SSR/mobile cold start). */
  fallback?: React.ReactNode;
};

function readSsrThemeAttribute(): string | null {
  if (typeof document === "undefined") return null;
  return document.documentElement.getAttribute("data-theme-ssr");
}

function persistTheme(storage: ThemeStorage | null, themeId: ThemeId) {
  if (!storage) return;

  try {
    const result = storage.set(themeId);
    if (result && typeof (result as PromiseLike<void>).then === "function") {
      void Promise.resolve(result).catch(() => {
        // Storage is best effort: never block or crash a theme switch.
      });
    }
  } catch {
    // Same contract as an async rejection.
  }
}

/**
 * Owns the active theme and resolves the active experience/screen packs.
 *
 * SSR contract: with `initialTheme` set (dynamic pages pass the cookie value
 * through `_app`), the provider suspends on the theme's `import()` inside its
 * `Suspense` boundary. Next's Pages Router renderPage reads the stream with
 * `allReady`, so the server waits for the pack and renders the final layout.
 *
 * Client changes: the theme colors apply immediately; presenters and
 * `useAppExperience()` keep the currently rendered packs until the new ones
 * resolve, then switch at once. A failed import resolves to an empty pack, so
 * the app keeps the default presenters/layout with the new theme's colors.
 */
export function AppThemeProvider({
  children,
  initialTheme,
  pinned = false,
  themeStorage,
  fallbackPresenters,
  catalog = DEFAULT_THEME_CATALOG,
  packStore = defaultThemePackStore,
  suspendOnInitialPack = true,
  fallback = null,
}: AppThemeProviderProps) {
  const hooks = useHooks();
  const storage =
    themeStorage === undefined ? (hooks.themeStorage ?? null) : themeStorage;

  const [themeId, setThemeId] = useState<ThemeId>(() =>
    resolveInitialTheme(catalog, initialTheme),
  );
  const entry = catalog.get(themeId);

  // Re-render when a pack settles (success or cached failure).
  useSyncExternalStore(
    packStore.subscribe,
    packStore.getVersion,
    packStore.getVersion,
  );

  const experienceLoaded = packStore.isLoaded("experience", entry.experience);
  const screensLoaded = packStore.isLoaded("screens", entry.screens);
  const experienceFailed =
    experienceLoaded &&
    packStore.getError("experience", entry.experience) !== null;
  const screensFailed =
    screensLoaded && packStore.getError("screens", entry.screens) !== null;

  // An experience import failure falls back to the default layout and drops the
  // screens too, so a broken console chunk never leaks a half-themed screen.
  const targetExperience: ThemeExperienceId = experienceFailed
    ? "default"
    : entry.experience;
  const targetScreens: ThemeScreensId | null =
    experienceFailed || screensFailed ? null : entry.screens;
  const targetLoaded =
    (experienceFailed || experienceLoaded) &&
    (targetScreens === null || screensLoaded);

  const [appliedStore] = useState(() =>
    createAppliedPacksStore({
      experience: suspendOnInitialPack ? entry.experience : "default",
      screens: suspendOnInitialPack ? entry.screens : null,
    }),
  );
  const applied = useSyncExternalStore(
    appliedStore.subscribe,
    appliedStore.get,
    appliedStore.getServer,
  );

  // Gates are chosen once, for the theme of the first render, and stay in the
  // tree. Once resolved they are pass-through components, so later theme
  // changes never remount the app subtree or suspend a user-triggered change.
  const [initialGates] = useState(() =>
    suspendOnInitialPack
      ? createInitialPackGates(packStore, entry.experience, entry.screens)
      : {},
  );

  const effectiveExperience = targetLoaded
    ? targetExperience
    : applied.experience;
  const effectiveScreens = targetLoaded ? targetScreens : applied.screens;
  const isExperiencePending =
    !targetLoaded &&
    (targetExperience !== applied.experience ||
      targetScreens !== applied.screens);

  // Remember what is actually rendered so the next theme change can keep it
  // until its own packs resolve. External store: no cascading render warning.
  useIsomorphicLayoutEffect(() => {
    if (!targetLoaded) return;
    appliedStore.set({
      experience: targetExperience,
      screens: targetScreens,
    });
  }, [appliedStore, targetExperience, targetLoaded, targetScreens]);

  const setTheme = useCallback(
    (next: ThemeId) => {
      if (pinned) return;

      const resolved = catalog.get(next).id;
      if (resolved === themeId) return;

      setThemeId(resolved);
      persistTheme(storage, resolved);
    },
    [catalog, pinned, storage, themeId],
  );

  const [mounted, setMounted] = useState(!suspendOnInitialPack);

  // The first client render must match the server-rendered theme. The stored
  // value wins after hydration, in a layout effect, before paint where possible.
  const restoredRef = useRef(false);
  const pendingStoredRef = useRef<ThemeId | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (pinned) return;
    if (!storage) return;

    let stored: string | null = null;
    try {
      stored = storage.get();
    } catch {
      return;
    }
    if (stored == null) return;

    const resolved = catalog.get(stored).id;
    if (resolved === themeId) return;

    pendingStoredRef.current = resolved;
    if (!suspendOnInitialPack || targetLoaded) {
      // The initial packs are already rendered; switch without blanking.
      setMounted(true);
      setThemeId(resolved);
    }
  }, [catalog, pinned, storage, suspendOnInitialPack, targetLoaded, themeId]);

  useIsomorphicLayoutEffect(() => {
    if (mounted || !targetLoaded) return;
    setMounted(true);

    const pending = pendingStoredRef.current;
    if (pending && pending !== themeId) {
      setThemeId(pending);
    }
  }, [mounted, targetLoaded, themeId]);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    // Leave the pre-paint palette in place during the first hydration commit.
    const pending = pendingStoredRef.current;
    if (pending && pending !== themeId) return;
    pendingStoredRef.current = null;
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.experience = effectiveExperience;
  }, [effectiveExperience]);

  const experiencePack = packStore.peek("experience", effectiveExperience);
  const screensPack = effectiveScreens
    ? packStore.peek("screens", effectiveScreens)
    : undefined;

  const shell = useMemo<ThemePackShell | undefined>(() => {
    if (!experiencePack?.shell && !screensPack?.shell) return undefined;
    return {
      ...experiencePack?.shell,
      ...screensPack?.shell,
    };
  }, [experiencePack, screensPack]);

  const contextValue = useMemo<AppThemeContextValue>(
    () => ({
      themeId,
      setTheme,
      experience: effectiveExperience,
      screens: effectiveScreens,
      isExperiencePending,
      shell,
    }),
    [
      effectiveExperience,
      effectiveScreens,
      isExperiencePending,
      setTheme,
      shell,
      themeId,
    ],
  );

  return (
    <AppThemeContext.Provider value={contextValue}>
      <Suspense fallback={fallback}>
        <ThemePackGate
          allowSuspend={!mounted}
          experience={entry.experience}
          screens={entry.screens}
          gates={initialGates}
          store={packStore}
        >
          <ThemePresenterHost
            experience={effectiveExperience}
            screens={effectiveScreens}
            store={packStore}
            fallbackPresenters={fallbackPresenters}
          >
            {children}
          </ThemePresenterHost>
        </ThemePackGate>
      </Suspense>
    </AppThemeContext.Provider>
  );
}

function resolveInitialTheme(
  catalog: ThemeCatalog,
  initialTheme: string | null | undefined,
): ThemeId {
  if (initialTheme != null) return catalog.get(initialTheme).id;

  const ssrTheme = readSsrThemeAttribute();
  if (ssrTheme != null) return catalog.get(ssrTheme).id;

  return catalog.defaultId;
}

/**
 * Keeps the initial lazy gates in the tree: they suspend during SSR/hydration
 * and become pass-through components once resolved, so later theme changes
 * never remount the subtree. After the first commit, starts the imports for
 * the currently selected theme while the provider keeps the current screen.
 */
function ThemePackGate({
  allowSuspend,
  experience,
  screens,
  gates,
  store,
  children,
}: {
  allowSuspend: boolean;
  experience: ThemeExperienceId;
  screens: ThemeScreensId | null;
  gates: PackGates;
  store: ThemePackStore;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (allowSuspend) return;
    void store.load("experience", experience);
    void store.load("screens", screens);
  }, [allowSuspend, experience, screens, store]);

  let content = children;
  if (gates.screens) {
    content = createElement(gates.screens, null, content);
  }
  if (gates.experience) {
    content = createElement(gates.experience, null, content);
  }

  return <>{content}</>;
}

/**
 * A pack may replace a platform's screen defaults. Explicit platform overrides
 * still win (for example, the Ionic modal and routing link).
 */
function ThemePresenterHost({
  experience,
  screens,
  store,
  fallbackPresenters,
  children,
}: {
  experience: ThemeExperienceId;
  screens: ThemeScreensId | null;
  store: ThemePackStore;
  fallbackPresenters?: Partial<UIPresenterRegistry>;
  children: React.ReactNode;
}) {
  const appPresenters = usePresenters();
  const hooks = useHooks();

  const experiencePack =
    store.peek("experience", experience) ?? EMPTY_THEME_PACK;
  const screensPack =
    (screens ? store.peek("screens", screens) : undefined) ?? EMPTY_THEME_PACK;

  const presenters = useMemo(
    () => ({
      ...fallbackPresenters,
      ...experiencePack.presenters,
      ...screensPack.presenters,
      ...appPresenters,
    }),
    [
      appPresenters,
      fallbackPresenters,
      experiencePack.presenters,
      screensPack.presenters,
    ],
  );

  return (
    <UIProvider presenters={presenters} hooks={hooks}>
      {children}
    </UIProvider>
  );
}

function useAppThemeContext(): AppThemeContextValue {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("App theme hooks must be used inside an AppThemeProvider.");
  }
  return context;
}

/** `[theme, setTheme]`; `theme` is always a valid catalog id. */
export function useAppTheme(): readonly [ThemeId, (theme: ThemeId) => void] {
  const context = useAppThemeContext();
  return [context.themeId, context.setTheme];
}

/**
 * Experience currently rendered. While the next pack loads it stays on the
 * current one, so the shell never switches to a layout without its components.
 */
export function useAppExperience(): ThemeExperienceId {
  return useAppThemeContext().experience;
}

/** Theme screens currently rendered. */
export function useAppThemeScreens(): ThemeScreensId | null {
  return useAppThemeContext().screens;
}

/** True while the selected theme's packs are loading. */
export function useIsAppExperiencePending(): boolean {
  return useAppThemeContext().isExperiencePending;
}

/** Shell slots provided by the active experience/screens, when any. */
export function useAppThemeShell(): ThemePackShell | undefined {
  return useAppThemeContext().shell;
}
