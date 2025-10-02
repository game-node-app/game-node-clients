import React, { createContext, useContext } from "react";
import { PresenterRegistry } from "#@/presenters/registry.ts";

const PresenterContext = createContext<Partial<PresenterRegistry>>({});

export const UIProvider = ({
  presenters,
  children,
}: {
  presenters?: Partial<PresenterRegistry>;
  children: React.ReactNode;
}) => {
  return (
    <PresenterContext.Provider value={presenters ?? {}}>
      {children}
    </PresenterContext.Provider>
  );
};

export function usePresenters() {
  return useContext(PresenterContext);
}

/**
 * Use a version of a presenter that has been overridden by the app.
 * @param key
 */
export function usePresenter<K extends keyof PresenterRegistry>(key: K) {
  const presenters = usePresenters();
  return presenters[key];
}
