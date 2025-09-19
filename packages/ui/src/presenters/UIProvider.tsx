import React, { createContext, useContext, useMemo } from "react";
import { ActivityItemProps, DetailsBoxProps } from "#@/components";

/**
 * The registry of components that can be replaced at runtime
 * by the apps consuming this library.
 */
export type PresenterRegistry = {
  DetailsBox: React.ComponentType<DetailsBoxProps>;
  ActivityItem: React.ComponentType<ActivityItemProps>;
};

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
