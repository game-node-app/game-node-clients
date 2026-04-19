import { spotlight } from "@mantine/spotlight";
import { TGameOrSearchGame } from "@repo/ui";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type CommandCenterModal = "preferredPlatforms" | "gameAddEditForm";

interface CommandCenterModalState {
  modal: CommandCenterModal | null;
  payload: TGameOrSearchGame | null;
}

interface CommandCenterContextValue extends CommandCenterModalState {
  openModal: (
    modal: CommandCenterModal,
    payload: TGameOrSearchGame | null,
  ) => void;
  closeModal: () => void;
}

const CommandCenterContext = createContext<CommandCenterContextValue>({
  openModal: () => {},
  closeModal: () => {},
  modal: null,
  payload: null,
});

export const CommandCenterContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [state, setState] = useState<CommandCenterModalState | null>(null);

  const closeModal = useCallback(() => {
    setState(null);
  }, []);

  const openModal = useCallback(
    (modal: CommandCenterModal, payload: TGameOrSearchGame | null) => {
      console.log("Opening modal:", modal, "with payload:", payload);
      spotlight.close();

      requestAnimationFrame(() => {
        setState({ modal, payload });
      });
    },
    [],
  );

  const value = useMemo<CommandCenterContextValue>(
    () => ({
      modal: state?.modal ?? null,
      payload: state?.payload ?? null,
      openModal,
      closeModal,
    }),
    [state, openModal, closeModal],
  );

  return (
    <CommandCenterContext.Provider value={value}>
      {children}
    </CommandCenterContext.Provider>
  );
};

export function useCommandCenterContext() {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error(
      "useCommandCenterContext must be used within a CommandCenterContextProvider",
    );
  }
  return context;
}
