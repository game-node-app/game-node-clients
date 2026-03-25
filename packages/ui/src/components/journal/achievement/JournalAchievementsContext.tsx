import React, { createContext, PropsWithChildren, useContext } from "react";

interface JournalAchievementsContextProps {
  userId: string | undefined;
  layout: "compact" | "detailed";
}

export const JournalAchievementsContextValue =
  createContext<JournalAchievementsContextProps>({
    layout: "compact",
    userId: undefined,
  });

export function useJournalAchievementsContext() {
  return useContext(JournalAchievementsContextValue);
}

const JournalAchievementsContext = (
  props: PropsWithChildren<JournalAchievementsContextProps>,
) => {
  return (
    <JournalAchievementsContextValue.Provider value={props}>
      {props.children}
    </JournalAchievementsContextValue.Provider>
  );
};

export { JournalAchievementsContext };
