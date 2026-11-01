import { useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";
import { createContext, PropsWithChildren, useContext, useState } from "react";

const ViewActiveContext = createContext(true);

export function IonViewActiveProvider({ children }: PropsWithChildren) {
  const [isActive, setIsActive] = useState(false);

  // Pushing auth during the page's entry transition can be ignored by Ionic.
  useIonViewDidEnter(() => setIsActive(true));
  useIonViewWillLeave(() => setIsActive(false));

  return (
    <ViewActiveContext.Provider value={isActive}>
      {children}
    </ViewActiveContext.Provider>
  );
}

export function useIonViewActive() {
  return useContext(ViewActiveContext);
}
