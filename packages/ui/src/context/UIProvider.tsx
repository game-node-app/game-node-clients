import React, { createContext, useContext } from "react";
import { UIHookRegistry, UIPresenterRegistry } from "#@/context/registry.ts";

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
