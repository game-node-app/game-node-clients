import React, { createContext, useContext } from "react";
import {
  ShareFilePayload,
  UIHookRegistry,
  UIPresenterRegistry,
} from "#@/context/registry.ts";
import { downloadFile } from "#@/util/downloadFile";

interface UIProviderContext {
  presenters: Partial<UIPresenterRegistry>;
  hooks: UIHookRegistry;
}

const DEFAULT_CONTEXT_VALUE: UIProviderContext = {
  presenters: {},
  hooks: {
    useRouter: () => {
      return {
        back: () => {},
        pathname: "",
        push: async () => {},
        query: new URLSearchParams(),
      };
    },
  },
};

const PresenterContext = createContext<UIProviderContext>(
  DEFAULT_CONTEXT_VALUE,
);

export const UIProvider = ({
  presenters,
  hooks,
  children,
}: {
  presenters?: Partial<UIPresenterRegistry>;
  hooks: UIHookRegistry;
  children: React.ReactNode;
}) => {
  const value = React.useMemo(
    () =>
      Object.freeze({
        presenters: presenters ?? DEFAULT_CONTEXT_VALUE.presenters,
        hooks: hooks ?? DEFAULT_CONTEXT_VALUE.hooks,
      }),
    [presenters, hooks],
  );

  return (
    <PresenterContext.Provider value={value}>
      {children}
    </PresenterContext.Provider>
  );
};

export function usePresenters() {
  return useContext(PresenterContext).presenters;
}

export function useHooks() {
  return useContext(PresenterContext).hooks;
}

/**
 * Use a version of a presenter that has been overridden by the app.
 * @param key
 */
export function usePresenter<K extends keyof UIPresenterRegistry>(key: K) {
  const presenters = usePresenters();
  return presenters[key];
}

export function useAuthPath() {
  return useHooks().authPath ?? "/auth";
}

const useNoGameSearch = (): undefined => undefined;

/**
 * Opens the game search, or `undefined` when the app has no search to open. The registered hook
 * never changes for the lifetime of an app, so choosing it here keeps hook order stable.
 */
export function useOpenGameSearch(): (() => void) | undefined {
  const { useOpenGameSearch: override } = useHooks();
  return (override ?? useNoGameSearch)();
}

const useSplashAlwaysDone = (): boolean => true;

/**
 * Whether the app's launch splash is gone. Always true unless the app registers `useEntrySplashDone`.
 * The registered hook never changes for the lifetime of an app, so choosing it here keeps hook order stable.
 */
export function useEntrySplashDone(): boolean {
  const { useEntrySplashDone: override } = useHooks();
  return (override ?? useSplashAlwaysDone)();
}

/** Whether game reads may resolve the viewer's custom covers. Defaults to true. */
export function usePersonalizeGameCovers() {
  return useHooks().personalizeGameCovers ?? true;
}

/**
 * Opens an external URL (Stripe Checkout/Customer Portal). The app can replace
 * the browser navigation with a native in-app browser.
 */
export function useOpenExternalUrl() {
  const { openExternalUrl } = useHooks();

  return (
    openExternalUrl ??
    ((url: string) => {
      window.location.assign(url);
    })
  );
}

/** Opens the share sheet; the app can replace the Web Share API with a native one. */
export function useShareText() {
  const { shareText } = useHooks();
  return (
    shareText ??
    (async (text: string) => {
      if (!navigator.share) throw new Error("Sharing is not supported");
      try {
        await navigator.share({ text });
        return true;
      } catch (error) {
        if ((error as Error).name === "AbortError") return false;
        throw error;
      }
    })
  );
}

/**
 * Opens the share sheet for a generated file. The app can replace the Web Share
 * API with a native one (Capacitor's Share on mobile).
 */
export function useShareFile() {
  const { shareFile } = useHooks();
  return (
    shareFile ??
    (async ({ file, title, text, url }: ShareFilePayload) => {
      if (!navigator.share) throw new Error("Sharing is not supported");
      try {
        await navigator.share({ files: [file], title, text, url });
        return true;
      } catch (error) {
        if ((error as Error).name === "AbortError") return false;
        throw error;
      }
    })
  );
}

/**
 * Saves a generated file. On the web this is the browser download; the mobile
 * app stores it in the documents folder instead (see `saveFile` in the hook
 * registry) and resolves to `true` so the caller can confirm it.
 */
export function useSaveFile() {
  const { saveFile } = useHooks();
  return (
    saveFile ??
    (async (file: File) => {
      downloadFile(file);
      return false;
    })
  );
}
